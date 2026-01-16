import type { CheckTuple } from '#core/types/check_tuple'
import type { Prettify } from '#core/types/prettify'
import { assertsZodCompatibleType } from '#zod_converter/asserts/zod_compatible_type'
import { assertsZodObject } from '#zod_converter/asserts/zod_object'
import { zodTypePattern } from '#zod_converter/helpers/zod_type_pattern'
import type {
    ZodCompatibleType,
    ZodTypeCategoryOneChildCasseCouille,
    ZodTypeCategoryPassthrough,
} from '#zod_converter/types/check'
import { SomeZodObject } from '#zod_converter/types/some_type'
import type { GetZodTypeValue } from '#zod_converter/types/zod_type_value'
import { match } from 'ts-pattern'
import type { SomeType } from 'zod/v4/core'

export type AnyZodPassthroughInner = SomeType | SomeZodObject

export type ZodPassthroughTypeNotRecursive<
    TInner extends AnyZodPassthroughInner = AnyZodPassthroughInner,
> = TInner extends SomeZodObject
    ? ZodTypeCategoryOneChildCasseCouille<TInner> | ZodTypeCategoryPassthrough<TInner>
    : ZodTypeCategoryPassthrough<TInner>

export type ZodPassthroughType<
    TInner extends AnyZodPassthroughInner = AnyZodPassthroughInner,
> =
    TInner extends ZodPassthroughTypeNotRecursive<infer TNewInner>
        ? ZodPassthroughType<TNewInner>
        : ZodPassthroughTypeNotRecursive<TInner>

export type PassthroughTypeToExtractZodSchema<TSchema extends AnyZodPassthroughInner> =
    TSchema extends ZodPassthroughType<infer TDeepSchema>
        ? PassthroughTypeToExtractZodSchema<TDeepSchema>
        : TSchema
export type WithMaybeZodPassthrough<TSchema extends AnyZodPassthroughInner> =
    | ZodPassthroughType<TSchema>
    | PassthroughTypeToExtractZodSchema<TSchema>

export type ZodPassthroughTypeValue = Prettify<
    GetZodTypeValue<ZodPassthroughTypeNotRecursive>
>
export type ZodPassthroughTypeTuple = ZodPassthroughTypeValue[]

export const ZodPassthroughTypeTuple = {
    new: function <const TValues extends string[]>(
        values: CheckTuple<ZodPassthroughTypeValue, TValues>
    ): ZodPassthroughTypeTuple {
        return values as ZodPassthroughTypeTuple
    },
} as const

export const ZodPassthroughType = {
    is: <TSchema extends AnyZodPassthroughInner>(
        schema: WithMaybeZodPassthrough<TSchema>
    ): schema is ZodPassthroughType<TSchema> => {
        const zodTypes: string[] = ZodPassthroughTypeTuple.new([
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

        return zodTypes.includes(schema._zod.def.type)
    },
    pass: <TSchema extends AnyZodPassthroughInner>(
        schema: WithMaybeZodPassthrough<TSchema>
    ): PassthroughTypeToExtractZodSchema<TSchema> => {
        if (!ZodPassthroughType.is(schema)) {
            return schema
        }

        let passthroughSchema: ZodPassthroughType = schema

        while (true) {
            const inner: AnyZodPassthroughInner = match(passthroughSchema)
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
                    assertsZodObject(schema._zod.def.right)
                    assertsZodObject(schema._zod.def.left)

                    return schema._zod.def.left.extend(schema._zod.def.right['shape'])
                })
                .exhaustive()

            if (ZodPassthroughType.is(inner)) {
                passthroughSchema = inner
            } else {
                return inner as PassthroughTypeToExtractZodSchema<TSchema>
            }
        }
    },
} as const
