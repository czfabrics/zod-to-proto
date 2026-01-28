## Usage

### Basic

```ts
import { zodToProto } from '{{ pkg.name }}'
import z from 'zod'

const User = z.object({
    id: z.int64(),
    fullName: z.string().optional(),
    role: z.enum(['ADMIN', 'VIEWER']),
})

const result = zodToProto({
    syntax: 'proto3',
    packageName: 'services.authentification.v1',
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
import { zodToProto } from '{{ pkg.name }}'
import z from 'zod'

const User = z.object({
    id: z.int64(),
    fullName: z.string().optional(),
    role: z.enum(['ADMIN', 'VIEWER']),
})

const result = zodToProto({
    syntax: 'proto3',
    packageName: 'services.authentification.v1',
    service: {
        name: 'UserService',
        functions: [
            {
                name: 'getUsers',
                in: undefined,
                inStream: false,
                out: z.object({
                    users: z.array(User),
                }),
                outStream: true,
            },
        ],
    },
})
```

**Result:**

```proto
syntax = "proto3";

import "google/protobuf/empty.proto";
import "buf/validate/validate.proto";

package services.authentification.v1;

service UserService {
  rpc getUsers(google.protobuf.Empty) returns (stream GetUsersOutput) {}
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

### Enforced typecheck

You can safely check if your schema is compatible. It will trigger a TypeScript error. Note that deeper schemas may slow down the TSC compiler.

```ts
import { zodToProto } from '{{ pkg.name }}'
import { Proto3RpcRawMessage } from '#usage/types/message'
import z from 'zod'

const User = z.object({
    id: z.int64(),
    fullName: z.string().optional(),
    role: z.enum(['ADMIN', 'VIEWER']),
})

const result = zodToProto({
    syntax: 'proto3',
    packageName: 'services.authentification.v1',
    unscopedMessages: {
        user: Proto3RpcRawMessage.safe(User), // => No TS error because it's compatible
        user2: Proto3RpcRawMessage.safe(
            z.object({
                createdAt: z.date(),
            }) // => TypeDebuggingError<"This Zod type 'date' is not supported">
        ),
    },
})
```

### Extension

```ts
import { Proto3Deprecated, Proto3HttpAnnotation, zodToProto } from '{{ pkg.name }}'
import z from 'zod'

const User = z.object({
    id: z.int64(),
    fullName: z.string().optional(),
    role: z.enum(['ADMIN', 'VIEWER']),
})

const result = zodToProto({
    syntax: 'proto3',
    packageName: 'services.authentification.v1',
    service: {
        name: 'UserService',
        functions: [
            {
                name: 'getUsers',
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
  rpc getUsers(google.protobuf.Empty) returns (stream GetUsersOutput) {
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
