import type { ZodConversionContext } from '#zod_converter/types/conversion'
import { SchemaError } from '#zod_converter/types/error'
import type { WithMaybeZodPassthrough } from '#zod_converter/types/passthroughs'
import { ZodScalarType, ZodScalarTypeTuple } from '#zod_converter/types/scalars'
import type { SomeType } from 'zod/v4/core'

type AssertsZodScalarTypeFn = (
    context: ZodConversionContext,
    schema: SomeType
) => asserts schema is WithMaybeZodPassthrough<ZodScalarType>

export const assertsZodScalarType: AssertsZodScalarTypeFn = function (
    context: ZodConversionContext,
    schema: SomeType
): asserts schema is WithMaybeZodPassthrough<ZodScalarType> {
    if (!ZodScalarType.is(context, schema)) {
        const validZodTypes = ZodScalarTypeTuple.get()

        throw SchemaError.new(
            `The schema type should be one of: [${validZodTypes.join(', ')}]`,
            schema,
            'assertsZodScalarType'
        )
    }
}
