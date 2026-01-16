import { SchemaError } from '#zod_converter/types/error'
import {
    ZodMessageFieldType,
    ZodMessageFieldTypeTuple,
} from '#zod_converter/types/messages'
import {
    AnyZodPassthroughInner,
    WithMaybeZodPassthrough,
} from '#zod_converter/types/passthroughs'

type AssertsZodMessageFieldTypeFn = <TSchema extends AnyZodPassthroughInner>(
    schema: WithMaybeZodPassthrough<TSchema>
) => asserts schema is WithMaybeZodPassthrough<TSchema & ZodMessageFieldType>

export const assertsZodMessageFieldType: AssertsZodMessageFieldTypeFn = function <
    TSchema extends AnyZodPassthroughInner,
>(
    schema: WithMaybeZodPassthrough<TSchema>
): asserts schema is WithMaybeZodPassthrough<TSchema & ZodMessageFieldType> {
    if (!ZodMessageFieldType.is(schema)) {
        const validZodTypes = ZodMessageFieldTypeTuple.get()

        throw SchemaError.new(
            `The schema type should be one of: [${validZodTypes.join(', ')}]`,
            schema,
            'assertsZodMessageFieldType'
        )
    }
}
