import {
    Proto3EnumField,
    Proto3MessageField,
    Proto3MessageOneOfField,
} from '#proto3_definition/types/fields'
import { Proto3Enum, Proto3Message } from '#proto3_definition/types/messages'
import {
    AnyZodMessage,
    ZodMessageFieldType,
    ZodMessageOneOfFieldType,
} from '#zod_converter/types/messages'
import { ZodPassthroughType } from '#zod_converter/types/passthroughs'
import { SomeType } from 'zod/v4/core'

export interface ZodConversionTransformer<TSchema extends SomeType, TProtoDefinition> {
    transform(schema: TSchema, protoDefinition: TProtoDefinition): TProtoDefinition
}

export type ZodMessageConversionTransformer = ZodConversionTransformer<
    AnyZodMessage | ZodPassthroughType,
    Proto3Message
>

export type ZodMessageFieldConversionTransformer = ZodConversionTransformer<
    ZodMessageFieldType | ZodPassthroughType,
    Proto3MessageField
>

export type ZodMessageOneOfFieldConversionTransformer = ZodConversionTransformer<
    ZodMessageOneOfFieldType | ZodPassthroughType,
    Proto3MessageOneOfField
>

export type ZodEnumConversionTransformer = ZodConversionTransformer<
    AnyZodMessage | ZodPassthroughType,
    Proto3Enum
>

export type ZodEnumFieldConversionTransformer = ZodConversionTransformer<
    AnyZodMessage | ZodPassthroughType,
    Proto3EnumField
>

export type ZodConversionTransformers = {
    message: ZodMessageConversionTransformer[]
    messageField: ZodMessageFieldConversionTransformer[]
    messageOneOfField: ZodMessageOneOfFieldConversionTransformer[]
    enum: ZodEnumConversionTransformer[]
}
