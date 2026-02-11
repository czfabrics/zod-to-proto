import { ZodDeprecatedEnumConversionTransformer } from '#plugin/classes/zod_conversion_transformers/deprecated_enum'
import { ZodDeprecatedFieldConversionTransformer } from '#plugin/classes/zod_conversion_transformers/deprecated_field'
import { ZodDeprecatedMessageConversionTransformer } from '#plugin/classes/zod_conversion_transformers/deprecated_messager'
import { ZodDeprecatedOneOfFieldConversionTransformer } from '#plugin/classes/zod_conversion_transformers/deprecated_one_of_field'
import { ZodRequiredFieldConversionTransformer } from '#plugin/classes/zod_conversion_transformers/required_field'
import { ZodRequiredOneOfFieldConversionTransformer } from '#plugin/classes/zod_conversion_transformers/required_one_of_field'
import { ZodEnumNameConversionTransformer } from '#zod_converter/classes/transformers/enum_name'
import { ZodEnumNameIncludedInFieldConversionTransformer } from '#zod_converter/classes/transformers/enum_name_included_in_field'
import { ZodMessageNameConversionTransformer } from '#zod_converter/classes/transformers/message_name'
import { ZodMessageNameIncludedInFieldConversionTransformer } from '#zod_converter/classes/transformers/message_name_included_in_field'
import { ZodConversionTransformers } from '#zod_converter/types/transformers'

export const getFullTransformers = function (): ZodConversionTransformers {
    return {
        message: [
            new ZodDeprecatedMessageConversionTransformer(),
            new ZodMessageNameIncludedInFieldConversionTransformer(),
            new ZodEnumNameIncludedInFieldConversionTransformer(),
            new ZodMessageNameConversionTransformer(),
        ],
        messageField: [
            new ZodDeprecatedFieldConversionTransformer(),
            new ZodRequiredFieldConversionTransformer(),
        ],
        messageOneOfField: [
            new ZodDeprecatedOneOfFieldConversionTransformer(),
            new ZodRequiredOneOfFieldConversionTransformer(),
        ],
        enum: [
            new ZodDeprecatedEnumConversionTransformer(),
            new ZodEnumNameConversionTransformer(),
        ],
    }
}
