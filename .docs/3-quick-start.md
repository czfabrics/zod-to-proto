## Quick Start

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
