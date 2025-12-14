import type { ZodObject } from 'zod'
import type { SomeType } from 'zod/v4/core'

export const isZodObject = function (schema: SomeType): schema is ZodObject {
    return schema._zod.def.type === 'object'
}
