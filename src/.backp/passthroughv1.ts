import { Prettify } from '#core/types/prettify'
import { TuplifyUnion } from '#core/types/tuplify_union'
import { CastZodTypeFromTypeValue, GetZodTypeValue } from '#core/types/zod'
import { assertsZodObject } from '#zod_converter/asserts/zod_object'
import { zodTypePattern } from '#zod_converter/helpers/zod_type_pattern'
import {
    CompatibleZodType,
    ZodTypeCategory2,
    ZodTypeCategory3,
} from '#zod_converter/types/check'
import { match } from 'ts-pattern'
import { ZodArray, ZodSet } from 'zod'
import { SomeType } from 'zod/v4/core'

export type ZodPassthrough =
    | ZodTypeCategory2
    | Exclude<Exclude<ZodTypeCategory3, ZodArray<SomeType>>, ZodSet<SomeType>>

export type ZodPassthroughTypeValue = Prettify<GetZodTypeValue<ZodPassthrough>>
export type ZodPassthroughTypeTuple = TuplifyUnion<ZodPassthroughTypeValue>

export const ZodPassthrough = {
    is: <TSchema extends SomeType>(
        schema: TSchema
        // @ts-expect-error TODO fuck of
    ): schema is CastZodTypeFromTypeValue<TSchema, ZodPassthroughTypeValue> => {
        const zodTypes: ZodPassthroughTypeTuple = [
            'catch',
            'optional',
            'nonoptional',
            'nullable',
            'readonly',
            'default',
            'prefault',
            'lazy',
            'pipe',
            'intersection',
        ]

        return (zodTypes as string[]).includes(schema._zod.def.type)
    },
    pass: <TSchema extends CompatibleZodType>(
        schema: TSchema
    ): Exclude<TSchema, ZodPassthrough> => {
        if (!ZodPassthrough.is(schema)) {
            return schema as Exclude<TSchema, ZodPassthrough>
        }

        while (true) {
            const inner: CompatibleZodType = match(schema as ZodPassthrough)
                .returnType<CompatibleZodType>()
                .with(
                    zodTypePattern('catch'),
                    zodTypePattern('readonly'),
                    zodTypePattern('default'),
                    zodTypePattern('prefault'),
                    zodTypePattern('nullable'),
                    zodTypePattern('optional'),
                    zodTypePattern('nonoptional'),
                    // @ts-expect-error asserts sur innertype en compatible zod type
                    (schema) => {
                        return schema._zod.def.innerType
                    }
                )
                // @ts-expect-error asserts sur getter() en compatible zod type
                .with(zodTypePattern('lazy'), (schema) => {
                    return schema._zod.def.getter()
                })
                // @ts-expect-error asserts sur out et in en compatible zod type
                .with(zodTypePattern('pipe'), (schema) => {
                    // TODO: faut handle le codec...

                    const isCoerced = !!(
                        schema._zod.def.in._zod.def as { coerce?: boolean }
                    ).coerce
                    const isTransform = !(
                        schema._zod.def.in._zod.def as { coerce?: boolean }
                    ).coerce

                    if (isCoerced) {
                        return schema._zod.def.out
                    }

                    if (isTransform) {
                        return schema._zod.def.in
                    }
                })
                .with(zodTypePattern('intersection'), (schema) => {
                    // TODO: ajouter au typage
                    assertsZodObject(schema._zod.def.right)
                    assertsZodObject(schema._zod.def.left)

                    return schema._zod.def.right.extend(schema._zod.def.left)
                })
                .exhaustive()

            if (ZodPassthrough.is(inner)) {
                schema = inner as TSchema
            } else {
                return inner as Exclude<TSchema, ZodPassthrough>
            }
        }
    },
} as const
