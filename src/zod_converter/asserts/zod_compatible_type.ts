import { CompatibleZodTypeTuple, ZodCompatibleType } from '#zod_converter/types/check2'
import { SchemaError } from '#zod_converter/types/error'
import type { SomeType } from 'zod/v4/core'

type AssertsZodCompatibleTypeFn = <TSchema extends SomeType>(
    schema: TSchema
    // @ts-expect-error fuck of
) => asserts schema is ZodCompatibleType

export const assertsZodCompatibleType: AssertsZodCompatibleTypeFn = function <
    TSchema extends SomeType,
>(
    schema: TSchema
    // @ts-expect-error fuck of
    // faire un SomeCompatibleType
): asserts schema is ZodCompatibleType {
    if (!ZodCompatibleType.is(schema)) {
        const validZodTypes = CompatibleZodTypeTuple.get()

        throw SchemaError.new(
            `The schema type should be one of: [${validZodTypes.join(', ')}]`,
            schema,
            'assertsZodCompatibleType'
        )
    }
}
