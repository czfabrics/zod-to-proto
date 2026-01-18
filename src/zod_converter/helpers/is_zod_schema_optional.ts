import type { ZodType } from 'zod'

export const isZodSchemaOptional = function (schema: ZodType): boolean {
    return schema.safeParse(undefined).success
}
