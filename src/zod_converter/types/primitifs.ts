import type { CheckTuple } from '#core/types/check_tuple'
import type { ZodCategoryNoChild } from '#zod_converter/types/check'
import {
    type AnyZodPassthroughInner,
    type WithMaybeZodPassthrough,
    ZodPassthroughType,
} from '#zod_converter/types/passthroughs'
import type { GetZodTypeValue } from '#zod_converter/types/zod_type_value'
import type { ZodEnum } from 'zod'

export type ZodPrimitifType = Exclude<ZodCategoryNoChild, ZodEnum>

export type ZodPrimitifTypeValue = GetZodTypeValue<ZodPrimitifType>
export type ZodPrimitifTypeTuple = ZodPrimitifTypeValue[]

export const ZodPrimitifTypeTuple = {
    new: function <const TValues extends string[]>(
        values: CheckTuple<ZodPrimitifTypeValue, TValues>
    ): ZodPrimitifTypeTuple {
        return values as ZodPrimitifTypeTuple
    },
    get: (): ZodPrimitifTypeTuple => {
        return ZodPrimitifTypeTuple.new([
            'string',
            'number',
            'bigint',
            'boolean',
            'literal',
            'template_literal',
            'file',
        ])
    },
} as const

export const ZodPrimitifType = {
    is: function (
        schema: WithMaybeZodPassthrough<AnyZodPassthroughInner>
    ): schema is WithMaybeZodPassthrough<ZodPrimitifType> {
        const deepSchema = ZodPassthroughType.pass(schema)

        const zodTypes: string[] = ZodPrimitifTypeTuple.get()

        return zodTypes.includes(deepSchema._zod.def.type)
    },
} as const
