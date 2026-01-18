import type { ZodType } from 'zod'

export const isZodSchemaOptional = function (schema: ZodType) {
    return schema.safeParse(undefined).success
}
