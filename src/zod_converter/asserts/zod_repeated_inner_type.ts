import type { ZodConversionContext } from '#zod_converter/types/conversion'
import {
    ZodRepeatedInnerType,
    ZodRepeatedInnerTypeTuple,
} from '#zod_converter/types/dynamic_size'
import { SchemaError } from '#zod_converter/types/error'
import type { WithMaybeZodPassthrough } from '#zod_converter/types/passthroughs'
import type { SomeType } from 'zod/v4/core'

type AssertsZodRepeatedInnerTypeFn = (
    context: ZodConversionContext,
    schema: SomeType
) => asserts schema is WithMaybeZodPassthrough<ZodRepeatedInnerType>

export const assertsZodRepeatedInnerType: AssertsZodRepeatedInnerTypeFn = function (
    context: ZodConversionContext,
    schema: SomeType
): asserts schema is WithMaybeZodPassthrough<ZodRepeatedInnerType> {
    if (!ZodRepeatedInnerType.is(context, schema)) {
        const validZodTypes = ZodRepeatedInnerTypeTuple.get()

        throw SchemaError.new(
            `The schema type should be one of: [${validZodTypes.join(', ')}]`,
            schema,
            'assertsZodRepeatedInnerType'
        )
    }
}
