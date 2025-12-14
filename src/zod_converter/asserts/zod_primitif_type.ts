import type { ZodCompatibleType } from '#zod_converter/types/check'
import { SchemaError } from '#zod_converter/types/error'
import { ZodPassthroughType } from '#zod_converter/types/passthroughs'
import { ZodPrimitifType, ZodPrimitifTypeTuple } from '#zod_converter/types/primitifs'
import type { SomeType } from 'zod/v4/core'

type AssertsZodPrimitifTypeFn = (
    schema: SomeType
) => asserts schema is ZodPrimitifType | ZodPassthroughType

export const assertsZodPrimitifType: AssertsZodPrimitifTypeFn = function (
    schema: SomeType
): asserts schema is ZodPrimitifType | ZodPassthroughType {
    if (ZodPassthroughType.is(schema)) {
        schema = ZodPassthroughType.pass(schema as unknown as ZodCompatibleType)
    }

    if (!ZodPrimitifType.is(schema)) {
        const validZodTypes = ZodPrimitifTypeTuple.get()

        throw SchemaError.new(
            `The schema type should be one of: [${validZodTypes.join(', ')}]`,
            schema,
            'assertsZodPrimitifType'
        )
    }
}
