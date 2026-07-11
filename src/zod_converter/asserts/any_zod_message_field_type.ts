import type { ZodConversionContext } from '#zod_converter/types/conversion'
import { SchemaError } from '#zod_converter/types/error'
import {
    AnyZodMessageFieldType,
    AnyZodMessageFieldTypeTuple,
} from '#zod_converter/types/messages'
import type {
    AnyZodPassthroughInner,
    WithMaybeZodPassthrough,
} from '#zod_converter/types/passthroughs'

type AssertsAnyZodMessageFieldTypeFn = <TSchema extends AnyZodPassthroughInner>(
    context: ZodConversionContext,
    schema: WithMaybeZodPassthrough<TSchema>
) => asserts schema is WithMaybeZodPassthrough<TSchema & AnyZodMessageFieldType>

export const assertsAnyZodMessageFieldType: AssertsAnyZodMessageFieldTypeFn = function <
    TSchema extends AnyZodPassthroughInner,
>(
    context: ZodConversionContext,
    schema: WithMaybeZodPassthrough<TSchema>
): asserts schema is WithMaybeZodPassthrough<TSchema & AnyZodMessageFieldType> {
    if (!AnyZodMessageFieldType.is(context, schema)) {
        const validZodTypes = AnyZodMessageFieldTypeTuple.get()

        throw SchemaError.new(
            `The schema type should be one of: [${validZodTypes.join(', ')}]`,
            schema,
            'assertsAnyZodMessageFieldType'
        )
    }
}
