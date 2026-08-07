# Plan — `Proto3RuntimeResolver`: Proto3 definition into a `@grpc/grpc-js` runtime

## Context

We build a runtime counterpart to `zodToProto()`. Today a `ReadOnlyProto3File` is
rendered to `.proto` text by `Proto3FileProcessor`; we now render the same definition to
live `protobufjs` reflection objects plus a `@grpc/grpc-js` `ServiceDefinition` per
service, with `requestSerialize` / `requestDeserialize` / `responseSerialize` /
`responseDeserialize` wired to protobufjs `encode` / `decode`. Every feature the Proto3
definition can express — messages, enums, scalars, `repeated`, `map`, `oneof`,
`optional`, imported types, streaming rpc — must be reflected in the runtime. Values
crossing the boundary are converted to the JS shapes the Zod schemas were written in:
enum names as strings, oneofs as `{ $case, value }`, field keys camelCased. Done = a
`Proto3RuntimeDefinition` whose service definitions can be handed straight to
`makeClientConstructor` / `server.addService`, and `bun run typecheck` passes.

## Analysis

Facts gathered from the codebase and from the installed `protobufjs@8.0.0` sources.
Dependencies were not installed when this plan was written; `bun install` has since been
run, so `node_modules/` is populated.

### The definition model to walk

- `ReadOnlyProto3File` (`src/proto3_definition/types/file.ts`) holds `packageName`,
  `services`, `unscopedMessages`, `extensions`, and exposes `propagateTypePrefix()`,
  `getDeepMessages()`, `getDeepImportedTypes()`.
- `ReadOnlyProto3RpcService` (`.../service.ts`) holds `name` and `functions`.
- `ReadOnlyProto3RpcFunction` (`.../functions.ts`) holds `name`, `in`, `inStream`, `out`,
  `outStream`. `in` / `out` are `ReadOnlyAnyProto3Message | ReadOnlyProto3ImportedType`.
- `ReadOnlyProto3Message` / `ReadOnlyProto3Enum` (`.../messages.ts`) hold `id`, `name`,
  `fields`. `Proto3Enum.fields` are `Proto3EnumField` with `key` and `index`.
- `ReadOnlyProto3MessageField` (`.../fields.ts`) holds `key`, `index`, `optionalState`
  (`'PRESENT' | 'NONE' | 'NOT_NEEDED'`) and `type`.
- `ReadOnlyProto3MessageOneOfField` holds `key` and `subFields`; each sub-field is a
  `Proto3MessageOneOfFieldSubField` with its own `key` / `index` / `type`.
- Field types are `Proto3DynamicSizeType | Proto3ScalarType | AnyProto3Message |
  Proto3ImportedType`. `Proto3RepeatedType.inner` may itself be `repeated`;
  `Proto3MapType` has `key` (scalar) and `value`.
- Every node is discriminated by `internalName`, and the codebase matches on it with
  `ts-pattern`'s `match(...).with(...).exhaustive()`.

### The pattern to imitate

`src/proto3_processor/classes/` splits one class per concern —
`Proto3FileProcessor` → `Proto3ServiceProcessor` → `Proto3FunctionProcessor`,
and `Proto3MessageProcessor` → `Proto3FieldProcessor`. Each takes its output sink in the
constructor and exposes `process(...)`. The runtime resolvers mirror that split, taking
their accumulator in the constructor and exposing `resolve(...)`.

Two behaviours of `Proto3FileProcessor.process()` must be replicated:

- It calls `file.propagateTypePrefix()` first (line 109). The runtime must too, or type
  names will not match the ones in the generated `.proto`.
- It flattens `file.getDeepMessages()` and de-duplicates by `id` with a `reduceRight`
  (lines 78-88), because `getDeepMessages()` returns a message once per reference. The
  runtime needs the same de-duplication or `Namespace.add` throws `duplicate name`.

`Proto3FieldProcessor.getTypeReferenceString()` (line 30) is the model for resolving a
field type to a name; the runtime version returns a protobufjs type reference instead of
proto source text, and must not emit the `repeated` prefix inline.

### What the Zod side expects back (this drives the conversion table)

- **Field keys are snake_cased on the way in.** `zod_message_field_converter.ts:65` and
  `zod_message_one_of_field_converter.ts:91` both do `key: snakeCase(key)`. The snapshot
  shows `fullName` becoming `full_name`. The runtime re-derives with `camelCase()`.
- **Oneofs are ts-proto `oneof=unions-value`.** `src/zod/types/zod_one_of_union.ts:4-7`
  documents this explicitly, and `oneOfUnion()` builds
  `z.discriminatedUnion('$case', [z.object({ $case: z.literal(name), value: schema })])`.
  So proto `oneof task { SynchronizeUsersTask synchronize_users = 1; }` corresponds to
  `{ $case: 'synchronizeUsers', value: {...} }`.
- **Enums are Zod string enums**, so they convert to/from their names, not their ids.
- **`int64` is ambiguous.** `ZodScalarConverter` reaches `Proto3Int64Type` from two
  different Zod types: `z.int()` (a JS `number`, format `safeint`, lines 61-64) and
  `z.int64()` (a JS `bigint`, format `int64`, line 84). The Proto3 definition keeps no
  record of which. Per decision, the runtime always decodes 64-bit integers to `number`
  and carries a one-line comment saying so. See Points of Attention.

### protobufjs 8 facts that constrain the implementation

- **Imperatively built types get proto2 semantics.** `ReflectionObject` sets
  `_defaultEdition = 'proto2'` (`src/object.js:65`); `Type.fromJSON`, `Field.fromJSON`,
  `Enum.fromJSON` and `Service.fromJSON` each overwrite it with `'proto3'`
  (`src/type.js:277`, `src/field.js:41`, `src/enum.js:115`, `src/service.js:63`).
  `Namespace.add` pins the edition on insert (`src/namespace.js:276-278`). Measured on
  `repeated int32 values = 1` with `[1,2,3]`: imperative gives `08 01 08 02 08 03`
  (unpacked, proto2), `Root.fromJSON` gives `0a 03 01 02 03` (packed, proto3). We
  therefore build a `protobuf.INamespace` descriptor and call `protobuf.Root.fromJSON`.
- **`src/test.ts` does not do what it looks like.** `new protobuf.Field(name, id, type,
  { rule: 'required' })` — an object in the 4th slot is parsed as *options*, not a rule
  (`src/field.js:59-63`), so `{ repeated: true }` never took effect. And
  `new protobuf.OneOf('task', [Field, Field])` expects field *names*, not `Field`
  instances (`src/oneof.js:21-31`), so that oneof never linked. The file is exploratory
  and is superseded by this work.
- **Instance overrides of `encode` / `decode` propagate into nested and repeated
  fields.** `Type.setup()` binds `types[]` to resolved child `Type` *instances*
  (`src/type.js:459-460`) and the generated codecs dispatch through them at call time —
  `types[i].encode(...)` (`src/encoder.js:20`), `types[i].decode(...)`
  (`src/decoder.js:93-101`). Verified: overriding a child type's `encode`/`decode` fired
  3 times each when a parent held one nested and two repeated occurrences of it. Two
  constraints follow: install overrides only **after** `resolveAll()`, and never mutate a
  type afterwards, because `clearCache()` does `delete type.encode`
  (`src/type.js:212-217`).
- **A `Message` re-converts on `JSON.stringify`.** `Message.prototype.toJSON` runs
  `toObject`, which would undo our conversion. Since every type we generate gets its
  `decode` overridden to return a plain object, top-level results are plain objects and
  the problem does not arise — but it is the reason the override must be installed on
  request/response types too, not only on nested ones.
- **Virtual oneof accessors exist on the message prototype** (`src/type.js:183-184`), so
  inside a `decode` override `message[oneof.name]` yields the name of the field that is
  set, or `undefined`.
- **Well-known google types are bundled** as JSON under
  `protobuf.common['google/protobuf/empty.proto']` etc. (`src/common.js:27-31`), covering
  `any`, `duration`, `empty`, `field_mask`, `struct`, `timestamp`, `wrappers`.
  `Proto3Empty.useType()` (`src/plugin/types/google_protobuf.ts`) is the one the library
  emits by default, as `protoVoidType`. Adding several of them is safe: plain namespaces
  merge on `Namespace.add` rather than colliding (`src/namespace.js:248-267`).
- **Absolute type references start with a dot.** `Namespace.lookup` routes to the root
  when the first path segment is empty (`src/namespace.js:409-410`).

### grpc-js contract

`node_modules/@grpc/grpc-js/build/src/make-client.d.ts:5-30`: `Serialize<T>` returns
`Buffer` and `Deserialize<T>` takes `Buffer`, so `writer.finish()` (a `Uint8Array`) must
be wrapped in `Buffer.from(...)`. `ServiceDefinition` is a plain record of
`MethodDefinition`. `@grpc/proto-loader` keys that record by the *original* method name
and sets `originalName` to the camelCase form
(`node_modules/@grpc/proto-loader/build/src/index.js:115-132`); we follow that. nice-grpc
accepts a grpc-js definition directly via `CompatServiceDefinition`
(`node_modules/nice-grpc/src/service-definitions/index.ts:56-60`), so no separate output
is needed for it.

### Repository conventions

- Path aliases live in `tsconfig.alias.json` and are consumed by `tsconfig.json` and by
  `vitest.config.ts` through `vite-tsconfig-paths`. A new top-level `src/` folder needs an
  entry there.
- `index.ts` is a generated barrel (`bun run prepare:index`, glob `./src/**/*.ts`
  excluding `*.test.ts`, sorted by path).
- `tsconfig.compiler.json` enables `strict`, `noUnusedLocals`, `noUnusedParameters`,
  `noUncheckedIndexedAccess`, `noPropertyAccessFromIndexSignature`.
- `.claude/rules.md`: no comments unless they state something undeducible from the code;
  documentation ships in the same commit as the change; one concern per commit.
- Existing comments in this codebase use the `////` prefix for prose lines.

### Pre-existing failure

`bun run typecheck` is **already red** before any change:

    src/test.ts(97,7): error TS6133: 'grpcServiceDefinition' is declared but its value is never read.
    src/test.ts(141,7): error TS6133: 'nicegrpcServiceDefinition' is declared but its value is never read.

Step 11 resolves it.

### TODO_FOR_LLM

A search for `TODO_FOR_LLM` across the repository matched only `.claude/skills/**`
documentation, never source. There are no `TODO_FOR_LLM` tasks to schedule. Two plain
`TODO:` comments exist in scope — `src/test.ts:116` / `:134` (`.toJSON() utile?`, answered
by the conversion layer in Step 7, and removed with the file in Step 11) and
`src/proto3_definition/types/scalars.ts:40` (unrelated, left alone).

## Files Touched (at a glance)

| #  | File | Action | One-line summary |
|----|------|--------|------------------|
| 1  | `tsconfig.alias.json` | modify | Register the `#proto3_runtime/*` path alias |
| 2  | `src/proto3_runtime/types/runtime.ts` | create | `Proto3RuntimeDefinition` output type |
| 3  | `src/proto3_runtime/classes/proto3_runtime_field_resolver.ts` | create | Field into `IField` / `IMapField` + type references |
| 4  | `src/proto3_runtime/classes/proto3_runtime_message_resolver.ts` | create | Message / enum into `IType` / `IEnum` |
| 5  | `src/proto3_runtime/classes/proto3_runtime_service_resolver.ts` | create | Service into `IService` |
| 6  | `src/proto3_runtime/classes/proto3_runtime_descriptor_resolver.ts` | create | File into a `protobuf.INamespace` |
| 7  | `src/proto3_runtime/classes/proto3_runtime_codec_resolver.ts` | create | Install JS-shape `encode` / `decode` overrides |
| 8  | `src/proto3_runtime/classes/proto3_runtime_resolver.ts` | create | Orchestrator producing grpc-js service definitions |
| 9  | `src/usage/helpers/get_full_usage_settings.ts` | create | Extract the `UsageSettings` defaulting block |
| 10 | `src/usage/helpers/zod_to_proto.ts` | modify | Use the extracted helper |
| 11 | `src/usage/helpers/zod_to_runtime.ts` | create | Public `zodToRuntime()` entry point |
| 12 | `src/test.ts` | delete | Superseded exploratory file; unblocks the typecheck |
| 13 | `index.ts` | modify | Barrel entries for the new files, drop `./src/test` |
| 14 | `.docs/4-usage.md` | modify | Document `zodToRuntime()` + regenerate `README.md` |
| 15 | `.docs/5-compatibility.md` | modify | Document the runtime conversion table |

## Implementation Steps

### Step 1 — Register the `#proto3_runtime/*` path alias

- **File:** `tsconfig.alias.json` (modify)
- **What:** Add one entry to `compilerOptions.paths`, between the existing
  `#proto3_processor/*` and `#usage/*` keys, so the new folder is importable the same way
  every other `src/` folder is.
- **How:** Match the existing formatting exactly (4-space indent, trailing commas are
  already used in this file):

      "#proto3_processor/*": ["./src/proto3_processor/*"],
      "#proto3_runtime/*": ["./src/proto3_runtime/*"],
      "#usage/*": ["./src/usage/*"],

- **Depends on:** none
- **Verify (by inspection):** `paths` contains `#proto3_runtime/*` mapped to
  `./src/proto3_runtime/*`, keys stay alphabetically ordered, and the surrounding entries
  are untouched. Both `tsconfig.json` and `vitest.config.ts` already consume this file, so
  no other config changes.

### Step 2 — Declare the resolver output type

- **File:** `src/proto3_runtime/types/runtime.ts` (create)
- **What:** Export `Proto3RuntimeDefinition`, the value `Proto3RuntimeResolver.resolve()`
  returns: the built `protobuf.Root` and one grpc-js `ServiceDefinition` per Proto3
  service, keyed by fully-qualified service name (for example
  `services.synchronization.v1.SynchronizationService`). The root is exposed because
  callers need it to look types up for tests, reflection, or a gateway.
- **How:** A plain type module — no `new` factory, because this is a resolver output and
  not a definition node, so the `GetNewParams` convention in `#proto3_definition` does not
  apply.

      import type { ServiceDefinition } from '@grpc/grpc-js'
      import type * as protobuf from 'protobufjs'

      export type Proto3RuntimeDefinition = {
          root: protobuf.Root
          services: Readonly<Record<string, ServiceDefinition>>
      }

- **Depends on:** Step 1
- **Verify (by inspection):** The file exports exactly one type; `ServiceDefinition` is
  imported from `@grpc/grpc-js` and `protobuf` as a namespace type import; the `services`
  record is keyed by string.

### Step 3 — Resolve a message field into a protobufjs field descriptor

- **File:** `src/proto3_runtime/classes/proto3_runtime_field_resolver.ts` (create)
- **What:** Add `Proto3RuntimeFieldResolver` with a public
  `resolve(field: ReadOnlyProto3MessageField | ReadOnlyProto3MessageOneOfFieldSubField):
  protobuf.IField | protobuf.IMapField`, plus a private
  `getTypeReference(type: ReadOnlyProto3MessageFieldType): string`. The constructor takes
  the imported-type accumulator so every imported type used in a *payload* position is
  recorded as it is encountered.
- **How:** Mirror `Proto3FieldProcessor.getTypeReferenceString()`
  (`src/proto3_processor/classes/proto3_field_processor.ts:30`) but return protobufjs
  references. Rules, in `ts-pattern` style with `.exhaustive()`:
  - the fifteen scalar `internalName`s return `scalarType.name` verbatim — protobufjs uses
    the same spellings (`string`, `bool`, `int32`, …, `bytes`);
  - `message` / `enum` return `message.name` — every message is hoisted flat into the
    package namespace by Step 6, so a bare name resolves;
  - `imported_type` pushes onto the accumulator and returns `.${imported.typeReference}`,
    the leading dot forcing absolute lookup from the root
    (`node_modules/protobufjs/src/namespace.js:409-410`);
  - `repeated` and `map` are *not* handled here — they are shape, not reference, and are
    handled by `resolve()` below.

  `resolve()` then builds the descriptor:

      const base = { id: field.index }

      match(field.type)
          .with({ internalName: 'map' }, (map) => ({
              ...base,
              keyType: map.key.name,
              type: this.getTypeReference(map.value),
          }))
          .with({ internalName: 'repeated' }, (repeated) => ({
              ...base,
              rule: 'repeated',
              type: this.getTypeReference(repeated.getDeepInnerType()),
          }))
          .otherwise((type) => ({
              ...base,
              type: this.getTypeReference(type),
              ...(field.optionalState === 'PRESENT'
                  ? { options: { proto3_optional: true } }
                  : {}),
          }))

  `getDeepInnerType()` already unwraps nested `repeated` layers
  (`src/proto3_definition/types/dynamic_size.ts:209-221`). Note the `optionalState`
  branch: proto3 has no `required`, and protobufjs treats every non-`LEGACY_REQUIRED`
  field as optional for encoding purposes (`src/field.js:191-206`), so `NONE` and
  `NOT_NEEDED` need no rule at all.
- **Depends on:** Step 2
- **Verify (by inspection):** Map fields carry `keyType` and no `rule`; repeated fields
  carry `rule: 'repeated'` and the *unwrapped* inner reference; `PRESENT` fields carry
  `options.proto3_optional`; imported references are dot-prefixed and every one of them
  has been pushed onto the accumulator; the scalar match arm is `.exhaustive()` over all
  fifteen scalar names, matching the list in `Proto3FieldProcessor`.

### Step 4 — Resolve a message or enum into a protobufjs type descriptor

- **File:** `src/proto3_runtime/classes/proto3_runtime_message_resolver.ts` (create)
- **What:** Add `Proto3RuntimeMessageResolver` with
  `resolve(message: ReadOnlyAnyProto3Message): protobuf.IType | protobuf.IEnum`. It
  delegates each field to `Proto3RuntimeFieldResolver` and assembles `fields` and
  `oneofs`. The constructor takes the same imported-type accumulator and forwards it.
- **How:** Follow `Proto3MessageProcessor.process()`
  (`src/proto3_processor/classes/proto3_message_processor.ts:33`), matching on
  `internalName`:
  - `'enum'` returns `{ values: Object.fromEntries(messageEnum.fields.map((field) =>
    [field.key, field.index])) }`;
  - `'message'` walks `message.fields`. A `message_field` becomes one entry in `fields`. A
    `message_one_of_field` becomes one entry in `oneofs` listing its sub-field keys, plus
    one entry in `fields` per sub-field — this is the descriptor shape `Type.fromJSON`
    expects, which adds fields first and links the oneof afterwards
    (`node_modules/protobufjs/src/type.js:241-251`).

      const fields: Record<string, protobuf.IField> = {}
      const oneofs: Record<string, protobuf.IOneOf> = {}

      for (const field of message.fields) {
          if (field.internalName === 'message_field') {
              fields[field.key] = fieldResolver.resolve(field)

              continue
          }

          oneofs[field.key] = { oneof: field.subFields.map((sub) => sub.key) }

          for (const subField of field.subFields) {
              fields[subField.key] = fieldResolver.resolve(subField)
          }
      }

      return Object.keys(oneofs).length > 0 ? { fields, oneofs } : { fields }

  Extensions and comments are deliberately not carried over: they are `.proto` source
  concerns (field options and documentation) with no effect on the wire format. See Points
  of Attention.
- **Depends on:** Step 3
- **Verify (by inspection):** Enum descriptors expose `values` as a name-to-id record
  starting at 0, matching `Proto3Enum.computeNewIndexForFields`
  (`src/proto3_definition/types/messages.ts:254-272`). Oneof sub-fields appear both in
  `fields` (with their own ids) and, by key, in the `oneofs[...].oneof` array. A message
  with no oneof emits no `oneofs` key.

### Step 5 — Resolve a service into a protobufjs service descriptor

- **File:** `src/proto3_runtime/classes/proto3_runtime_service_resolver.ts` (create)
- **What:** Add `Proto3RuntimeServiceResolver` with
  `resolve(service: ReadOnlyProto3RpcService): protobuf.IService`, one `methods` entry per
  `Proto3RpcFunction`, keyed by the function's original name. The constructor takes the
  imported-type accumulator, because an rpc's `in` / `out` may be an imported type — which
  is the default, since `protoVoidType` is `Proto3Empty.useType()`
  (`src/usage/helpers/zod_to_proto.ts:23`).
- **How:** Mirror `Proto3FunctionProcessor.getTypeReferenceString()`
  (`src/proto3_processor/classes/proto3_function_processor.ts:22`) for the in/out
  reference, with the same imported-type handling as Step 3:

      private getTypeReference(
          item: ReadOnlyAnyProto3Message | ReadOnlyProto3ImportedType
      ): string {
          return match(item)
              .returnType<string>()
              .with(
                  { internalName: 'enum' },
                  { internalName: 'message' },
                  (message) => message.name
              )
              .with({ internalName: 'imported_type' }, (imported) => {
                  this.importedTypes.push(imported)

                  return `.${imported.typeReference}`
              })
              .exhaustive()
      }

  and each method descriptor:

      methods[rpcFunction.name] = {
          requestType: this.getTypeReference(rpcFunction.in),
          requestStream: rpcFunction.inStream,
          responseType: this.getTypeReference(rpcFunction.out),
          responseStream: rpcFunction.outStream,
      }

- **Depends on:** Step 3
- **Verify (by inspection):** Method keys are the unmodified `Proto3RpcFunction.name`
  (PascalCase, e.g. `PostAsyncTasks`); `requestStream` / `responseStream` come straight
  from `inStream` / `outStream` so both streaming directions survive; an imported in/out
  is dot-prefixed and recorded on the accumulator.

### Step 6 — Resolve the file into a protobufjs namespace descriptor

- **File:** `src/proto3_runtime/classes/proto3_runtime_descriptor_resolver.ts` (create)
- **What:** Add `Proto3RuntimeDescriptorResolver` with
  `resolve(file: ReadOnlyProto3File): { descriptor: protobuf.INamespace; importPaths:
  readonly string[] }`. It owns the imported-type accumulator, nests the package segments,
  and places every de-duplicated message and every service inside.
- **How:** Build the innermost `nested` record first, then wrap it in the package
  segments. De-duplicate exactly as `Proto3FileProcessor.getMessageContent()` does
  (`src/proto3_processor/classes/proto3_file_processor.ts:78-88`) — by `id`, with
  `reduceRight`:

      const importedTypes: ReadOnlyProto3ImportedType[] = []
      const messageResolver = new Proto3RuntimeMessageResolver(importedTypes)
      const serviceResolver = new Proto3RuntimeServiceResolver(importedTypes)

      const messages = file
          .getDeepMessages()
          .reduceRight((accumulator, message) => {
              if (accumulator.some((item) => item.id === message.id)) {
                  return accumulator
              }

              return [...accumulator, message]
          }, [] as ReadOnlyAnyProto3Message[])

      const nested: Record<string, protobuf.AnyNestedObject> = {}

      for (const message of messages) {
          nested[message.name] = messageResolver.resolve(message)
      }

      for (const service of file.services) {
          nested[service.name] = serviceResolver.resolve(service)
      }

  Then fold the dotted package name from the inside out:

      const descriptor = file.packageName
          .split('.')
          .reduceRight<protobuf.INamespace>(
              (accumulator, segment) => ({ nested: { [segment]: accumulator } }),
              { nested }
          )

  Finally de-duplicate the accumulated `importedTypes` by `importPath` and return those
  paths alongside the descriptor. `file.getDeepMessages()` covers messages reached through
  services *and* `unscopedMessages` (`src/proto3_definition/types/file.ts:52-59`), so both
  are included. Do **not** use `file.getDeepImportedTypes()` to collect imports — it also
  returns extension keys such as `buf.validate.field`
  (`src/proto3_definition/types/fields.ts:92-99`), which are field options with no runtime
  descriptor and must not be resolved. Collecting during traversal, as Steps 3 and 5 do,
  yields only payload-position imports.
- **Depends on:** Steps 4, 5
- **Verify (by inspection):** `resolve()` does not itself call `propagateTypePrefix()`
  (Step 8 owns that, mirroring `Proto3FileProcessor.process()`); messages appear once each
  despite `getDeepMessages()` repeating them; the descriptor nests one level per dot in
  `packageName`; the returned `importPaths` contain `google/protobuf/empty.proto` for a
  default file and never `buf/validate/validate.proto`.

### Step 7 — Install the JS-shape `encode` / `decode` overrides

- **File:** `src/proto3_runtime/classes/proto3_runtime_codec_resolver.ts` (create)
- **What:** Add `Proto3RuntimeCodecResolver`, constructed with the resolved
  `protobuf.Root` and the package name, exposing `install(): void`. For every
  `protobuf.Type` *under the package namespace*, it calls `setup()`, captures the
  generated codecs, and replaces `encode` / `decode` with wrappers that translate between
  the JS shape and the protobufjs shape. This is the file that answers the
  `// TODO: .toJSON() utile?` questions in `src/test.ts:116` and `:134`.
- **How:** Walk `root.lookup(packageName)`'s `nestedArray` recursively, collecting
  `protobuf.Type` instances. Types outside the package — the well-known google types added
  in Step 8 — are deliberately left with protobufjs's native behaviour. Then per type:

      type.setup()

      const encode = type.encode.bind(type)
      const decode = type.decode.bind(type)

      type.encode = ((value, writer) =>
          encode(this.intoProtoShape(type, value), writer)) as protobuf.Type['encode']

      type.decode = ((reader, length) =>
          this.intoJsShape(type, decode(reader, length))) as unknown as protobuf.Type['decode']

  The `as unknown as` on `decode` is required: the declared return type is
  `Message<{}>` (`node_modules/protobufjs/index.d.ts:1704`) and we return a plain object.

  `intoProtoShape(type, value)` builds a record keyed by proto field names:
  - for each `oneof` of `type.oneofsArray`, read `value[camelCase(oneof.name)]`; when it is
    a `{ $case, value }` object, find the member field whose name equals
    `snakeCase($case)` and set that single key to the converted `value`;
  - for each field of `type.fieldsArray` where `field.partOf === null`, read
    `value[camelCase(field.name)]`; skip `undefined`; otherwise set `field.name`;
  - conversion of a single value: when `field.resolvedType` is a `protobuf.Enum`, map the
    string through `resolvedType.values`; when it is a `protobuf.Type`, **pass the value
    through untouched** — that type's own `encode` override converts it; scalars pass
    through, since protobufjs's writer already accepts a `number` for 64-bit fields;
  - `field.map` iterates the record's entries converting only the values (map keys are
    data, never field names, so they are **not** camelCased); `field.repeated` maps over
    the array.

  `intoJsShape(type, message)` is the mirror:
  - for each `oneof` of `type.oneofsArray`, the virtual accessor
    (`node_modules/protobufjs/src/type.js:183-184`) gives the active field name:

        const activeKey = message[oneof.name]

        if (activeKey !== undefined) {
            result[camelCase(oneof.name)] = {
                $case: camelCase(activeKey),
                value: this.intoJsValue(field, message[activeKey]),
            }
        }

  - for each field with `field.partOf === null`, use
    `Object.prototype.hasOwnProperty.call(message, field.name)` for presence. When absent
    and the field is `proto3_optional`, omit the key; when absent otherwise, emit the
    proto3 default (`0`, `''`, `false`) so schemas with required fields still parse;
    repeated and map fields are always emitted, as `[]` / `{}` when empty — the generated
    constructor already seeds them (`node_modules/protobufjs/src/type.js:200-208`);
  - enums map back through `resolvedType.valuesById`; under `noUncheckedIndexedAccess`
    that indexing yields `string | undefined`, so fall back to the raw numeric value;
  - 64-bit integers arrive as `Long` objects and are converted with `.toNumber()`. This is
    the one place that needs a comment, and it gets exactly one line in the `////` style
    the codebase already uses:

        //// z.int() and z.int64() both convert to int64, so bigint fields lose precision past 2^53

  - nested messages, and the elements of repeated/map fields of message type, pass through
    untouched — the child's own `decode` override already returned the JS shape.
- **Depends on:** Step 2
- **Verify (by inspection):** `setup()` is called before the generated codecs are captured,
  and the captured functions are bound to the type. Nested message values are never
  converted by the parent in either direction — only enums, 64-bit integers, field names
  and oneofs are rewritten, so recursion happens through the child's own override. Map keys
  are left verbatim while map values are converted. Only types under `packageName` are
  touched. The `int64` comment is present, one line, and states the constraint rather than
  restating the code.

### Step 8 — Add the orchestrating `Proto3RuntimeResolver`

- **File:** `src/proto3_runtime/classes/proto3_runtime_resolver.ts` (create)
- **What:** Add `Proto3RuntimeResolver` with
  `resolve(file: ReadOnlyProto3File): Proto3RuntimeDefinition`. It propagates type
  prefixes, builds the descriptor, registers the well-known imported types, resolves the
  root, installs the codecs, and assembles one grpc-js `ServiceDefinition` per service.
- **How:** Sequence, mirroring `Proto3FileProcessor.process()`:

      public resolve(file: ReadOnlyProto3File): Proto3RuntimeDefinition {
          file = file.propagateTypePrefix()

          const { descriptor, importPaths } = new Proto3RuntimeDescriptorResolver().resolve(file)
          const root = protobuf.Root.fromJSON(descriptor)

          for (const importPath of importPaths) {
              root.addJSON(this.getCommonNested(importPath))
          }

          root.resolveAll()

          new Proto3RuntimeCodecResolver(root, file.packageName).install()

          ...
      }

  `getCommonNested(importPath)` reads the bundled descriptor and throws a message naming
  what could not be resolved. `protobuf.common` is typed as a function plus an interface-only
  namespace (`node_modules/protobufjs/index.d.ts:11-13`), so the bundled files need a cast
  to be read by key:

      const commonFiles = protobuf.common as unknown as Record<string, protobuf.INamespace | undefined>
      const commonFile = commonFiles[importPath]

      if (commonFile?.nested === undefined) {
          throw new Error(
              `Cannot resolve imported type from "${importPath}" at runtime: only the protobufjs well-known types are bundled`
          )
      }

  Adding several common files is safe — plain namespaces merge on `add`
  (`node_modules/protobufjs/src/namespace.js:248-267`) — and `resolveAll()` must come
  after every `addJSON`.

  Then per service, keyed by fully-qualified name, with the `@grpc/proto-loader`
  convention of an original-name key plus a camelCase `originalName`
  (`node_modules/@grpc/proto-loader/build/src/index.js:115-132`):

      const fullName = `${file.packageName}.${service.name}`
      const runtimeService = root.lookupService(fullName)

      for (const rpcFunction of service.functions) {
          const method = runtimeService.methods[rpcFunction.name]
          const requestType = method?.resolvedRequestType
          const responseType = method?.resolvedResponseType

          if (requestType == null || responseType == null) {
              throw new Error(`Cannot resolve runtime types for "${fullName}/${rpcFunction.name}"`)
          }

          definition[rpcFunction.name] = {
              path: `/${fullName}/${rpcFunction.name}`,
              originalName: camelCase(rpcFunction.name),
              requestStream: rpcFunction.inStream,
              responseStream: rpcFunction.outStream,
              requestSerialize: (value) => Buffer.from(requestType.encode(value).finish()),
              requestDeserialize: (bytes) => requestType.decode(bytes),
              responseSerialize: (value) => Buffer.from(responseType.encode(value).finish()),
              responseDeserialize: (bytes) => responseType.decode(bytes),
          }
      }

  `Buffer.from` is required because `finish()` returns `Uint8Array` while grpc-js
  `Serialize<T>` is declared to return `Buffer`
  (`node_modules/@grpc/grpc-js/build/src/make-client.d.ts:5-7`). The `method?.` and
  null checks satisfy `noUncheckedIndexedAccess` and protobufjs's
  `resolvedRequestType: Type | null`. `camelCase` comes from `change-case`, already a
  dependency and already used across `src/zod_converter/classes/`.
- **Depends on:** Steps 6, 7
- **Verify (by inspection):** `propagateTypePrefix()` is called first; `resolveAll()`
  happens after every `addJSON` and before `install()`; each method's `path` is
  `/<package>.<Service>/<Method>`; keys are the original function names with `originalName`
  camelCased; serialize wraps in `Buffer.from`; an unbundled import produces the explicit
  error rather than a protobufjs internal one.

### Step 9 — Extract the `UsageSettings` defaulting block

- **File:** `src/usage/helpers/get_full_usage_settings.ts` (create)
- **What:** Add `getFullUsageSettings(settings?: Partial<UsageSettings>): UsageSettings`
  holding the block currently inlined in `zodToProto()`, so the new entry point does not
  duplicate it.
- **How:** Move the object literal verbatim from `src/usage/helpers/zod_to_proto.ts:16-24`,
  keeping every default identical:

      export const getFullUsageSettings = function (
          settings?: Partial<UsageSettings>
      ): UsageSettings {
          return {
              conversionReuseStrategies:
                  settings?.conversionReuseStrategies ?? getDefaultConversionReuseStrategies(),
              transformers: settings?.transformers ?? getFullTransformers(),
              transformationReuseStrategies:
                  settings?.transformationReuseStrategies ??
                  getDefaultTransformationReuseStrategies(),
              protoVoidType: settings?.protoVoidType ?? Proto3Empty.useType(),
          }
      }

- **Depends on:** none
- **Verify (by inspection):** All four defaults are byte-identical to the ones in
  `zod_to_proto.ts` today, including `Proto3Empty.useType()` for `protoVoidType`. The
  helper follows the `export const … = function (…)` style used by every other file in
  `src/usage/helpers/`.

### Step 10 — Point `zodToProto` at the extracted helper

- **File:** `src/usage/helpers/zod_to_proto.ts` (modify)
- **What:** Replace the inline `fullSettings` literal with a call to
  `getFullUsageSettings(settings)`, and drop the imports that become unused as a result.
- **How:** The body becomes:

      export const zodToProto = function (
          raw: Proto3RawFile,
          settings?: Partial<UsageSettings>
      ): string {
          const file = Proto3RawFile.into(raw, getFullUsageSettings(settings))

          const processor = new Proto3FileProcessor()
          const fileContent = processor.process(file)
          const fileBuilder = new FileBuilder(fileContent)

          return fileBuilder.compute()
      }

  The imports of `Proto3Empty`, `getFullTransformers`,
  `getDefaultConversionReuseStrategies` and `getDefaultTransformationReuseStrategies`
  become orphans of this change and are removed; `FileBuilder`,
  `Proto3FileProcessor`, `Proto3RawFile` and the `UsageSettings` type stay.
- **Depends on:** Step 9
- **Verify (by inspection):** `zodToProto`'s signature and return value are unchanged; only
  the settings construction moved; no import remains that the file no longer references
  (`noUnusedLocals` would otherwise fail at the end).

### Step 11 — Add the `zodToRuntime` entry point

- **File:** `src/usage/helpers/zod_to_runtime.ts` (create)
- **What:** Add `zodToRuntime(raw: Proto3RawFile, settings?: Partial<UsageSettings>):
  Proto3RuntimeDefinition`, the runtime sibling of `zodToProto()`, so callers go from a Zod
  raw file to grpc-js definitions without touching Proto3 internals.
- **How:** Same shape as `zodToProto()`, swapping the processor for the resolver:

      export const zodToRuntime = function (
          raw: Proto3RawFile,
          settings?: Partial<UsageSettings>
      ): Proto3RuntimeDefinition {
          const file = Proto3RawFile.into(raw, getFullUsageSettings(settings))

          const resolver = new Proto3RuntimeResolver()

          return resolver.resolve(file)
      }

- **Depends on:** Steps 8, 9
- **Verify (by inspection):** The function mirrors `zodToProto()` line for line apart from
  the resolver and the return type; it takes the same `Proto3RawFile` and optional
  `Partial<UsageSettings>`.

### Step 12 — Delete the superseded exploratory file

- **File:** `src/test.ts` (delete)
- **What:** Remove the file. It is hand-written scratch work for exactly this feature, it
  is re-exported into the package's public API by the barrel, and its two unused consts are
  the sole reason `bun run typecheck` is red today. Its two `// TODO: .toJSON() utile?`
  questions are answered by Step 7.
- **How:** Delete the file outright. Nothing imports it — the only reference is
  `export * from './src/test'` in `index.ts`, removed in Step 13. Confirm with a search for
  `from '#*/test'` and `src/test` before deleting. If the file should be kept instead, the
  minimal alternative is to `export` the two consts so `noUnusedLocals` is satisfied — but
  note that keeps demonstrably broken protobufjs usage (see Analysis) in the published
  surface.
- **Depends on:** Step 8
- **Verify (by inspection):** The file is gone and no source file references it. The two
  `TS6133` errors quoted in the Analysis can no longer be produced.

### Step 13 — Update the generated barrel

- **File:** `index.ts` (modify)
- **What:** Add one `export * from` line per new file, and remove
  `export * from './src/test'`.
- **How:** The barrel is generated by `bun run prepare:index` from the glob
  `./src/**/*.ts` sorted by path, so insert the new lines in the position that command
  would put them — the `proto3_runtime` block goes after the last
  `proto3_processor/classes/*` line and where `./src/test` used to be:

      export * from './src/proto3_runtime/classes/proto3_runtime_codec_resolver'
      export * from './src/proto3_runtime/classes/proto3_runtime_descriptor_resolver'
      export * from './src/proto3_runtime/classes/proto3_runtime_field_resolver'
      export * from './src/proto3_runtime/classes/proto3_runtime_message_resolver'
      export * from './src/proto3_runtime/classes/proto3_runtime_resolver'
      export * from './src/proto3_runtime/classes/proto3_runtime_service_resolver'
      export * from './src/proto3_runtime/types/runtime'

  and in the `usage/helpers` block, `get_full_usage_settings` after
  `get_full_transformers`, and `zod_to_runtime` after `zod_to_proto`. Running
  `bun run prepare:index` instead of editing by hand is equivalent and preferable if the
  generator is available.
- **Depends on:** Steps 2-12
- **Verify (by inspection):** Every new file has exactly one barrel entry, `./src/test` is
  gone, and the list stays in the sorted order the generator produces — otherwise the next
  `bun run prepare:index` will churn the file.

### Step 14 — Document the runtime entry point

- **File:** `.docs/4-usage.md` (modify)
- **What:** Add a `### gRPC runtime` section after the existing `### gRPC Service` section
  (which starts at line 50), showing `zodToRuntime()` and how the result plugs into
  `@grpc/grpc-js`. Then regenerate `README.md`, which is built from these files.
- **How:** Follow the shape of the neighbouring sections: a short lead sentence, a `ts`
  block with the call, and a **Result:** block. Cover the call itself, the
  `services` record keyed by fully-qualified service name, and passing a definition to
  `server.addService(...)` / `makeClientConstructor(...)`. State the JS shapes the codecs
  produce, because they are what a reader will get wrong: enum names as strings, oneofs as
  `{ $case, value }`, camelCase keys, 64-bit integers as `number`. Reference the package
  name interpolation style already used in the docs (`{{ pkg.name }}` in
  `.docs/3-quick-start.md`). Then run `bun run generate:readme` so `README.md` picks the
  new section up — the file is generated from `.blueprint.md`, which `load:`s each
  `.docs/*.md` in order.
- **Depends on:** Step 11
- **Verify (by inspection):** The new section sits inside `## Usage` at `###` depth,
  matching its neighbours; the example compiles against the signature written in Step 11;
  `README.md` contains the new section after regeneration.

### Step 15 — Document the runtime conversion table

- **File:** `.docs/5-compatibility.md` (modify)
- **What:** Add a `### Runtime` section documenting the JS-to-proto value mapping the
  codecs apply, alongside the existing `### Zod` (line 3), `### Proto3` (line 42),
  `### Protovalidate` (line 60) and `### Google` (line 67) sections.
- **How:** A table of proto type to JS type — `string`/`bool`/`bytes`, the 32-bit numerics
  as `number`, the 64-bit numerics as `number` **with the precision caveat stated
  explicitly**, enums as their string names, `repeated` as arrays, `map` as records with
  verbatim keys, `oneof` as `{ $case, value }`, and `optional` as an omitted key. Also state
  that field keys are camelCase at runtime and snake_case in the `.proto`, and that only
  the protobufjs well-known google types resolve at runtime.
- **Depends on:** Step 14
- **Verify (by inspection):** The 64-bit row names the `z.int()` / `z.int64()` ambiguity as
  the reason, so a reader hitting a precision bug finds the explanation here rather than
  in the source comment.

## Points of Attention

- **The `int64` decision is a workaround for what looks like a converter bug, not a
  preference.** `ZodScalarConverter` maps `z.int()` (JS `number`) to `Proto3Int64Type` with
  the comment *"int64 because int can be int32 or int64"* (line 62), and `z.int64()` (JS
  `bigint`) to the same `Proto3Int64Type` (line 84). Two distinct JS types collapse onto
  one proto scalar, so no runtime can be correct for both. Decoding everything to `number`
  is right for `z.int()` and silently corrupts `z.int64()` values above 2^53. The clean
  fix is upstream — either carry a JS-type hint on `Proto3ScalarType`, or map `z.int()` to
  `int32`/`sint64` rather than reusing `int64`. Worth a follow-up issue; out of scope here.
- **`camelCase()` re-derivation is not a guaranteed round-trip.** The converter applies
  `snakeCase()` and the runtime inverts it. That is exact for ordinary camelCase keys but
  not for acronyms: a Zod key `HTTPRequest` becomes `http_request` becomes `httpRequest`.
  Same risk for oneof `$case` values. Recording the original key on the definition would
  remove it entirely.
- **Extensions and comments are intentionally dropped.** `buf.validate` annotations and
  doc comments are `.proto` source concerns with no wire-format effect, so they have no
  place in the runtime descriptor. The consequence is that Protovalidate constraints are
  **not** enforced by the runtime codecs — validation stays a server-side concern, exactly
  as it is with a `.proto` compiled by `buf`.
- **Only well-known google imports resolve.** `Proto3ImportedType` is open-ended, but
  protobufjs bundles only `any`, `duration`, `empty`, `field_mask`, `struct`, `timestamp`
  and `wrappers`. Anything else used in a payload position throws in Step 8. This is fine
  today because `Proto3Empty` is the only imported payload type the library emits, but a
  user-supplied one will hit it. If that becomes a real need, the natural extension is an
  optional `extraTypes: protobuf.INamespace` parameter on the resolver — deliberately not
  built now.
- **Overrides are fragile against later mutation.** `clearCache()` does `delete type.encode`
  (`node_modules/protobufjs/src/type.js:212-217`), so adding or removing a field on a type
  after Step 7 has run silently reverts it to protobufjs's native codec. Nothing in this
  design mutates the tree post-`install()`, but anything added later must not.
- **Name collisions surface as protobufjs errors.** Two messages sharing a name after
  prefix propagation make `Namespace.add` throw `duplicate name`. The `.proto` output has
  the same defect today, so this is parity rather than a regression — but the runtime fails
  loudly at build time where the text output fails only at `protoc` time.
- **`google.protobuf.Timestamp` and friends keep protobufjs's native shapes.** Step 7
  installs overrides only on types under the package namespace, so a field of an imported
  well-known type expects protobufjs's representation (`{ seconds, nanos }`) rather than a
  converted one. Only `Empty` is reachable today, where the distinction is moot.
- **No tests are specified.** `vitest` is configured and
  `src/usage/helpers/zod_to_proto.test.ts` snapshots the text output, so a
  `zod_to_runtime.test.ts` asserting an encode/decode round-trip over the oneof + repeated
  + enum + optional fixture would be the natural counterpart. Adding it is not part of this
  plan — say so if you want it folded in.
- **Commit boundaries.** Per `.claude/rules.md`, this is not one commit: Steps 9-10 (the
  `getFullUsageSettings` extraction) are a refactor with no behaviour change and belong on
  their own; Step 12 (deleting `src/test.ts`) is its own concern; Steps 1-8 plus 11 plus 13
  are the feature; Steps 14-15 travel *with* the feature commit, not after it.

## Final Verification

- Run the typecheck once, at the very end: `bun run typecheck`. It must exit clean.
  Note the baseline is currently **failing** with two `TS6133` errors in `src/test.ts`, so
  "clean" here means those are gone (Step 12) and no new errors were introduced — not
  merely "no worse than before".
- Individual steps are confirmed by inspection during execution — no per-step test or build
  runs.
