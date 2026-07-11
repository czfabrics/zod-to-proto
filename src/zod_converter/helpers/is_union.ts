import type { ZodUnion } from 'zod'
import type { SomeType } from 'zod/v4/core'

export const isZodUnion = function (schema: SomeType): schema is ZodUnion {
    return schema._zod.def.type === 'union'
}
