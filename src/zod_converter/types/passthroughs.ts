import {
    ZodPassthroughInType,
    type WithMaybeZodPassthroughIn,
    type WithZodPassthroughIn,
} from '#zod_converter/types/passthroughs_in'
import {
    ZodPassthroughOutType,
    type WithMaybeZodPassthroughOut,
    type WithZodPassthroughOut,
} from '#zod_converter/types/passthroughs_out'
import type { SomeZodObject } from '#zod_converter/types/some_type'
import { match } from 'ts-pattern'
import type { GlobalMeta, SomeType } from 'zod/v4/core'

export type AnyZodPassthroughInner = SomeType | SomeZodObject

export type WithMaybeZodPassthrough<TSchema extends AnyZodPassthroughInner> =
    | WithMaybeZodPassthroughIn<TSchema>
    | WithMaybeZodPassthroughOut<TSchema>
export type WithZodPassthrough<TSchema extends AnyZodPassthroughInner> =
    | WithZodPassthroughIn<TSchema>
    | WithZodPassthroughOut<TSchema>

export type ZodPassthroughDirection = 'IN' | 'OUT'

export const ZodPassthroughType = {
    pass: <TSchema extends AnyZodPassthroughInner>(
        direction: ZodPassthroughDirection,
        schema: WithMaybeZodPassthrough<TSchema>
    ): TSchema => {
        return match(direction)
            .with('IN', () => {
                const schemaCast: WithMaybeZodPassthroughIn<TSchema> =
                    schema as WithMaybeZodPassthroughIn<TSchema>

                if (ZodPassthroughInType.is(schemaCast)) {
                    return ZodPassthroughInType.pass<TSchema>(schemaCast)
                }

                return schemaCast
            })
            .with('OUT', () => {
                const schemaCast: WithMaybeZodPassthroughOut<TSchema> =
                    schema as WithMaybeZodPassthroughOut<TSchema>

                if (ZodPassthroughOutType.is(schemaCast)) {
                    return ZodPassthroughOutType.pass<TSchema>(schemaCast)
                }

                return schemaCast
            })
            .exhaustive()
    },
    getMetaAsDeepAsPossible: (
        direction: ZodPassthroughDirection,
        schema: WithMaybeZodPassthrough<AnyZodPassthroughInner>
    ): GlobalMeta[] => {
        return match(direction)
            .with('IN', () => {
                return ZodPassthroughInType.getMetaAsDeepAsPossible(schema)
            })
            .with('OUT', () => {
                return ZodPassthroughOutType.getMetaAsDeepAsPossible(schema)
            })
            .exhaustive()
    },
} as const
