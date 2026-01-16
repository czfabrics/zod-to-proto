import { SchemaError } from '#zod_converter/types/error'
import {
    AnyZodPassthroughInner,
    WithMaybeZodPassthrough,
} from '#zod_converter/types/passthroughs'
import { ZodPrimitifType, ZodPrimitifTypeTuple } from '#zod_converter/types/primitifs'

type AssertsZodPrimitifTypeFn = <TSchema extends AnyZodPassthroughInner>(
    schema: WithMaybeZodPassthrough<TSchema>
) => asserts schema is WithMaybeZodPassthrough<TSchema & ZodPrimitifType>

export const assertsZodPrimitifType: AssertsZodPrimitifTypeFn = function <
    TSchema extends AnyZodPassthroughInner,
>(
    schema: WithMaybeZodPassthrough<TSchema>
): asserts schema is WithMaybeZodPassthrough<TSchema & ZodPrimitifType> {
    if (!ZodPrimitifType.is(schema)) {
        const validZodTypes = ZodPrimitifTypeTuple.get()

        throw SchemaError.new(
            `The schema type should be one of: [${validZodTypes.join(', ')}]`,
            schema,
            'assertsZodPrimitifType'
        )
    }
}
