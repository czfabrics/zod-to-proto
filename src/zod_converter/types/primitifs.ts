import type { CheckTuple } from '#core/types/check_tuple'
import type { ZodTypeCategoryNoChild } from '#zod_converter/types/check'
import type {
    CastZodTypeFromTypeValue,
    GetZodTypeValue,
} from '#zod_converter/types/zod_type_value'
import type { ZodEnum } from 'zod'
import type { SomeType } from 'zod/v4/core'

export type ZodPrimitifType = Exclude<ZodTypeCategoryNoChild, ZodEnum>

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
    is: <TSchema extends SomeType>(
        schema: TSchema
        // @ts-expect-error TS compiler doesn't like this type CastZodTypeFromTypeValue but it works...
    ): schema is CastZodTypeFromTypeValue<TSchema, ZodPrimitifType> => {
        const zodTypes: ZodPrimitifTypeTuple = ZodPrimitifTypeTuple.get()

        return (zodTypes as string[]).includes(schema._zod.def.type)
    },
} as const
