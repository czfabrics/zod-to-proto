import type { CheckTuple } from '#core/types/check_tuple'
import type { Prettify } from '#core/types/prettify'
import { assertsZodCompatibleType } from '#zod_converter/asserts/zod_compatible_type'
import { assertsZodObject } from '#zod_converter/asserts/zod_object'
import type {
    ZodCategoryPassthrough,
    ZodCompatibleType,
} from '#zod_converter/types/check'
import type { SomeZodObject } from '#zod_converter/types/some_type'
import type { GetZodTypeValue } from '#zod_converter/types/zod_type_value'
import { match, P } from 'ts-pattern'
import type { ZodIntersection, ZodType } from 'zod'
import type { GlobalMeta, SomeType } from 'zod/v4/core'
import { util } from 'zod/v4/core'

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

export type WithMaybeZodPassthrough<TSchema extends AnyZodPassthroughInner> =
    | ZodPassthroughType<TSchema>
    | TSchema

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
    ): TSchema => {
        if (!ZodPassthroughType.is(schema)) {
            return schema
        }

        let passthroughSchema: ZodPassthroughType = schema

        while (true) {
            const inner: AnyZodPassthroughInner = match(passthroughSchema)
                .returnType<ZodCompatibleType>()
                .with(
                    {
                        _zod: {
                            def: {
                                type: P.union(
                                    'catch',
                                    'readonly',
                                    'default',
                                    'prefault',
                                    'optional',
                                    'nonoptional'
                                ),
                            },
                        },
                    },
                    (schema) => {
                        assertsZodCompatibleType(schema._zod.def.innerType)

                        return schema._zod.def.innerType
                    }
                )
                .with(
                    {
                        _zod: {
                            def: {
                                type: 'lazy',
                            },
                        },
                    },
                    (schema) => {
                        const lazySchema = schema._zod.def.getter()

                        assertsZodCompatibleType(lazySchema)

                        return lazySchema
                    }
                )
                .with(
                    {
                        _zod: {
                            def: {
                                type: 'pipe',
                            },
                        },
                    },
                    (schema) => {
                        assertsZodCompatibleType(schema._zod.def.in)

                        return schema._zod.def.in
                    }
                )
                .with(
                    {
                        _zod: {
                            def: {
                                type: 'intersection',
                            },
                        },
                    },
                    (schema) => {
                        assertsZodObject(schema._zod.def.right)
                        assertsZodObject(schema._zod.def.left)

                        const finalSchema = schema._zod.def.left.extend(
                            schema._zod.def.right['shape']
                        )

                        assertsZodCompatibleType(finalSchema)

                        return finalSchema
                    }
                )
                .exhaustive()

            if (ZodPassthroughType.is(inner)) {
                passthroughSchema = inner
            } else {
                return inner as TSchema
            }
        }
    },
    getMetaAsDeepAsPossible: (
        schema: WithMaybeZodPassthrough<AnyZodPassthroughInner>
    ): GlobalMeta[] => {
        const allMeta: GlobalMeta[] = [(schema as ZodType).meta() ?? {}]

        if (!ZodPassthroughType.is(schema)) {
            return allMeta
        }

        let passthroughSchema: ZodPassthroughType = schema

        while (true) {
            const inner: AnyZodPassthroughInner = match(passthroughSchema)
                .returnType<ZodCompatibleType>()
                .with(
                    {
                        _zod: {
                            def: {
                                type: P.union(
                                    'catch',
                                    'readonly',
                                    'default',
                                    'prefault',
                                    'optional',
                                    'nonoptional'
                                ),
                            },
                        },
                    },
                    (schema) => {
                        assertsZodCompatibleType(schema._zod.def.innerType)

                        return schema._zod.def.innerType
                    }
                )
                .with(
                    {
                        _zod: {
                            def: {
                                type: 'lazy',
                            },
                        },
                    },
                    (schema) => {
                        const lazySchema = schema._zod.def.getter()

                        assertsZodCompatibleType(lazySchema)

                        return lazySchema
                    }
                )
                .with(
                    {
                        _zod: {
                            def: {
                                type: 'pipe',
                            },
                        },
                    },
                    (schema) => {
                        assertsZodCompatibleType(schema._zod.def.in)

                        return schema._zod.def.in
                    }
                )
                .with(
                    {
                        _zod: {
                            def: {
                                type: 'intersection',
                            },
                        },
                    },
                    (schema) => {
                        assertsZodObject(schema._zod.def.right)
                        assertsZodObject(schema._zod.def.left)

                        const finalSchema = schema._zod.def.left.extend(
                            schema._zod.def.right['shape']
                        )

                        assertsZodCompatibleType(finalSchema)

                        return finalSchema
                    }
                )
                .exhaustive()

            allMeta.push((inner as ZodType).meta() ?? {})

            if (ZodPassthroughType.is(inner)) {
                passthroughSchema = inner
            } else {
                return allMeta
            }
        }
    },
} as const
