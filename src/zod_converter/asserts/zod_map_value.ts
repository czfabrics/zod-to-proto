import { ZodMapValueType, ZodMapValueTypeTuple } from '#zod_converter/types/dynamic_size'
import { SchemaError } from '#zod_converter/types/error'
import {
    AnyZodPassthroughInner,
    WithMaybeZodPassthrough,
} from '#zod_converter/types/passthroughs'

type AssertsZodMapValueTypeFn = <TSchema extends AnyZodPassthroughInner>(
    schema: WithMaybeZodPassthrough<TSchema>
) => asserts schema is WithMaybeZodPassthrough<TSchema & ZodMapValueType>

export const assertsZodMapValueType: AssertsZodMapValueTypeFn = function <
    TSchema extends AnyZodPassthroughInner,
>(
    schema: WithMaybeZodPassthrough<TSchema>
): asserts schema is WithMaybeZodPassthrough<TSchema & ZodMapValueType> {
    if (!ZodMapValueType.is(schema)) {
        const validZodTypes = ZodMapValueTypeTuple.get()

        throw SchemaError.new(
            `The schema type should be one of: [${validZodTypes.join(', ')}]`,
            schema,
            'assertsZodMapValueType'
        )
    }
}
