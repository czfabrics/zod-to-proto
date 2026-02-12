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
    packageName: 'services.authentication.v1',
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
import { zodToProto } from '{{ pkg.name }}'
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

### gRPC Service with gRPC gateway annotations

```ts
import { Proto3HttpAnnotation, zodToProto } from '{{ pkg.name }}'
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
                    in: z.object({
                        user: User.omit({ id: true }),
                    }),
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
import { zodToProto } from '{{ pkg.name }}'
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
                        users: z.array(User2),
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
import { zodToProto, safeZodMessage } from '{{ pkg.name }}'
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
            })
            // => TypeDebuggingError<"This Zod type 'date' is not supported">
            //
            // **Note:** You can make the schema compatible by using z.string().pipe(z.coerce.date()).
            // This will result in the following proto field: `string created_at = 1;`
        ),
    },
})
```

_Note that you can utilize the type behind the safeZodMessage method in your own functions._

**Example of usage:**

```ts
import { CheckZodSchemaCompatibility } from '{{ pkg.name }}'
import { SomeType } from 'zod/v4/core'

export const safeZodMessage = function <const T extends SomeType>(
    schema: CheckZodSchemaCompatibility<T>
) {
    return schema
}
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
