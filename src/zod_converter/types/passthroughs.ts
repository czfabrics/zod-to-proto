import type { CheckTuple } from '#core/types/check_tuple'
import type { Prettify } from '#core/types/prettify'
import { assertsZodCompatibleType } from '#zod_converter/asserts/zod_compatible_type'
import { assertsZodObject } from '#zod_converter/asserts/zod_object'
import { zodTypePattern } from '#zod_converter/helpers/zod_type_pattern'
import type {
    ZodCompatibleType,
    ZodTypeCategoryPassthrough,
    ZodTypeCategoryTwoChildren,
} from '#zod_converter/types/check'
import type {
    CastZodTypeFromTypeValue,
    GetZodTypeValue,
} from '#zod_converter/types/zod_type_value'
import { match } from 'ts-pattern'
import type { SomeType } from 'zod/v4/core'

export type ZodPassthroughType = ZodTypeCategoryTwoChildren | ZodTypeCategoryPassthrough

export type ZodPassthroughTypeValue = Prettify<GetZodTypeValue<ZodPassthroughType>>
export type ZodPassthroughTypeTuple = ZodPassthroughTypeValue[]

export const ZodPassthroughTypeTuple = {
    new: function <const TValues extends string[]>(
        values: CheckTuple<ZodPassthroughTypeValue, TValues>
    ): ZodPassthroughTypeTuple {
        return values as ZodPassthroughTypeTuple
    },
} as const

export const ZodPassthroughType = {
    is: <TSchema extends SomeType>(
        schema: TSchema
        // @ts-expect-error TS compiler doesn't like this type CastZodTypeFromTypeValue but it works...
    ): schema is CastZodTypeFromTypeValue<TSchema, ZodPassthroughType> => {
        const zodTypes: ZodPassthroughTypeTuple = ZodPassthroughTypeTuple.new([
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
        ])

        return (zodTypes as string[]).includes(schema._zod.def.type)
    },
    pass: <TSchema extends ZodCompatibleType>(
        schema: TSchema
    ): Exclude<TSchema, ZodPassthroughType> => {
        if (!ZodPassthroughType.is(schema)) {
            return schema as Exclude<TSchema, ZodPassthroughType>
        }

        while (true) {
            const inner: ZodCompatibleType = match(schema as ZodPassthroughType)
                .returnType<ZodCompatibleType>()
                .with(
                    zodTypePattern('catch'),
                    zodTypePattern('readonly'),
                    zodTypePattern('default'),
                    zodTypePattern('prefault'),
                    zodTypePattern('nullable'),
                    zodTypePattern('optional'),
                    zodTypePattern('nonoptional'),
                    (schema) => {
                        assertsZodCompatibleType(schema._zod.def.innerType)

                        return schema._zod.def.innerType
                    }
                )
                .with(zodTypePattern('lazy'), (schema) => {
                    const lazySchema = schema._zod.def.getter()

                    assertsZodCompatibleType(lazySchema)

                    return lazySchema
                })
                .with(zodTypePattern('pipe'), (schema) => {
                    assertsZodCompatibleType(schema._zod.def.in)

                    return schema._zod.def.in
                })
                .with(zodTypePattern('intersection'), (schema) => {
                    // TODO: ajouter au typage
                    assertsZodObject(schema._zod.def.right)
                    assertsZodObject(schema._zod.def.left)

                    return schema._zod.def.right.extend(schema._zod.def.left)
                })
                .exhaustive()

            if (ZodPassthroughType.is(inner)) {
                schema = inner as TSchema
            } else {
                return inner as Exclude<TSchema, ZodPassthroughType>
            }
        }
    },
} as const
