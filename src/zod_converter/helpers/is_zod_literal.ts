import type { ZodLiteral } from 'zod'
import type { SomeType } from 'zod/v4/core'

export const isZodLiteral = function (schema: SomeType): schema is ZodLiteral {
    return schema._zod.def.type === 'literal'
}
