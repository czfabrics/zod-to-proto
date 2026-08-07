## Usage

### Basic

```ts
import { UnscopedMessage, zodToProto } from '{{ pkg.name }}'
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
import { MessageOut, zodToProto } from '{{ pkg.name }}'
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
import { MessageIn, zodToRuntime } from '{{ pkg.name }}'
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
import { MessageIn, Proto3HttpAnnotation, zodToProto } from '{{ pkg.name }}'
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
import { MessageOut, zodToProto } from '{{ pkg.name }}'
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
import { UnscopedMessage, zodToProto } from '{{ pkg.name }}'
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
import { CheckZodSchemaCompatibility, ZodPassthroughDirection } from '{{ pkg.name }}'
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
} from '{{ pkg.name }}'
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
