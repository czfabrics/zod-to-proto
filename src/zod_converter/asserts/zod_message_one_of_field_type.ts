import type { ZodConversionContext } from '#zod_converter/types/conversion'
import { SchemaError } from '#zod_converter/types/error'
import { ZodMessageOneOfFieldType } from '#zod_converter/types/messages'
import type { WithMaybeZodPassthrough } from '#zod_converter/types/passthroughs'
import type { SomeType } from 'zod/v4/core'

type AssertsZodMessageOneOfFieldTypeFn = (
    context: ZodConversionContext,
    schema: SomeType
) => asserts schema is WithMaybeZodPassthrough<ZodMessageOneOfFieldType>

export const assertsZodMessageOneOfFieldType: AssertsZodMessageOneOfFieldTypeFn =
    function (
        context: ZodConversionContext,
        schema: SomeType
    ): asserts schema is WithMaybeZodPassthrough<ZodMessageOneOfFieldType> {
        if (!ZodMessageOneOfFieldType.is(context, schema)) {
            throw SchemaError.new(
                "You should use 'pz.oneOfUnion()' to make an union",
                schema,
                'assertsZodMessageOneOfFieldType'
            )
        }
    }
