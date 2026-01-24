import { ZodDeprecatedEnumConversionTransformer } from '#plugin/classes/zod_deprecated_enum_conversion_transformer'
import { ZodDeprecatedFieldConversionTransformer } from '#plugin/classes/zod_deprecated_field_conversion_transformer'
import { ZodDeprecatedMessageConversionTransformer } from '#plugin/classes/zod_deprecated_message_conversion_transformer'
import { ZodDeprecatedOneOfFieldConversionTransformer } from '#plugin/classes/zod_deprecated_one_of_field_conversion_transformer'
import { ZodRequiredFieldConversionTransformer } from '#plugin/classes/zod_required_field_conversion_transformer'
import { ZodRequiredOneOfFieldConversionTransformer } from '#plugin/classes/zod_required_one_of_field_conversion_transformer'
import { ZodConversionTransformers } from '#zod_converter/types/transformers'

export const getFullTransformers = function (): ZodConversionTransformers {
    return {
        message: [new ZodDeprecatedMessageConversionTransformer()],
        messageField: [
            new ZodDeprecatedFieldConversionTransformer(),
            new ZodRequiredFieldConversionTransformer(),
        ],
        messageOneOfField: [
            new ZodDeprecatedOneOfFieldConversionTransformer(),
            new ZodRequiredOneOfFieldConversionTransformer(),
        ],
        enum: [new ZodDeprecatedEnumConversionTransformer()],
    }
}
