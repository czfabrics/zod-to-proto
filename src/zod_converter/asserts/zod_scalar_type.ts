import { SchemaError } from '#zod_converter/types/error'
import {
    AnyZodPassthroughInner,
    WithMaybeZodPassthrough,
} from '#zod_converter/types/passthroughs'
import { ZodScalarType, ZodScalarTypeTuple } from '#zod_converter/types/scalars'

type AssertsZodScalarTypeFn = <TSchema extends AnyZodPassthroughInner>(
    schema: WithMaybeZodPassthrough<TSchema>
) => asserts schema is WithMaybeZodPassthrough<TSchema & ZodScalarType>

export const assertsZodScalarType: AssertsZodScalarTypeFn = function <
    TSchema extends AnyZodPassthroughInner,
>(
    schema: WithMaybeZodPassthrough<TSchema>
): asserts schema is WithMaybeZodPassthrough<TSchema & ZodScalarType> {
    if (!ZodScalarType.is(schema)) {
        const validZodTypes = ZodScalarTypeTuple.get()

        throw SchemaError.new(
            `The schema type should be one of: [${validZodTypes.join(', ')}]`,
            schema,
            'assertsZodScalarType'
        )
    }
}
