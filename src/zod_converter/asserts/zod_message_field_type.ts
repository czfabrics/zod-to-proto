import type { ZodCompatibleType } from '#zod_converter/types/check'
import { SchemaError } from '#zod_converter/types/error'
import {
    ZodMessageFieldType,
    ZodMessageFieldTypeTuple,
} from '#zod_converter/types/messages'
import { ZodPassthroughType } from '#zod_converter/types/passthroughs'
import type { SomeType } from 'zod/v4/core'

type AssertsZodMessageFieldTypeFn = <TSchema extends SomeType>(
    schema: TSchema
    // @ts-expect-error fuck of
) => asserts schema is ZodMessageFieldType | ZodPassthroughType

export const assertsZodMessageFieldType: AssertsZodMessageFieldTypeFn = function <
    TSchema extends SomeType,
>(
    schema: TSchema
    // @ts-expect-error fuck of
): asserts schema is ZodMessageFieldType | ZodPassthroughType {
    if (ZodPassthroughType.is(schema)) {
        schema = ZodPassthroughType.pass(
            schema as unknown as ZodCompatibleType
        ) as unknown as TSchema
    }

    if (!ZodMessageFieldType.is(schema)) {
        const validZodTypes = ZodMessageFieldTypeTuple.get()

        throw SchemaError.new(
            `The schema type should be one of: [${validZodTypes.join(', ')}]`,
            schema,
            'assertsZodMessageFieldType'
        )
    }
}
