import { SchemaError } from '#zod_converter/types/error'
import { AnyZodMessage, AnyZodMessageTypeTuple } from '#zod_converter/types/messages'
import type {
    AnyZodPassthroughInner,
    WithMaybeZodPassthrough,
} from '#zod_converter/types/passthroughs'

type AssertsAnyZodMessageFn = <TSchema extends AnyZodPassthroughInner>(
    schema: WithMaybeZodPassthrough<TSchema>
) => asserts schema is WithMaybeZodPassthrough<TSchema & AnyZodMessage>

export const assertsAnyZodMessage: AssertsAnyZodMessageFn = function <
    TSchema extends AnyZodPassthroughInner,
>(
    schema: WithMaybeZodPassthrough<TSchema>
): asserts schema is WithMaybeZodPassthrough<TSchema & AnyZodMessage> {
    if (!AnyZodMessage.is(schema)) {
        const validZodTypes = AnyZodMessageTypeTuple.get()

        throw SchemaError.new(
            `The schema type should be one of: [${validZodTypes.join(', ')}]`,
            schema,
            'assertsAnyZodMessage'
        )
    }
}
