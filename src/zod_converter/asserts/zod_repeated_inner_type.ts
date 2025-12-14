import type { ZodCompatibleType } from '#zod_converter/types/check'
import {
    ZodRepeatedInnerType,
    ZodRepeatedInnerTypeTuple,
} from '#zod_converter/types/complex_primitifs'
import { SchemaError } from '#zod_converter/types/error'
import { ZodPassthroughType } from '#zod_converter/types/passthroughs'
import type { SomeType } from 'zod/v4/core'

type AssertsZodRepeatedInnerTypeFn = (
    schema: SomeType
) => asserts schema is ZodRepeatedInnerType | ZodPassthroughType

export const assertsZodRepeatedInnerType: AssertsZodRepeatedInnerTypeFn = function (
    schema: SomeType
): asserts schema is ZodRepeatedInnerType | ZodPassthroughType {
    if (ZodPassthroughType.is(schema)) {
        schema = ZodPassthroughType.pass(schema as unknown as ZodCompatibleType)
    }

    if (!ZodRepeatedInnerType.is(schema)) {
        const validZodTypes = ZodRepeatedInnerTypeTuple.get()

        throw SchemaError.new(
            `The schema type should be one of: [${validZodTypes.join(', ')}]`,
            schema,
            'assertsZodRepeatedInnerType'
        )
    }
}
