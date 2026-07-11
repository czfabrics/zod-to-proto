## Quick Start

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
