import {
    ZodRepeatedInnerType,
    ZodRepeatedInnerTypeTuple,
} from '#zod_converter/types/complex_primitifs'
import { SchemaError } from '#zod_converter/types/error'
import {
    AnyZodPassthroughInner,
    WithMaybeZodPassthrough,
} from '#zod_converter/types/passthroughs'

type AssertsZodRepeatedInnerTypeFn = <TSchema extends AnyZodPassthroughInner>(
    schema: WithMaybeZodPassthrough<TSchema>
) => asserts schema is WithMaybeZodPassthrough<TSchema & ZodRepeatedInnerType>

export const assertsZodRepeatedInnerType: AssertsZodRepeatedInnerTypeFn = function <
    TSchema extends AnyZodPassthroughInner,
>(
    schema: WithMaybeZodPassthrough<TSchema>
): asserts schema is WithMaybeZodPassthrough<TSchema & ZodRepeatedInnerType> {
    if (!ZodRepeatedInnerType.is(schema)) {
        const validZodTypes = ZodRepeatedInnerTypeTuple.get()

        throw SchemaError.new(
            `The schema type should be one of: [${validZodTypes.join(', ')}]`,
            schema,
            'assertsZodRepeatedInnerType'
        )
    }
}
