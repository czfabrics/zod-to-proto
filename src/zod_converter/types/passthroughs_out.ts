import type { CheckTuple } from '#core/types/check_tuple'
import type { Prettify } from '#core/types/prettify'
import { assertsZodCompatibleType } from '#zod_converter/asserts/zod_compatible_type'
import { assertsZodObject } from '#zod_converter/asserts/zod_object'
import type {
    ZodCategoryPassthroughOut,
    ZodCompatibleType,
} from '#zod_converter/types/check'
import type {
    AnyZodPassthroughInner,
    WithMaybeZodPassthrough,
} from '#zod_converter/types/passthroughs'
import type { SomeZodObject } from '#zod_converter/types/some_type'
import type { GetZodTypeValue } from '#zod_converter/types/zod_type_value'
import { match, P } from 'ts-pattern'
import type { ZodIntersection, ZodType } from 'zod'
import type { GlobalMeta, SomeType } from 'zod/v4/core'
import { util } from 'zod/v4/core'

type ZodCategoryPassthroughOutDeep<
    TAcc extends SomeType,
    TDeep extends number,
    TRawCurrentDeep extends string[] = [],
    TCurrentDeep extends number = TRawCurrentDeep['length'],
> = TCurrentDeep extends TDeep
    ? TAcc
    : ZodCategoryPassthroughOutDeep<
          TAcc | ZodCategoryPassthroughOut<TAcc>,
          TDeep,
          [...TRawCurrentDeep, '+1']
      >

type ZodPassthroughOutTypeDeep<
    TAcc extends SomeType,
    TDeep extends number,
    TRawCurrentDeep extends string[] = [],
    TCurrentDeep extends number = TRawCurrentDeep['length'],
> = TCurrentDeep extends TDeep
    ? TAcc
    : ZodPassthroughOutTypeDeep<
          TAcc | ZodPassthroughOutType<TAcc>,
          TDeep,
          [...TRawCurrentDeep, '+1']
      >

type ZodObjectIntersectionOut<TChild extends SomeType = SomeType> =
    TChild extends SomeZodObject<util.Extend<infer TPartialChild1, infer TPartialChild2>>
        ? ZodIntersection<
              ZodCategoryPassthroughOutDeep<
                  SomeZodObject<TPartialChild1['_zod']['def']['shape']>,
                  5
              >,
              ZodCategoryPassthroughOutDeep<
                  SomeZodObject<TPartialChild2['_zod']['def']['shape']>,
                  5
              >
          >
        : never

export type ExtractZodPassthroughOutInner<
    TInner extends AnyZodPassthroughInner = AnyZodPassthroughInner,
> =
    TInner extends ZodPassthroughOutType<infer TNewInner>
        ? ExtractZodPassthroughOutInner<TNewInner>
        : TInner

export type ZodPassthroughOutType<
    TInner extends AnyZodPassthroughInner = AnyZodPassthroughInner,
> = ZodObjectIntersectionOut<TInner> | ZodCategoryPassthroughOut<TInner>

export type WithMaybeZodPassthroughOut<TSchema extends AnyZodPassthroughInner> =
    | ZodPassthroughOutTypeDeep<TSchema, 1>
    | TSchema

export type WithZodPassthroughOut<TSchema extends AnyZodPassthroughInner> =
    ZodPassthroughOutTypeDeep<TSchema, 1>

export type ZodPassthroughOutTypeValue = Prettify<GetZodTypeValue<ZodPassthroughOutType>>
export type ZodPassthroughOutTypeTuple = ZodPassthroughOutTypeValue[]

export const ZodPassthroughOutTypeTuple = {
    new: function <const TValues extends string[]>(
        values: CheckTuple<ZodPassthroughOutTypeValue, TValues>
    ): ZodPassthroughOutTypeTuple {
        return values as ZodPassthroughOutTypeTuple
    },
} as const

export const ZodPassthroughOutType = {
    is: <TSchema extends AnyZodPassthroughInner>(
        schema: WithMaybeZodPassthrough<TSchema>
    ): schema is WithZodPassthroughOut<TSchema> => {
        const zodTypes: string[] = ZodPassthroughOutTypeTuple.new([
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
        schema: WithMaybeZodPassthroughOut<TSchema>
    ): TSchema => {
        if (!ZodPassthroughOutType.is(schema)) {
            return schema
        }

        let passthroughSchema: ZodPassthroughOutType = schema as ZodPassthroughOutType

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
                        assertsZodCompatibleType(schema._zod.def.out)

                        return schema._zod.def.out
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

            if (ZodPassthroughOutType.is(inner)) {
                passthroughSchema = inner as ZodPassthroughOutType
            } else {
                return inner as TSchema
            }
        }
    },
    getMetaAsDeepAsPossible: (
        schema: WithMaybeZodPassthroughOut<AnyZodPassthroughInner>
    ): GlobalMeta[] => {
        const allMeta: GlobalMeta[] = [(schema as ZodType).meta() ?? {}]

        if (!ZodPassthroughOutType.is(schema)) {
            return allMeta
        }

        let passthroughSchema: ZodPassthroughOutType = schema as ZodPassthroughOutType

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
                        assertsZodCompatibleType(schema._zod.def.out)

                        return schema._zod.def.out
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

            if (ZodPassthroughOutType.is(inner)) {
                passthroughSchema = inner as ZodPassthroughOutType
            } else {
                return allMeta
            }
        }
    },
} as const
