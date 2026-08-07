<!-- ⚠️ This README has been generated from the file(s) ".blueprint.md" ⚠️--><h1 align="center">@czfabrics/zod-to-proto</h1>
<p align="center">
		<a href="https://npmcharts.com/compare/@czfabrics/zod-to-proto?minimal=true"><img alt="Downloads per month" src="https://img.shields.io/npm/dm/@czfabrics/zod-to-proto.svg" height="20"/></a>
<a href="https://www.npmjs.com/package/@czfabrics/zod-to-proto"><img alt="NPM Version" src="https://img.shields.io/npm/v/@czfabrics/zod-to-proto.svg" height="20"/></a>
<a href="https://github.com/czfabrics/zod-to-proto/graphs/commit-activity"><img alt="Maintained" src="https://img.shields.io/badge/Maintained%3F-yes-green.svg" height="20"/></a>
	</p>

<p align="center">
  <b>A TypeScript library for seamlessly converting Zod schemas into Protocol Buffers v3 definitions, with built-in support for generating RPC services and functions from structured object definitions.</b></br>
  <sub><sub>
</p>

<br />


[![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/dark.png)](#table-of-contents)

## Table of Contents

* [Overview](#overview)
	* [Key Features](#key-features)
* [Installation](#installation)
	* [Bun](#bun)
	* [Yarn](#yarn)
	* [NPM](#npm)
* [Quick Start](#quick-start)
* [Usage](#usage)
	* [Basic](#basic)
	* [gRPC Service](#grpc-service)
	* [gRPC runtime](#grpc-runtime)
	* [gRPC Service with gRPC gateway annotations](#grpc-service-with-grpc-gateway-annotations)
	* [Type prefix](#type-prefix)
	* [Enforced typecheck](#enforced-typecheck)
	* [Extension](#extension)
* [Compatibility](#compatibility)
	* [Zod](#zod)
	* [Proto3](#proto3)
	* [Protovalidate](#protovalidate)
	* [Google](#google)
	* [Runtime](#runtime)
* [Plugin](#plugin)
	* [Custom Type](#custom-type)
	* [Custom Extension](#custom-extension)
	* [Zod Conversion Transformer](#zod-conversion-transformer)
		* [Writing a transformer](#writing-a-transformer)
		* [Using a Transformer](#using-a-transformer)
* [License](#license)

[![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/dark.png)](#overview)

## Overview

A TypeScript library for seamlessly converting Zod schemas into Protocol Buffers v3 definitions, with built-in support for generating RPC services and functions from structured object definitions.

### Key Features

- **Zod support**: Write your Zod schemas and convert them to Protobuf definitions.
- **Typesafe Zod conversion**: If it throws a TypeScript error, it’s not supported. Simple as that.
- **gRPC support**: Define your gRPC services in a TypeScript-first way.
- **Type-safe structured objects**: Write your Protobuf definitions in a TypeScript-first way and convert them into proto3 files.
- **Flexible Zod conversion**: Write custom transformers to modify Protobuf definitions after conversion.


[![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/dark.png)](#installation)

## Installation

### Bun

```sh
bun add @czfabrics/zod-to-proto@0.2.0
```

### Yarn

```sh
yarn add @czfabrics/zod-to-proto@0.2.0
```

### NPM

```sh
npm install @czfabrics/zod-to-proto@0.2.0
```


[![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/dark.png)](#quick-start)

## Quick Start

```ts
import { UnscopedMessage, zodToProto } from '@czfabrics/zod-to-proto'
import z from 'zod'

const User = z.object({
    id: z.int64(),
    fullName: z.string().optional(),
    role: z.enum(['ADMIN', 'VIEWER']),
})

const result = zodToProto({
    syntax: 'proto3',
    packageName: 'services.authentication.v1',
    services: [],
    unscopedMessages: {
        user: UnscopedMessage.new('OUT', User),
    },
})
```

**Result:**

```proto
syntax = "proto3";

import "buf/validate/validate.proto";

package services.authentication.v1;

enum UserRole {
  ADMIN = 0;
  VIEWER = 1;
}

message User {
  int64 id = 1 [
    (buf.validate.field).required = true
  ];
  optional string full_name = 2;
  UserRole role = 3 [
    (buf.validate.field).required = true
  ];
}
```


[![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/dark.png)](#usage)

## Usage

### Basic

```ts
import { UnscopedMessage, zodToProto } from '@czfabrics/zod-to-proto'
import z from 'zod'

const User = z.object({
    id: z.int64(),
    fullName: z.string().optional(),
    role: z.enum(['ADMIN', 'VIEWER']),
})

const result = zodToProto({
    syntax: 'proto3',
    packageName: 'services.authentication.v1',
    services: [],
    unscopedMessages: {
        user: UnscopedMessage.new('OUT', User),
    },
})
```

**Result:**

```proto
syntax = "proto3";

import "buf/validate/validate.proto";

package services.authentication.v1;

enum UserRole {
  ADMIN = 0;
  VIEWER = 1;
}

message User {
  int64 id = 1 [
    (buf.validate.field).required = true
  ];
  optional string full_name = 2;
  UserRole role = 3 [
    (buf.validate.field).required = true
  ];
}
```

### gRPC Service

```ts
import { MessageOut, zodToProto } from '@czfabrics/zod-to-proto'
import z from 'zod'

const User = z.object({
    id: z.int64(),
    fullName: z.string().optional(),
    role: z.enum(['ADMIN', 'VIEWER']),
})

const result = zodToProto({
    syntax: 'proto3',
    packageName: 'services.user.v1',
    services: [
        {
            name: 'UserService',
            functions: [
                {
                    name: 'GetUsers',
                    in: undefined,
                    inStream: false,
                    out: MessageOut.new(
                        z.object({
                            users: z.array(User),
                        })
                    ),
                    outStream: true,
                },
            ],
        },
    ],
})
```

**Result:**

```proto
syntax = "proto3";

import "google/protobuf/empty.proto";
import "buf/validate/validate.proto";

package services.user.v1;

service UserService {
  rpc GetUsers(google.protobuf.Empty) returns (stream GetUsersOutput) {}
}

enum UserRole {
  ADMIN = 0;
  VIEWER = 1;
}

message GetUsersOutputUser {
  int64 id = 1 [
    (buf.validate.field).required = true
  ];
  optional string full_name = 2;
  UserRole role = 3 [
    (buf.validate.field).required = true
  ];
}

message GetUsersOutput {
  repeated GetUsersOutputUser users = 1 [
    (buf.validate.field).required = true
  ];
}
```

### gRPC runtime

`zodToRuntime` returns a runnable counterpart of the same definition instead of
`.proto` text: a `protobufjs` root and one `@grpc/grpc-js` `ServiceDefinition` per
service, keyed by fully qualified service name.

```ts
import { MessageIn, zodToRuntime } from '@czfabrics/zod-to-proto'
import { Server, ServerCredentials, makeClientConstructor } from '@grpc/grpc-js'
import z from 'zod'

const PostUsersInput = z.object({
    fullName: z.string(),
    role: z.enum(['ADMIN', 'VIEWER']),
})

const { root, services } = zodToRuntime({
    syntax: 'proto3',
    packageName: 'services.user.v1',
    services: [
        {
            name: 'UserService',
            functions: [
                {
                    name: 'PostUsers',
                    in: MessageIn.new(PostUsersInput),
                },
            ],
        },
    ],
})

const definition = services['services.user.v1.UserService']!

const server = new Server()

server.addService(definition, {
    PostUsers: (call, callback) => {
        //// `call.request` is `{ fullName: string, role: 'ADMIN' | 'VIEWER' }`
        callback(null, {})
    },
})

server.bindAsync('0.0.0.0:50051', ServerCredentials.createInsecure(), () => {})

const UserClient = makeClientConstructor(definition, 'UserService')
```

**Result:**

```ts
{
    root: Root,                                   //// protobufjs, for lookups
    services: {
        'services.user.v1.UserService': {
            PostUsers: {
                path: '/services.user.v1.UserService/PostUsers',
                originalName: 'postUsers',        //// camelCase, as `@grpc/proto-loader` emits
                requestStream: false,
                responseStream: false,
                requestSerialize: (value) => Buffer,
                requestDeserialize: (bytes) => object,
                responseSerialize: (value) => Buffer,
                responseDeserialize: (bytes) => object,
            },
        },
    },
}
```

Methods are keyed by their Proto3 name (`PostUsers`) with `originalName` holding the
camelCase form, matching what `@grpc/proto-loader` produces. The definition is accepted
as-is by `nice-grpc`.

Values crossing the codecs use the JS shapes the Zod schemas were written in, not the
protobuf ones — see [Compatibility](#runtime) for the full table:

- keys are camelCase (`fullName`), while the `.proto` declares them snake_case
  (`full_name`)
- enums are their string names (`'VIEWER'`), not their numeric ids
- `oneof` values are `{ $case, value }`, as produced by `pz.oneOfUnion`
- 64-bit integers are `number`
- an absent `optional` field is an absent key

Only the `protobufjs` well-known google types resolve at runtime. Any other imported
type used as a field or an rpc input/output throws, naming the import path.

### gRPC Service with gRPC gateway annotations

```ts
import { MessageIn, Proto3HttpAnnotation, zodToProto } from '@czfabrics/zod-to-proto'
import z from 'zod'

const User = z.object({
    id: z.int64(),
    fullName: z.string().optional(),
    role: z.enum(['ADMIN', 'VIEWER']),
})

const result = zodToProto({
    syntax: 'proto3',
    packageName: 'services.user.v1',
    services: [
        {
            name: 'UserService',
            functions: [
                {
                    name: 'AddUser',
                    in: MessageIn.new(
                        z.object({
                            user: User.omit({ id: true }),
                        })
                    ),
                    extensions: [
                        Proto3HttpAnnotation.useExtension({
                            post: '/users',
                            body: '*',
                        }),
                    ],
                },
            ],
        },
    ],
})
```

**Result:**

```proto
syntax = "proto3";

import "buf/validate/validate.proto";
import "google/protobuf/empty.proto";
import "google/api/annotations.proto";

package services.user.v1;

service UserService {
  rpc AddUser(AddUserInput) returns (google.protobuf.Empty) {
    option (google.api.http) = {
      post: "/users",
      body: "*"
    };
  }
}

enum UserRole {
  ADMIN = 0;
  VIEWER = 1;
}

message AddUserInputUser {
  optional string full_name = 1;
  UserRole role = 2 [
    (buf.validate.field).required = true
  ];
}

message AddUserInput {
  AddUserInputUser user = 1 [
    (buf.validate.field).required = true
  ];
}
```

### Type prefix

Three levels of type prefix: file, service, function.

```ts
import { MessageOut, zodToProto } from '@czfabrics/zod-to-proto'
import z from 'zod'

const User = z.object({
    id: z.int64(),
    fullName: z.string().optional(),
    role: z.enum(['ADMIN', 'VIEWER']),
})
const User2 = z.object({
    id: z.int64(),
    fullName: z.string().optional(),
    role: z.enum(['ADMIN', 'VIEWER']),
})

const result = zodToProto({
    syntax: 'proto3',
    packageName: 'services.user.v1',
    typePrefix: 'UserPackage', // First level prefix
    services: [
        {
            name: 'UserService',
            typePrefix: 'UserService', // Second level prefix
            functions: [
                {
                    name: 'GetUsers',
                    typePrefix: 'GetUsers', // Third level prefix
                    out: MessageOut.new(
                        z.object({
                            users: z.array(User),
                        })
                    ),
                },
            ],
        },
        {
            name: 'UserService2',
            typePrefix: 'UserService2',
            functions: [
                {
                    name: 'GetUsers',
                    typePrefix: 'GetUsers',
                    out: MessageOut.new(
                        z.object({
                            users: z.array(User2),
                        })
                    ),,
                },
            ],
        },
    ],
})
```

**Result:**

```proto
syntax = "proto3";

import "google/protobuf/empty.proto";
import "buf/validate/validate.proto";

package services.user.v1;

service UserService {
  rpc GetUsers(google.protobuf.Empty) returns (UserPackageUserServiceGetUsersOutput) {}
}

service UserService2 {
  rpc GetUsers(google.protobuf.Empty) returns (UserPackageUserService2GetUsersOutput) {}
}

enum UserPackageUserService2GetUsersUserRole {
  ADMIN = 0;
  VIEWER = 1;
}

message UserPackageUserService2GetUsersOutputUser {
  int64 id = 1 [
    (buf.validate.field).required = true
  ];
  optional string full_name = 2;
  UserPackageUserService2GetUsersUserRole role = 3 [
    (buf.validate.field).required = true
  ];
}

message UserPackageUserService2GetUsersOutput {
  repeated UserPackageUserService2GetUsersOutputUser users = 1 [
    (buf.validate.field).required = true
  ];
}

enum UserPackageUserServiceGetUsersUserRole {
  ADMIN = 0;
  VIEWER = 1;
}

message UserPackageUserServiceGetUsersOutputUser {
  int64 id = 1 [
    (buf.validate.field).required = true
  ];
  optional string full_name = 2;
  UserPackageUserServiceGetUsersUserRole role = 3 [
    (buf.validate.field).required = true
  ];
}

// UserPackage -> UserService -> GetUsers
message UserPackageUserServiceGetUsersOutput {
  repeated UserPackageUserServiceGetUsersOutputUser users = 1 [
    (buf.validate.field).required = true
  ];
}
```

### Enforced typecheck

You can safely check if your schema is compatible. It will trigger a TypeScript error. Note that deeper schemas may slow down the TSC compiler.

```ts
import { UnscopedMessage, zodToProto } from '@czfabrics/zod-to-proto'
import z from 'zod'

const User = z.object({
    id: z.int64(),
    fullName: z.string().optional(),
    role: z.enum(['ADMIN', 'VIEWER']),
})

const result = zodToProto({
    syntax: 'proto3',
    packageName: 'services.authentification.v1',
    services: [],
    unscopedMessages: {
        user: UnscopedMessage.safeNew('OUT', User), // => No TS error because it's compatible
        user2: UnscopedMessage.safeNew(
            'OUT',
            z.object({
                createdAt: z.date(),
                // => TypeDebuggingError<"This Zod type 'date' is not supported">
                //
                // **Note:** You can make the schema compatible by using z.string().pipe(z.coerce.date()) or a ZodCodec.
                // This will result in the following proto field: `string created_at = 1;`
            })
        ),
        user3: UnscopedMessage.safeNew(
            'OUT',
            z.object({
                createdAt: z.codec(z.date(), z.iso.datetime(), {
                    decode: (date) => date.toISOString(),
                    encode: (isoString) => new Date(isoString),
                }),
                // => No TS error because it will take the 'out' schema of the Codec: `z.iso.datetime`
            })
        ),
        user4: UnscopedMessage.safeNew(
            'IN',
            z.object({
                createdAt: z.codec(z.iso.datetime(), z.date(), {
                    decode: (isoString) => new Date(isoString),
                    encode: (date) => date.toISOString(),
                }),
                // => No TS error because it will take the 'in' schema of the Codec: `z.iso.datetime`
            })
        ),
    },
})
```

_Note that you can utilize the type behind the `UnscopedMessage.safeNew` method in your own functions._

**Example of usage:**

```ts
import { CheckZodSchemaCompatibility, ZodPassthroughDirection } from '@czfabrics/zod-to-proto'
import { SomeType } from 'zod/v4/core'

export const safeNew = function <
    const TDirection extends ZodPassthroughDirection,
    const TSchema extends SomeType,
>(direction: TDirection, schema: CheckZodSchemaCompatibility<TDirection, TSchema>) {
    return schema
}
```

### Extension

```ts
import {
    MessageOut,
    Proto3Deprecated,
    Proto3HttpAnnotation,
    zodToProto,
} from '@czfabrics/zod-to-proto'
import z from 'zod'

const User = z.object({
    id: z.int64(),
    fullName: z.string().optional(),
    role: z.enum(['ADMIN', 'VIEWER']),
})

const result = zodToProto({
    syntax: 'proto3',
    packageName: 'services.authentification.v1',
    services: [
        {
            name: 'UserService',
            functions: [
                {
                    name: 'GetUsers',
                    out: MessageOut.new(
                        z.object({
                            users: z.array(User),
                        })
                    ),
                    outStream: true,
                    extensions: [
                        //// google.api.http option for gRPC restful gateway
                        Proto3HttpAnnotation.useExtension({
                            get: '/users',
                        }),
                    ],
                },
            ],
            extensions: [
                //// Global option
                Proto3Deprecated.useExtension(true),
            ],
        },
    ],
})
```

**Result:**

```proto
syntax = "proto3";

import "google/protobuf/empty.proto";
import "buf/validate/validate.proto";
import "google/api/annotations.proto";

package services.authentification.v1;

service UserService {
  option (deprecated) = true;
  rpc GetUsers(google.protobuf.Empty) returns (stream GetUsersOutput) {
    option (google.api.http).get = "/users";
  }
}

enum UserRole {
  ADMIN = 0;
  VIEWER = 1;
}

message User {
  int64 id = 1 [
    (buf.validate.field).required = true
  ];
  optional string full_name = 2;
  UserRole role = 3 [
    (buf.validate.field).required = true
  ];
}

message GetUsersOutput {
  repeated User users = 1 [
    (buf.validate.field).required = true
  ];
}
```


[![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/dark.png)](#compatibility)

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


[![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/dark.png)](#plugin)

## Plugin

### Custom Type

```ts
import { Proto3ImportedType } from '@czfabrics/zod-to-proto'

export const Proto3Empty = {
    useType: () => {
        return Proto3ImportedType.new({
            importPath: 'google/protobuf/empty.proto',
            typeReference: 'google.protobuf.Empty',
        })
    },
} as const
```

### Custom Extension

```ts
import { Proto3Extension, Proto3ImportedType } from '@czfabrics/zod-to-proto'

export const Proto3ValidateFieldAnnotation = {
    useType: function () {
        return Proto3ImportedType.new({
            importPath: 'buf/validate/validate.proto',
            typeReference: 'buf.validate.field',
        })
    },
    useExtension: function (value: { required?: boolean }) {
        return Proto3Extension.new({
            key: this.useType(),
            value,
        })
    },
} as const
```

### Zod Conversion Transformer

This package allows you to write custom transformers to modify Protobuf definitions after converting from Zod schemas.

**Available transformers:**

- `ZodDeprecatedMessageConversionTransformer`
- `ZodMessageNameIncludedInFieldConversionTransformer`
- `ZodEnumNameIncludedInFieldConversionTransformer`
- `ZodMessageNameConversionTransformer`
- `ZodDeprecatedFieldConversionTransformer`
- `ZodRequiredFieldConversionTransformer`
- `ZodDeprecatedOneOfFieldConversionTransformer`
- `ZodRequiredOneOfFieldConversionTransformer`
- `ZodDeprecatedEnumConversionTransformer`
- `ZodEnumNameConversionTransformer`

#### Writing a transformer

```ts
import {
    isZodSchemaDeprecated,
    Proto3Deprecated,
    WithMaybeZodPassthrough,
    ZodConversionContext,
    ZodMessageFieldConversionTransformer,
    ZodMessageFieldType,
    type ReadOnlyProto3MessageField,
} from '@czfabrics/zod-to-proto'

export class ZodDeprecatedFieldConversionTransformer implements ZodMessageFieldConversionTransformer {
    transform(
        context: ZodConversionContext,
        schema: WithMaybeZodPassthrough<ZodMessageFieldType>,
        protoDefinition: ReadOnlyProto3MessageField
    ): ReadOnlyProto3MessageField {
        const isDeprecated = isZodSchemaDeprecated(context, schema)

        if (!isDeprecated) {
            return protoDefinition
        }

        return protoDefinition.clone({
            extensions: [
                ...protoDefinition.extensions,
                Proto3Deprecated.useExtension(true),
            ],
        })
    }
}
```

#### Using a Transformer

```ts
zodToProto(
    <...>,
    {
        transformers: {
            message: [],
            messageField: [new ZodDeprecatedFieldConversionTransformer()],
            messageOneOfField: [],
            enum: [],
        },
    }
)
```


[![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/dark.png)](#license)

## License
	
Licensed under [MIT](https://opensource.org/licenses/MIT).
