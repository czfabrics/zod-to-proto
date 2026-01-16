import type { CheckTuple } from '#core/types/check_tuple'
import type { Prettify } from '#core/types/prettify'
import type {
    ZodTypeCategoryChildArrayCasseCouille,
    ZodTypeCategoryChildRecord,
} from '#zod_converter/types/check'
import { ZodComplexPrimitifType } from '#zod_converter/types/complex_primitifs'
import {
    AnyZodPassthroughInner,
    WithMaybeZodPassthrough,
    ZodPassthroughType,
} from '#zod_converter/types/passthroughs'
import { ZodPrimitifType } from '#zod_converter/types/primitifs'
import type { GetZodTypeValue } from '#zod_converter/types/zod_type_value'
import type { ZodEnum } from 'zod'

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
    is: function (
        schema: WithMaybeZodPassthrough<AnyZodPassthroughInner>
    ): schema is WithMaybeZodPassthrough<AnyZodMessage> {
        const deepSchema = ZodPassthroughType.pass(schema)

        const zodTypes: string[] = AnyZodMessageTypeTuple.new(['object', 'enum'])

        return zodTypes.includes(deepSchema._zod.def.type)
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
    is: function (
        schema: WithMaybeZodPassthrough<AnyZodPassthroughInner>
    ): schema is WithMaybeZodPassthrough<ZodMessageFieldType> {
        const deepSchema = ZodPassthroughType.pass(schema)

        const zodTypes: string[] = ZodMessageFieldTypeTuple.get()

        return zodTypes.includes(deepSchema._zod.def.type)
    },
} as const

export type ZodMessageOneOfFieldType = ZodTypeCategoryChildArrayCasseCouille
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
    is: function (
        schema: WithMaybeZodPassthrough<AnyZodPassthroughInner>
    ): schema is WithMaybeZodPassthrough<ZodMessageOneOfFieldType> {
        const deepSchema = ZodPassthroughType.pass(schema)

        const zodTypes: string[] = ZodMessageOneOfFieldTypeTuple.get()

        return zodTypes.includes(deepSchema._zod.def.type)
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
    is: function (
        schema: WithMaybeZodPassthrough<AnyZodPassthroughInner>
    ): schema is WithMaybeZodPassthrough<AnyZodMessageFieldType> {
        const deepSchema = ZodPassthroughType.pass(schema)

        const zodTypes: string[] = AnyZodMessageFieldTypeTuple.get()

        return zodTypes.includes(deepSchema._zod.def.type)
    },
} as const
