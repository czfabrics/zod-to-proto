<!-- ⚠️ This README has been generated from the file(s) ".blueprint.md" ⚠️--><h1 align="center">@czlab/zod-to-proto</h1>
<p align="center">
		<a href="https://npmcharts.com/compare/@czlab/zod-to-proto?minimal=true"><img alt="Downloads per month" src="https://img.shields.io/npm/dm/@czlab/zod-to-proto.svg" height="20"/></a>
<a href="https://www.npmjs.com/package/@czlab/zod-to-proto"><img alt="NPM Version" src="https://img.shields.io/npm/v/@czlab/zod-to-proto.svg" height="20"/></a>
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
	* [Type prefix](#type-prefix)
	* [Enforced typecheck](#enforced-typecheck)
	* [Extension](#extension)
* [Compatibility](#compatibility)
	* [Zod](#zod)
	* [Proto3](#proto3)
	* [Protovalidate](#protovalidate)
	* [Google](#google)
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
bun add @czlab/zod-to-proto@0.1.0-beta.5
```

### Yarn

```sh
yarn add @czlab/zod-to-proto@0.1.0-beta.5
```

### NPM

```sh
npm install @czlab/zod-to-proto@0.1.0-beta.5
```


[![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/dark.png)](#quick-start)

## Quick Start

```ts
import { zodToProto } from '@czlab/zod-to-proto'
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
        user: User,
    },
})
```

**Result:**

```proto
syntax = "proto3";

import "buf/validate/validate.proto";

package services.authentification.v1;

message User {
  int64 id = 1 [
    (buf.validate.field).required = true
  ];
  optional string full_name = 2;
  Role role = 3 [
    (buf.validate.field).required = true
  ];
}

enum Role {
  ADMIN = 0;
  VIEWER = 1;
}
```


[![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/dark.png)](#usage)

## Usage

### Basic

```ts
import { zodToProto } from '@czlab/zod-to-proto'
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
        user: User,
    },
})
```

**Result:**

```proto
syntax = "proto3";

import "buf/validate/validate.proto";

package services.authentification.v1;

message User {
  int64 id = 1 [
    (buf.validate.field).required = true
  ];
  optional string full_name = 2;
  Role role = 3 [
    (buf.validate.field).required = true
  ];
}

enum Role {
  ADMIN = 0;
  VIEWER = 1;
}
```

### gRPC Service

```ts
import { zodToProto } from '@czlab/zod-to-proto'
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
                    in: undefined,
                    inStream: false,
                    out: z.object({
                        users: z.array(User),
                    }),
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

package services.authentification.v1;

service UserService {
  rpc GetUsers(google.protobuf.Empty) returns (stream GetUsersOutput) {}
}

message GetUsersOutput {
  repeated User users = 1 [
    (buf.validate.field).required = true
  ];
}

message User {
  int64 id = 1 [
    (buf.validate.field).required = true
  ];
  optional string full_name = 2;
  Role role = 3 [
    (buf.validate.field).required = true
  ];
}

enum Role {
  ADMIN = 0;
  VIEWER = 1;
}
```

### Type prefix

Three levels of type prefix: file, service, function.

```ts
import { zodToProto } from '@czlab/zod-to-proto'
import z from 'zod'

const User = z.object({
    id: z.int64(),
    fullName: z.string().optional(),
    role: z.enum(['ADMIN', 'VIEWER']),
})

const result = zodToProto({
    syntax: 'proto3',
    packageName: 'services.authentification.v1',
    typePrefix: 'AuthentificationPackage', // First level prefix
    services: [
        {
            name: 'UserService',
            typePrefix: 'UserService', // Second level prefix
            functions: [
                {
                    name: 'GetUsers',
                    typePrefix: 'GetUsers', // Third level prefix
                    out: z.object({
                        users: z.array(User),
                    }),
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
                    out: z.object({
                        users: z.array(User),
                    }),
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

package services.authentification.v1;

service AuthentificationPackageUserService {
  rpc GetUsers(google.protobuf.Empty) returns (AuthentificationPackageUserServiceGetUsersOutput) {}
}

service AuthentificationPackageUserService2 {
  rpc GetUsers(google.protobuf.Empty) returns (AuthentificationPackageUserService2GetUsersOutput) {}
}

// AuthentificationPackage -> UserService -> GetUsers
message AuthentificationPackageUserServiceGetUsersOutput {
  repeated AuthentificationPackageUserServiceGetUsersUser users = 1 [
    (buf.validate.field).required = true
  ];
}

message AuthentificationPackageUserServiceGetUsersUser {
  int64 id = 1 [
    (buf.validate.field).required = true
  ];
  optional string full_name = 2;
  AuthentificationPackageUserServiceGetUsersUserRole role = 3 [
    (buf.validate.field).required = true
  ];
}

enum AuthentificationPackageUserServiceGetUsersUserRole {
  ADMIN = 0;
  VIEWER = 1;
}

message AuthentificationPackageUserService2GetUsersOutput {
  repeated AuthentificationPackageUserService2GetUsersUser users = 1 [
    (buf.validate.field).required = true
  ];
}

message AuthentificationPackageUserService2GetUsersUser {
  int64 id = 1 [
    (buf.validate.field).required = true
  ];
  optional string full_name = 2;
  AuthentificationPackageUserService2GetUsersUserRole role = 3 [
    (buf.validate.field).required = true
  ];
}

enum AuthentificationPackageUserService2GetUsersUserRole {
  ADMIN = 0;
  VIEWER = 1;
}
```

### Enforced typecheck

You can safely check if your schema is compatible. It will trigger a TypeScript error. Note that deeper schemas may slow down the TSC compiler.

```ts
import { zodToProto, safeZodMessage } from '@czlab/zod-to-proto'
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
        user: safeZodMessage(User), // => No TS error because it's compatible
        user2: safeZodMessage(
            z.object({
                createdAt: z.date(),
            }) // => TypeDebuggingError<"This Zod type 'date' is not supported">
        ),
    },
})
```

_Note that you can utilize the type behind the safeZodMessage method in your own functions._

**Example of usage:**

```ts
import { CheckZodSchemaCompatibility } from '@czlab/zod-to-proto'
import { SomeType } from 'zod/v4/core'

export const safeZodMessage = function <const T extends SomeType>(
    schema: CheckZodSchemaCompatibility<T>
) {
    return schema
}
```

### Extension

```ts
import { Proto3Deprecated, Proto3HttpAnnotation, zodToProto } from '@czlab/zod-to-proto'
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
                    out: z.object({
                        users: z.array(User),
                    }),
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
  option deprecated = true;
  rpc GetUsers(google.protobuf.Empty) returns (stream GetUsersOutput) {
    option (google.api.http).get = "/users";
  }
}

message GetUsersOutput {
  repeated User users = 1 [
    (buf.validate.field).required = true
  ];
}

message User {
  int64 id = 1 [
    (buf.validate.field).required = true
  ];
  optional string full_name = 2;
  Role role = 3 [
    (buf.validate.field).required = true
  ];
}

enum Role {
  ADMIN = 0;
  VIEWER = 1;
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
| `ZodPipe`               |                                                                    | The `ZodPipe` is transparent—it just passes through the input value.                                                                                                 |
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


[![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/dark.png)](#plugin)

## Plugin

### Custom Type

```ts
import { Proto3ImportedType } from '@czlab/zod-to-proto'

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
import { Proto3Extension, Proto3ImportedType } from '@czlab/zod-to-proto'

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

- `ZodMessageConversionTransformer`
- `ZodMessageFieldConversionTransformer`
- `ZodMessageOneOfFieldConversionTransformer`
- `ZodEnumConversionTransformer`

#### Writing a transformer

```ts
import {
    Proto3Deprecated,
    Proto3MessageField,
    isZodSchemaDeprecated,
    ZodMessageFieldType,
    WithMaybeZodPassthrough,
    ZodMessageFieldConversionTransformer,
} from '@czlab/zod-to-proto'

export class ZodDeprecatedFieldConversionTransformer implements ZodMessageFieldConversionTransformer {
    transform(
        schema: WithMaybeZodPassthrough<ZodMessageFieldType>,
        protoDefinition: Proto3MessageField
    ): Proto3MessageField {
        const isDeprecated = isZodSchemaDeprecated(schema)

        if (!isDeprecated) {
            return protoDefinition
        }

        return Proto3MessageField.new({
            ...protoDefinition,
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
