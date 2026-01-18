import type { CheckTuple } from '#core/types/check_tuple'
import type { Prettify } from '#core/types/prettify'
import { assertsZodCompatibleType } from '#zod_converter/asserts/zod_compatible_type'
import { assertsZodObject } from '#zod_converter/asserts/zod_object'
import { zodTypePattern } from '#zod_converter/helpers/zod_type_pattern'
import type {
    ZodCategoryPassthrough,
    ZodCompatibleType,
} from '#zod_converter/types/check'
import type { SomeZodObject } from '#zod_converter/types/some_type'
import type { GetZodTypeValue } from '#zod_converter/types/zod_type_value'
import { match } from 'ts-pattern'
import type { ZodIntersection, ZodObject, ZodType } from 'zod'
import type { GlobalMeta, SomeType, util } from 'zod/v4/core'

export type AnyZodPassthroughInner = SomeType | SomeZodObject

type ZodObjectIntersection<TChild extends SomeZodObject = SomeZodObject> =
    TChild extends SomeZodObject<util.Extend<infer TPartialChild1, infer TPartialChild2>>
        ? ZodIntersection<SomeZodObject<TPartialChild1>, SomeZodObject<TPartialChild2>>
        : never

export type ZodPassthroughTypeNotRecursive<
    TInner extends AnyZodPassthroughInner = AnyZodPassthroughInner,
> = TInner extends SomeZodObject
    ? ZodObjectIntersection<TInner> | ZodCategoryPassthrough<TInner>
    : ZodCategoryPassthrough<TInner>

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

                    const finalSchema = schema._zod.def.left.extend(
                        schema._zod.def.right['shape']
                    )

                    assertsZodCompatibleType(finalSchema)

                    return finalSchema
                })
                .exhaustive()

            if (ZodPassthroughType.is(inner)) {
                passthroughSchema = inner
            } else {
                return inner as PassthroughTypeToExtractZodSchema<TSchema>
            }
        }
    },
    getMetaAsDeepAsPossible: (
        schema: WithMaybeZodPassthrough<ZodType | ZodObject>
    ): GlobalMeta[] => {
        const allMeta: GlobalMeta[] = [schema.meta() ?? {}]

        if (!ZodPassthroughType.is(schema)) {
            return allMeta
        }

        let passthroughSchema: ZodPassthroughType = schema

        while (true) {
            const inner: ZodType | ZodObject = match(passthroughSchema)
                .returnType<ZodCompatibleType>()
                .with(
                    zodTypePattern('catch'),
                    zodTypePattern('readonly'),
                    zodTypePattern('default'),
                    zodTypePattern('prefault'),
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

                    const finalSchema = schema._zod.def.left.extend(
                        schema._zod.def.right['shape']
                    )

                    assertsZodCompatibleType(finalSchema)

                    return finalSchema
                })
                .exhaustive()

            allMeta.push(inner.meta() ?? {})

            if (ZodPassthroughType.is(inner)) {
                passthroughSchema = inner
            } else {
                return allMeta
            }
        }
    },
} as const
