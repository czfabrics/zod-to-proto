import type { ZodCompatibleType } from '#zod_converter/types/check'
import { SchemaError } from '#zod_converter/types/error'
import {
    AnyZodMessageFieldType,
    AnyZodMessageFieldTypeTuple,
} from '#zod_converter/types/messages'
import { ZodPassthroughType } from '#zod_converter/types/passthroughs'
import type { SomeType } from 'zod/v4/core'

type AssertsAnyZodMessageFieldTypeFn = <TSchema extends SomeType>(
    schema: TSchema
    // @ts-expect-error fuck of
) => asserts schema is AnyZodMessageFieldType | ZodPassthroughType

export const assertsAnyZodMessageFieldType: AssertsAnyZodMessageFieldTypeFn = function <
    TSchema extends SomeType,
>(
    schema: TSchema
    // @ts-expect-error fuck of
): asserts schema is AnyZodMessageFieldType | ZodPassthroughType {
    if (ZodPassthroughType.is(schema)) {
        schema = ZodPassthroughType.pass(
            schema as unknown as ZodCompatibleType
        ) as unknown as TSchema
    }

    if (!AnyZodMessageFieldType.is(schema)) {
        const validZodTypes = AnyZodMessageFieldTypeTuple.get()

        throw SchemaError.new(
            `The schema type should be one of: [${validZodTypes.join(', ')}]`,
            schema,
            'assertsAnyZodMessageFieldType'
        )
    }
}
