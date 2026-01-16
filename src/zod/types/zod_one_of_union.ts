import type { ZodDiscriminatedUnion, ZodLiteral, ZodObject } from 'zod'
import { $ZodTypeDiscriminable } from 'zod/v4/core'

/**
 * This type represents the result of `github.com/stephenh/ts-proto`
 * when `oneof=unions-value` is enabled
 */
export type ZodOneOfUnion<
    TOptions extends readonly ZodObject<{
        $case: ZodLiteral<string>
        value: $ZodTypeDiscriminable
    }>[] = readonly ZodObject<{
        $case: ZodLiteral<string>
        value: $ZodTypeDiscriminable
    }>[],
> = ZodDiscriminatedUnion<TOptions, '$case'>
