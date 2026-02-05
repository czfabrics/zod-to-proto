import type { ZodDiscriminatedUnion, ZodLiteral, ZodObject } from 'zod'
import type { $ZodType } from 'zod/v4/core'

/**
 * This type represents the result of `github.com/stephenh/ts-proto`
 * when `oneof=unions-value` is enabled
 */
export type ZodOneOfUnion<
    TOptions extends readonly ZodObject<{
        $case: ZodLiteral<string>
        value: $ZodType
    }>[] = readonly ZodObject<{
        $case: ZodLiteral<string>
        value: $ZodType
    }>[],
> = ZodDiscriminatedUnion<TOptions, '$case'>
