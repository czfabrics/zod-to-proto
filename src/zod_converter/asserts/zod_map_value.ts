import type { ZodCompatibleType } from '#zod_converter/types/check'
import {
    ZodMapValueType,
    ZodMapValueTypeTuple,
} from '#zod_converter/types/complex_primitifs'
import { SchemaError } from '#zod_converter/types/error'
import { ZodPassthroughType } from '#zod_converter/types/passthroughs'
import type { SomeType } from 'zod/v4/core'

type AssertsZodMapValueTypeFn = (
    schema: SomeType
) => asserts schema is ZodMapValueType | ZodPassthroughType

export const assertsZodMapValueType: AssertsZodMapValueTypeFn = function (
    schema: SomeType
): asserts schema is ZodMapValueType | ZodPassthroughType {
    if (ZodPassthroughType.is(schema)) {
        schema = ZodPassthroughType.pass(schema as unknown as ZodCompatibleType)
    }

    if (!ZodMapValueType.is(schema)) {
        const validZodTypes = ZodMapValueTypeTuple.get()

        throw SchemaError.new(
            `The schema type should be one of: [${validZodTypes.join(', ')}]`,
            schema,
            'assertsZodMapValueType'
        )
    }
}
