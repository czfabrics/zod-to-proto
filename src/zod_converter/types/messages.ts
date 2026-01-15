import type { CheckTuple } from '#core/types/check_tuple'
import type { Prettify } from '#core/types/prettify'
import type {
    ZodTypeCategoryChildArray,
    ZodTypeCategoryChildRecord,
} from '#zod_converter/types/check'
import { ZodComplexPrimitifType } from '#zod_converter/types/complex_primitifs'
import { ZodPrimitifType } from '#zod_converter/types/primitifs'
import type {
    CastZodTypeFromTypeValue,
    GetZodTypeValue,
} from '#zod_converter/types/zod_type_value'
import type { ZodEnum } from 'zod'
import type { SomeType } from 'zod/v4/core'

export type AnyZodMessage = ZodTypeCategoryChildRecord | ZodEnum

export type AnyZodMessageTypeValue = Prettify<GetZodTypeValue<AnyZodMessage>>
export type AnyZodMessageTypeTuple = AnyZodMessageTypeValue[]

export const AnyZodMessageTypeTuple = {
    new: function <const TValues extends string[]>(
        values: CheckTuple<AnyZodMessageTypeValue, TValues>
    ): AnyZodMessageTypeTuple {
        return values as AnyZodMessageTypeTuple
    },
} as const

export const AnyZodMessage = {
    is: <TSchema extends SomeType>(
        schema: TSchema
        // @ts-expect-error TS compiler doesn't like this type CastZodTypeFromTypeValue but it works...
    ): schema is CastZodTypeFromTypeValue<TSchema, AnyZodMessageType> => {
        const zodTypes: AnyZodMessageTypeTuple = AnyZodMessageTypeTuple.new([
            'object',
            'enum',
        ])

        return (zodTypes as string[]).includes(schema._zod.def.type)
    },
} as const

export type ZodMessageFieldType = ZodPrimitifType | ZodComplexPrimitifType | AnyZodMessage
export type ZodMessageFieldTypeValue = GetZodTypeValue<ZodMessageFieldType>
export type ZodMessageFieldTypeTuple = ZodMessageFieldTypeValue[]

export const ZodMessageFieldTypeTuple = {
    new: function <const TValues extends string[]>(
        values: CheckTuple<ZodMessageFieldTypeValue, TValues>
    ): ZodMessageFieldTypeTuple {
        return values as ZodMessageFieldTypeTuple
    },
    get: (): ZodMessageFieldTypeTuple => {
        return ZodMessageFieldTypeTuple.new([
            'string',
            'number',
            'bigint',
            'boolean',
            'literal',
            'template_literal',
            'file',
            'array',
            'set',
            'record',
            'object',
            'enum',
        ])
    },
} as const

export const ZodMessageFieldType = {
    is: <TSchema extends SomeType>(
        schema: TSchema
        // @ts-expect-error TS compiler doesn't like this type CastZodTypeFromTypeValue but it works...
    ): schema is CastZodTypeFromTypeValue<TSchema, ZodMessageFieldType> => {
        const zodTypes: ZodMessageFieldTypeTuple = ZodMessageFieldTypeTuple.get()

        return (zodTypes as string[]).includes(schema._zod.def.type)
    },
} as const

export type ZodMessageOneOfFieldType = ZodTypeCategoryChildArray
export type ZodMessageOneOfFieldTypeValue = Prettify<
    GetZodTypeValue<ZodMessageOneOfFieldType>
>
export type ZodMessageOneOfFieldTypeTuple = ZodMessageOneOfFieldTypeValue[]

export const ZodMessageOneOfFieldTypeTuple = {
    new: function <const TValues extends string[]>(
        values: CheckTuple<ZodMessageOneOfFieldTypeValue, TValues>
    ): ZodMessageOneOfFieldTypeTuple {
        return values as ZodMessageOneOfFieldTypeTuple
    },
    get: (): ZodMessageOneOfFieldTypeTuple => {
        return ZodMessageOneOfFieldTypeTuple.new(['union'])
    },
} as const

export const ZodMessageOneOfFieldType = {
    is: <TSchema extends SomeType>(
        schema: TSchema
        // @ts-expect-error TS compiler doesn't like this type CastZodTypeFromTypeValue but it works...
    ): schema is CastZodTypeFromTypeValue<TSchema, ZodMessageOneOfFieldType> => {
        const zodTypes: ZodMessageOneOfFieldTypeTuple = ZodMessageOneOfFieldTypeTuple.new(
            ['union']
        )

        return (zodTypes as string[]).includes(schema._zod.def.type)
    },
} as const

export type AnyZodMessageFieldType = ZodMessageFieldType | ZodMessageOneOfFieldType
export type AnyZodMessageFieldTypeValue = GetZodTypeValue<AnyZodMessageFieldType>
export type AnyZodMessageFieldTypeTuple = AnyZodMessageFieldTypeValue[]

export const AnyZodMessageFieldTypeTuple = {
    new: function <const TValues extends string[]>(
        values: CheckTuple<AnyZodMessageFieldTypeValue, TValues>
    ): AnyZodMessageFieldTypeTuple {
        return values as AnyZodMessageFieldTypeTuple
    },
    get: (): AnyZodMessageFieldTypeTuple => {
        return AnyZodMessageFieldTypeTuple.new([
            'string',
            'number',
            'bigint',
            'boolean',
            'literal',
            'template_literal',
            'file',
            'array',
            'set',
            'record',
            'object',
            'enum',
            'union',
        ])
    },
} as const

export const AnyZodMessageFieldType = {
    is: <TSchema extends SomeType>(
        schema: TSchema
        // @ts-expect-error TS compiler doesn't like this type CastZodTypeFromTypeValue but it works...
    ): schema is CastZodTypeFromTypeValue<TSchema, ZodMessageOneOfFieldType> => {
        const zodTypes: AnyZodMessageFieldTypeTuple = AnyZodMessageFieldTypeTuple.get()

        return (zodTypes as string[]).includes(schema._zod.def.type)
    },
} as const
