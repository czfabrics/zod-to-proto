import {
    Proto3MessageField,
    Proto3MessageOneOfField,
} from '#proto3_definition/types/fields'
import {
    ZodMessageFieldType,
    ZodMessageOneOfFieldType,
} from '#zod_converter/types/messages'
import { ZodPassthroughType } from '#zod_converter/types/passthroughs'
import { SomeType } from 'zod/v4/core'

export interface ZodConversionTransformer<TSchema extends SomeType, TProtoDefinition> {
    transform(schema: TSchema, protoDefinition: TProtoDefinition): TProtoDefinition
}

export type ZodMessageFieldConversionTransformer = ZodConversionTransformer<
    ZodMessageFieldType | ZodPassthroughType,
    Proto3MessageField
>

export type ZodMessageOneOfFieldConversionTransformer = ZodConversionTransformer<
    ZodMessageOneOfFieldType | ZodPassthroughType,
    Proto3MessageOneOfField
>

export type ZodConversionTransformers = {
    messageField: ZodMessageFieldConversionTransformer[]
    messageOneOfField: ZodMessageOneOfFieldConversionTransformer[]
}
