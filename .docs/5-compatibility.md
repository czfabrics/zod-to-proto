## Compatibility

### Zod

| Zod Type                | Interpreted as                                                     | Notice                                                                                                                                                               |
| ----------------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Primitif Types**      |                                                                    |                                                                                                                                                                      |
| `ZodString`             | `string`                                                           |                                                                                                                                                                      |
| `ZodStringFormat`       | `string`                                                           | Format is ignored, but can be handled by a transformer.                                                                                                              |
| `ZodLiteral`            | `string`                                                           | Value is ignored, but can be handled by a transformer.                                                                                                               |
| `ZodTemplateLiteral`    | `string`                                                           | Template is ignored, but can be handled by a transformer.                                                                                                            |
| `ZodNumber`             | `double`                                                           |                                                                                                                                                                      |
| `ZodNumberFormat`       | `int32`<br>`float32`<br>`float64`<br>`uint32`                      | The conversion result depends on the format of the `ZodNumberFormat`.<br>(Format `safeint` is interpreted as `int64`)                                                |
| `ZodBigInt`             | `int64`<br>`uint64`                                                | Depends on the format.                                                                                                                                               |
| `ZodBoolean`            | `bool`                                                             |                                                                                                                                                                      |
| ~~`ZodDate`~~           | Not handled                                                        | Use a `ZodCodec` with a `string` input and convert it to a JS `Date` instead.                                                                                        |
| **Structure Types**     |                                                                    |                                                                                                                                                                      |
| `ZodObject`             | `message Some {}`                                                  |                                                                                                                                                                      |
| `ZodEnum`               | `enum Some {}`                                                     |                                                                                                                                                                      |
| `ZodRecord`             | `map<{key type}, {value type}>`                                    | Not all Zod types are supported due to Proto limitations.<br>Keys can be an integer or a string.<br>Values can be any types except array or another map.             |
| ~~`ZodMap`~~            | Not handled                                                        | Use `ZodRecord` instead.                                                                                                                                             |
| `ZodArray`              | `repeated {}`                                                      | Not all Zod types are supported due to Proto limitations.<br>Elements can be any types except map.                                                                   |
| `ZodSet`                | `repeated {}`                                                      | Not all Zod types are supported due to Proto limitations.<br>Elements can be any types except map.                                                                   |
| **Other Types**         |                                                                    |                                                                                                                                                                      |
| `ZodOptional`           | `optional {some_type} my_field = 1`                                | Internally uses Zod's `safeParse` to determine if the schema is optional.                                                                                            |
| `ZodNonOptional`        | `{some_type} my_field = 1 [(buf.validate.field).required = true];` | Internally uses Zod's `safeParse` to determine if the schema is optional.                                                                                            |
| `ZodIntersection`       | `message Some {}`                                                  | **Only works with `ZodObject`**<br>Uses the left `ZodObject` to extend the right one.                                                                                |
| `ZodPipe`               |                                                                    | The `ZodPipe` is transparent—it just passes through the input value depending on the direction (`IN` or `OUT`).                                                      |
| `ZodCodec`              |                                                                    | Same as `ZodPipe`.                                                                                                                                                   |
| `ZodTransform`          |                                                                    | Same as `ZodPipe`.                                                                                                                                                   |
| `ZodPrefault`           |                                                                    | Same as `ZodPipe`.                                                                                                                                                   |
| `ZodLazy`               |                                                                    | Same as `ZodPipe`.                                                                                                                                                   |
| `ZodCatch`              |                                                                    | Same as `ZodPipe`.                                                                                                                                                   |
| `ZodReadonly`           |                                                                    | Same as `ZodPipe`.<br>                                                                                                                                               |
| `ZodDefault`            |                                                                    | Same as `ZodPipe`.<br>                                                                                                                                               |
| **Special Types**       |                                                                    |                                                                                                                                                                      |
| `ZodDiscriminatedUnion` | `oneof my_field {}`                                                | **Not all cases are handled; use `pz.oneOfUnion()`.**<br>This method builds a `ZodDiscriminatedUnion` that matches the `ts-proto` feature `oneof=unions-value` type. |
| ~~`ZodUnion`~~          | Not handled                                                        | Use `ZodOneOfUnion` instead.                                                                                                                                         |

**Note:** Other Zod types are not handled.

### Proto3

| Feature                           | Type                                                                                                                                                                                                                                                                                                                                   |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| File                              | `Proto3File`                                                                                                                                                                                                                                                                                                                           |
| Imports                           | `Proto3ImportedType`                                                                                                                                                                                                                                                                                                                   |
| RPC service                       | `Proto3RpcService`                                                                                                                                                                                                                                                                                                                     |
| RPC function                      | `Proto3RpcFunction`                                                                                                                                                                                                                                                                                                                    |
| Message                           | `Proto3Message`                                                                                                                                                                                                                                                                                                                        |
| Basic field                       | `Proto3MessageField`                                                                                                                                                                                                                                                                                                                   |
| OneOf field                       | `Proto3MessageOneOfField`                                                                                                                                                                                                                                                                                                              |
| Enum                              | `Proto3Enum`                                                                                                                                                                                                                                                                                                                           |
| Enum field                        | `Proto3EnumField`                                                                                                                                                                                                                                                                                                                      |
| Scalar type                       | `Proto3StringType`<br>`Proto3BoolType`<br>`Proto3Int32Type`<br>`Proto3Int64Type`<br>`Proto3UInt32Type`<br>`Proto3UInt64Type`<br>`Proto3SInt32Type`<br>`Proto3SInt64Type`<br>`Proto3Fixed32Type`<br>`Proto3Fixed64Type`<br>`Proto3SFixed32Type`<br>`Proto3SFixed64Type`<br>`Proto3DoubleType`<br>`Proto3FloatType`<br>`Proto3BytesType` |
| Repeated                          | `Proto3RepeatedType`                                                                                                                                                                                                                                                                                                                   |
| Map                               | `Proto3MapType`                                                                                                                                                                                                                                                                                                                        |
| Global option (like `deprecated`) | `Proto3GlobalType`                                                                                                                                                                                                                                                                                                                     |

### Protovalidate

| Annotation           | Type                            | Notice                                    |
| -------------------- | ------------------------------- | ----------------------------------------- |
| `buf.validate.field` | `Proto3ValidateFieldAnnotation` | Only the `required` parameter is handled. |
| `buf.validate.oneof` | `Proto3ValidateFieldAnnotation` | Only the `required` parameter is handled. |

### Google

| Annotation/Type         | Type                   |
| ----------------------- | ---------------------- |
| `google.api.http`       | `Proto3HttpAnnotation` |
| `google.protobuf.Empty` | `Proto3Empty`          |

### Runtime

`zodToRuntime` converts values at the codec boundary so they match the Zod schemas they
came from rather than the protobuf wire representation. The wire format itself is
unaffected — a message encoded here is byte-identical to one produced from the generated
`.proto`.

| Proto3                                              | JS at runtime                | Notice                                                              |
| --------------------------------------------------- | ---------------------------- | ------------------------------------------------------------------- |
| `string`                                            | `string`                     |                                                                       |
| `bool`                                              | `boolean`                    |                                                                       |
| `bytes`                                             | `Uint8Array`                 |                                                                       |
| `int32`<br>`uint32`<br>`sint32`<br>`fixed32`<br>`sfixed32`<br>`float`<br>`double` | `number` |                                                            |
| `int64`<br>`uint64`<br>`sint64`<br>`fixed64`<br>`sfixed64` | `number`              | Loses precision past 2^53. See the note below.                        |
| `enum`                                              | `string`                     | The value name (`'VIEWER'`), not its id.                              |
| `repeated`                                          | `Array`                      | Absent means `[]`.                                                    |
| `map`                                               | `Record`                     | Keys are passed through verbatim, never camel cased.                  |
| `oneof`                                             | `{ $case, value }`           | The shape `pz.oneOfUnion` produces.                                   |
| `optional`                                          | absent key                   | A non-optional absent field decodes to its proto3 default instead.    |

Field keys are camelCase at runtime and snake_case in the `.proto`: a Zod `fullName`
is declared `full_name` and decodes back to `fullName`. The inverse is derived, so a key
whose casing does not round trip through `snakeCase`/`camelCase` — an acronym such as
`HTTPRequest` — comes back as `httpRequest`.

**Note on 64-bit integers.** `z.int()` (a JS `number`) and `z.int64()` (a JS `bigint`)
both convert to Proto3 `int64`, so the definition cannot say which JS type a field came
from. The runtime always decodes to `number`, which is correct for `z.int()` and loses
precision for `z.int64()` values above 2^53.

Only the `protobufjs` well-known google types (`any`, `duration`, `empty`, `field_mask`,
`struct`, `timestamp`, `wrappers`) resolve at runtime. The conversions above do **not**
apply to them: they keep their `protobufjs` representation, so a `google.protobuf.Empty`
response — the default for a function without an `out` — decodes to an `Empty` message
instance rather than a plain `{}`, and a `google.protobuf.Timestamp` decodes to
`{ seconds, nanos }` with `seconds` as a `Long`. Any other imported type used as a field
or an rpc input/output throws, naming its import path.

Protovalidate annotations carry no wire-format meaning and are not enforced by the codecs.
