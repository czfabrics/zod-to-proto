import type { CheckTuple } from '#core/types/check_tuple'
import type { Prettify } from '#core/types/prettify'
import { assertsZodCompatibleType } from '#zod_converter/asserts/zod_compatible_type'
import { assertsZodObject } from '#zod_converter/asserts/zod_object'
import type {
    ZodCategoryPassthroughIn,
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

type ZodCategoryPassthroughInDeep<
    TAcc extends SomeType,
    TDeep extends number,
    TRawCurrentDeep extends string[] = [],
    TCurrentDeep extends number = TRawCurrentDeep['length'],
> = TCurrentDeep extends TDeep
    ? TAcc
    : ZodCategoryPassthroughInDeep<
          TAcc | ZodCategoryPassthroughIn<TAcc>,
          TDeep,
          [...TRawCurrentDeep, '+1']
      >

type ZodPassthroughInTypeDeep<
    TAcc extends SomeType,
    TDeep extends number,
    TRawCurrentDeep extends string[] = [],
    TCurrentDeep extends number = TRawCurrentDeep['length'],
> = TCurrentDeep extends TDeep
    ? TAcc
    : ZodPassthroughInTypeDeep<
          TAcc | ZodPassthroughInType<TAcc>,
          TDeep,
          [...TRawCurrentDeep, '+1']
      >

type ZodObjectIntersectionIn<TChild extends SomeType = SomeType> =
    TChild extends SomeZodObject<util.Extend<infer TPartialChild1, infer TPartialChild2>>
        ? ZodIntersection<
              ZodCategoryPassthroughInDeep<
                  SomeZodObject<TPartialChild1['_zod']['def']['shape']>,
                  5
              >,
              ZodCategoryPassthroughInDeep<
                  SomeZodObject<TPartialChild2['_zod']['def']['shape']>,
                  5
              >
          >
        : never

export type ExtractZodPassthroughInInner<
    TInner extends AnyZodPassthroughInner = AnyZodPassthroughInner,
> =
    TInner extends ZodPassthroughInType<infer TNewInner>
        ? ExtractZodPassthroughInInner<TNewInner>
        : TInner

export type ZodPassthroughInType<
    TInner extends AnyZodPassthroughInner = AnyZodPassthroughInner,
> = ZodObjectIntersectionIn<TInner> | ZodCategoryPassthroughIn<TInner>

export type WithMaybeZodPassthroughIn<TSchema extends AnyZodPassthroughInner> =
    | ZodPassthroughInTypeDeep<TSchema, 1>
    | TSchema

export type WithZodPassthroughIn<TSchema extends AnyZodPassthroughInner> =
    ZodPassthroughInTypeDeep<TSchema, 1>

export type ZodPassthroughInTypeValue = Prettify<GetZodTypeValue<ZodPassthroughInType>>
export type ZodPassthroughInTypeTuple = ZodPassthroughInTypeValue[]

export const ZodPassthroughInTypeTuple = {
    new: function <const TValues extends string[]>(
        values: CheckTuple<ZodPassthroughInTypeValue, TValues>
    ): ZodPassthroughInTypeTuple {
        return values as ZodPassthroughInTypeTuple
    },
} as const

export const ZodPassthroughInType = {
    is: <TSchema extends AnyZodPassthroughInner>(
        schema: WithMaybeZodPassthrough<TSchema>
    ): schema is WithMaybeZodPassthroughIn<TSchema> => {
        const zodTypes: string[] = ZodPassthroughInTypeTuple.new([
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
        schema: WithMaybeZodPassthroughIn<TSchema>
    ): TSchema => {
        if (!ZodPassthroughInType.is(schema)) {
            return schema
        }

        let passthroughSchema: ZodPassthroughInType = schema as ZodPassthroughInType

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

            if (ZodPassthroughInType.is(inner)) {
                passthroughSchema = inner as ZodPassthroughInType
            } else {
                return inner as TSchema
            }
        }
    },
    getMetaAsDeepAsPossible: (
        schema: WithMaybeZodPassthroughIn<AnyZodPassthroughInner>
    ): GlobalMeta[] => {
        const allMeta: GlobalMeta[] = [(schema as ZodType).meta() ?? {}]

        if (!ZodPassthroughInType.is(schema)) {
            return allMeta
        }

        let passthroughSchema: ZodPassthroughInType = schema as ZodPassthroughInType

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

            if (ZodPassthroughInType.is(inner)) {
                passthroughSchema = inner as ZodPassthroughInType
            } else {
                return allMeta
            }
        }
    },
} as const
