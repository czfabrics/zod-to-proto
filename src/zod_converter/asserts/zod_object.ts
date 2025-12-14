import { isZodObject } from '#zod_converter/helpers/is_zod_object'
import { SchemaError } from '#zod_converter/types/error'
import type { ZodObject } from 'zod'
import type { SomeType } from 'zod/v4/core'

type AssertsZodObjectTypeFn = (schema: SomeType) => asserts schema is ZodObject

export const assertsZodObject: AssertsZodObjectTypeFn = function (
    schema: SomeType
): asserts schema is ZodObject {
    if (!isZodObject(schema)) {
        throw SchemaError.new('The schema should be a zod object', schema)
    }
}
