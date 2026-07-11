import type { ZodConversionContext } from '#zod_converter/types/conversion'
import { SchemaError } from '#zod_converter/types/error'
import {
    ZodMessageFieldType,
    ZodMessageFieldTypeTuple,
} from '#zod_converter/types/messages'
import type { WithMaybeZodPassthrough } from '#zod_converter/types/passthroughs'
import type { SomeType } from 'zod/v4/core'

type AssertsZodMessageFieldTypeFn = (
    context: ZodConversionContext,
    schema: SomeType
) => asserts schema is WithMaybeZodPassthrough<ZodMessageFieldType>

export const assertsZodMessageFieldType: AssertsZodMessageFieldTypeFn = function (
    context: ZodConversionContext,
    schema: SomeType
): asserts schema is WithMaybeZodPassthrough<ZodMessageFieldType> {
    if (!ZodMessageFieldType.is(context, schema)) {
        const validZodTypes = ZodMessageFieldTypeTuple.get()

        throw SchemaError.new(
            `The schema type should be one of: [${validZodTypes.join(', ')}]`,
            schema,
            'assertsZodMessageFieldType'
        )
    }
}
