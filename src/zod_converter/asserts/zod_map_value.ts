import { ZodMapValueType, ZodMapValueTypeTuple } from '#zod_converter/types/dynamic_size'
import { SchemaError } from '#zod_converter/types/error'
import type { WithMaybeZodPassthrough } from '#zod_converter/types/passthroughs'
import type { SomeType } from 'zod/v4/core'

type AssertsZodMapValueTypeFn = (
    schema: SomeType
) => asserts schema is WithMaybeZodPassthrough<ZodMapValueType>

export const assertsZodMapValueType: AssertsZodMapValueTypeFn = function (
    schema: SomeType
): asserts schema is WithMaybeZodPassthrough<ZodMapValueType> {
    if (!ZodMapValueType.is(schema)) {
        const validZodTypes = ZodMapValueTypeTuple.get()

        throw SchemaError.new(
            `The schema type should be one of: [${validZodTypes.join(', ')}]`,
            schema,
            'assertsZodMapValueType'
        )
    }
}
