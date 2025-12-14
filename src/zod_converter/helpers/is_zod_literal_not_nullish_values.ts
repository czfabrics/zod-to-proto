import { isZodLiteral } from '#zod_converter/helpers/is_zod_literal'
import { Literal } from '#zod_converter/types/literal'
import { match } from 'ts-pattern'
import type { ZodLiteral } from 'zod'
import { SomeType } from 'zod/v4/core'

export const isZodLiteralNotNullishValues = function (
    schema: SomeType
): schema is ZodLiteral & {
    _zod: { def: { values: Literal[] } }
} {
    if (!isZodLiteral(schema)) {
        return false
    }

    return Array.from(schema.values).every((value) => {
        return match(typeof value)
            .with('string', () => true)
            .with('number', () => true)
            .with('bigint', () => true)
            .with('boolean', () => true)
            .otherwise(() => false)
    })
}
