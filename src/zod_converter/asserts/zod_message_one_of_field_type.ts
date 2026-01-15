import type { ZodCompatibleType } from '#zod_converter/types/check'
import { SchemaError } from '#zod_converter/types/error'
import {
    ZodMessageOneOfFieldType,
    ZodMessageOneOfFieldTypeTuple,
} from '#zod_converter/types/messages'
import { ZodPassthroughType } from '#zod_converter/types/passthroughs'
import type { SomeType } from 'node_modules/zod/v4/core/schemas'

type AssertsZodMessageOneOfFieldTypeFn = <TSchema extends SomeType>(
    schema: TSchema
    // @ts-expect-error fuck of
) => asserts schema is ZodMessageOneOfFieldType | ZodPassthroughType

export const assertsZodMessageOneOfFieldType: AssertsZodMessageOneOfFieldTypeFn =
    function <TSchema extends SomeType>(
        schema: TSchema
        // @ts-expect-error fuck of
    ): asserts schema is ZodMessageOneOfFieldType | ZodPassthroughType {
        if (ZodPassthroughType.is(schema)) {
            schema = ZodPassthroughType.pass(
                schema as unknown as ZodCompatibleType
            ) as unknown as TSchema
        }

        if (!ZodMessageOneOfFieldType.is(schema)) {
            const validZodTypes = ZodMessageOneOfFieldTypeTuple.get()

            throw SchemaError.new(
                `The schema type should be one of: [${validZodTypes.join(', ')}]`,
                schema,
                'assertsZodMessageFieldType'
            )
        }
    }
