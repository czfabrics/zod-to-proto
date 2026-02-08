import { ZodRequiredFieldConversionTransformer } from '#plugin/classes/zod_required_field_conversion_transformer'
import { ZodRequiredOneOfFieldConversionTransformer } from '#plugin/classes/zod_required_one_of_field_conversion_transformer'
import { ZodDeprecatedEnumConversionTransformer } from '#zod_converter/classes/transformers/deprecated_enum'
import { ZodDeprecatedFieldConversionTransformer } from '#zod_converter/classes/transformers/deprecated_field'
import { ZodDeprecatedMessageConversionTransformer } from '#zod_converter/classes/transformers/deprecated_messager'
import { ZodDeprecatedOneOfFieldConversionTransformer } from '#zod_converter/classes/transformers/deprecated_one_of_field'
import { ZodEnumNameIncludedInFieldConversionTransformer } from '#zod_converter/classes/transformers/enum_name_included_in_field'
import { ZodMessageNameIncludedInFieldConversionTransformer } from '#zod_converter/classes/transformers/message_name_included_in_field'
import { ZodConversionTransformers } from '#zod_converter/types/transformers'

export const getFullTransformers = function (): ZodConversionTransformers {
    return {
        message: [
            new ZodDeprecatedMessageConversionTransformer(),
            new ZodMessageNameIncludedInFieldConversionTransformer(),
            new ZodEnumNameIncludedInFieldConversionTransformer(),
        ],
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
