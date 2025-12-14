import { CastZodTypeFromTypeValue, GetZodTypeValue } from '#core/types/zod'
import { ZodPassthrough } from '#zod_converter/types/passthrough'
import { ZodPrimitif } from '#zod_converter/types/primitif'
import { SomeType } from 'zod/v4/core'

type AssertsZodPrimitifTypeFn = <TSchema extends SomeType>(
    schema: TSchema
    // @ts-expect-error fuck of
) => asserts schema is CastZodTypeFromTypeValue<
    TSchema,
    // TODO: le typage ici est encore claqué, faut voir dans zod_complex_primitif_converter
    GetZodTypeValue<ZodPrimitif> | GetZodTypeValue<ZodPassthrough>
>

export const assertsZodPrimitifType: AssertsZodPrimitifTypeFn = function <
    TSchema extends SomeType,
>(
    schema: TSchema
    // @ts-expect-error fuck of
): asserts schema is CastZodTypeFromTypeValue<
    TSchema,
    GetZodTypeValue<ZodPrimitif> | GetZodTypeValue<ZodPassthrough>
> {
    if (!ZodPrimitif.is(schema)) {
        throw new Error() // TODO: error message
    }
}
