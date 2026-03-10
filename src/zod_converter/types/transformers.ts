import { ReadOnly } from '#core/types/read_only'
import type {
    ReadOnlyProto3MessageField,
    ReadOnlyProto3MessageOneOfField,
} from '#proto3_definition/types/fields'
import type {
    ReadOnlyProto3Enum,
    ReadOnlyProto3Message,
} from '#proto3_definition/types/messages'
import type {
    AnyZodMessage,
    ZodMessageFieldType,
    ZodMessageOneOfFieldType,
} from '#zod_converter/types/messages'
import type { WithMaybeZodPassthrough } from '#zod_converter/types/passthroughs'
import { TransformationReuseStrategies } from '#zod_converter/types/reuse_strategy'
import type { SomeType } from 'zod/v4/core'

export interface ZodConversionTransformer<TSchema extends SomeType, TProtoDefinition> {
    transform(
        schema: TSchema,
        protoDefinition: ReadOnly<TProtoDefinition>
    ): ReadOnly<TProtoDefinition>
}

export type ZodMessageConversionTransformer = ZodConversionTransformer<
    WithMaybeZodPassthrough<AnyZodMessage>,
    ReadOnlyProto3Message
>

export type ZodMessageFieldConversionTransformer = ZodConversionTransformer<
    WithMaybeZodPassthrough<ZodMessageFieldType>,
    ReadOnlyProto3MessageField
>

export type ZodMessageOneOfFieldConversionTransformer = ZodConversionTransformer<
    WithMaybeZodPassthrough<ZodMessageOneOfFieldType>,
    ReadOnlyProto3MessageOneOfField
>

export type ZodEnumConversionTransformer = ZodConversionTransformer<
    WithMaybeZodPassthrough<AnyZodMessage>,
    ReadOnlyProto3Enum
>

export type ZodConversionTransformers = {
    message: (new (
        reuseStrategies: TransformationReuseStrategies
    ) => ZodMessageConversionTransformer)[]
    messageField: (new (
        reuseStrategies: TransformationReuseStrategies
    ) => ZodMessageFieldConversionTransformer)[]
    messageOneOfField: (new (
        reuseStrategies: TransformationReuseStrategies
    ) => ZodMessageOneOfFieldConversionTransformer)[]
    enum: (new (
        reuseStrategies: TransformationReuseStrategies
    ) => ZodEnumConversionTransformer)[]
}

export const ZodConversionTransformers = {
    intoInstances: function (
        transformers: ZodConversionTransformers,
        reuseStrategies: TransformationReuseStrategies
    ) {
        return {
            message: transformers.message.map(
                (Transformer) => new Transformer(reuseStrategies)
            ),
            messageField: transformers.messageField.map(
                (Transformer) => new Transformer(reuseStrategies)
            ),
            messageOneOfField: transformers.messageOneOfField.map(
                (Transformer) => new Transformer(reuseStrategies)
            ),
            enum: transformers.enum.map(
                (Transformer) => new Transformer(reuseStrategies)
            ),
        }
    },
} as const

export type ZodConversionTransformerInstances = {
    message: ZodMessageConversionTransformer[]
    messageField: ZodMessageFieldConversionTransformer[]
    messageOneOfField: ZodMessageOneOfFieldConversionTransformer[]
    enum: ZodEnumConversionTransformer[]
}
