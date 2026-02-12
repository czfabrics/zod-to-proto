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

type ZodCategoryPassthroughDeep<
    TAcc extends SomeType,
    TDeep extends number,
    TRawCurrentDeep extends string[] = [],
    TCurrentDeep extends number = TRawCurrentDeep['length'],
> = TCurrentDeep extends TDeep
    ? TAcc
    : ZodCategoryPassthroughDeep<
          TAcc | ZodCategoryPassthrough<TAcc>,
          TDeep,
          [...TRawCurrentDeep, '+1']
      >

type ZodPassthroughTypeDeep<
    TAcc extends SomeType,
    TDeep extends number,
    TRawCurrentDeep extends string[] = [],
    TCurrentDeep extends number = TRawCurrentDeep['length'],
> = TCurrentDeep extends TDeep
    ? TAcc
    : ZodPassthroughTypeDeep<
          TAcc | ZodPassthroughType<TAcc>,
          TDeep,
          [...TRawCurrentDeep, '+1']
      >

type ZodObjectIntersection<TChild extends SomeType = SomeType> =
    TChild extends SomeZodObject<util.Extend<infer TPartialChild1, infer TPartialChild2>>
        ? ZodIntersection<
              ZodCategoryPassthroughDeep<
                  SomeZodObject<TPartialChild1['_zod']['def']['shape']>,
                  5
              >,
              ZodCategoryPassthroughDeep<
                  SomeZodObject<TPartialChild2['_zod']['def']['shape']>,
                  5
              >
          >
        : never

export type ExtractZodPassthroughInner<
    TInner extends AnyZodPassthroughInner = AnyZodPassthroughInner,
> =
    TInner extends ZodPassthroughType<infer TNewInner>
        ? ExtractZodPassthroughInner<TNewInner>
        : TInner

export type ZodPassthroughType<
    TInner extends AnyZodPassthroughInner = AnyZodPassthroughInner,
> = ZodObjectIntersection<TInner> | ZodCategoryPassthrough<TInner>

export type WithMaybeZodPassthrough<TSchema extends AnyZodPassthroughInner> =
    | ZodPassthroughTypeDeep<TSchema, 1>
    | TSchema

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
    is: <TSchema extends AnyZodPassthroughInner>(
        schema: WithMaybeZodPassthrough<TSchema>
    ): schema is WithMaybeZodPassthrough<TSchema> => {
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

        let passthroughSchema: ZodPassthroughType = schema as ZodPassthroughType

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
                passthroughSchema = inner as ZodPassthroughType
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

        let passthroughSchema: ZodPassthroughType = schema as ZodPassthroughType

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
                passthroughSchema = inner as ZodPassthroughType
            } else {
                return allMeta
            }
        }
    },
} as const
