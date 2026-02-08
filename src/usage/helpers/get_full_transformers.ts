import { ZodRequiredFieldConversionTransformer } from '#plugin/classes/zod_required_field_conversion_transformer'
import { ZodRequiredOneOfFieldConversionTransformer } from '#plugin/classes/zod_required_one_of_field_conversion_transformer'
import { ZodDeprecatedEnumConversionTransformer } from '#zod_converter/classes/transformers/deprecated_enum'
import { ZodDeprecatedFieldConversionTransformer } from '#zod_converter/classes/transformers/deprecated_field'
import { ZodDeprecatedMessageConversionTransformer } from '#zod_converter/classes/transformers/deprecated_messager'
import { ZodDeprecatedOneOfFieldConversionTransformer } from '#zod_converter/classes/transformers/deprecated_one_of_field'
import { ZodEnumNameConversionTransformer } from '#zod_converter/classes/transformers/enum_name'
import { ZodMessageNameConversionTransformer } from '#zod_converter/classes/transformers/message_name'
import { ZodConversionTransformers } from '#zod_converter/types/transformers'

export const getFullTransformers = function (): ZodConversionTransformers {
    return {
        message: [
            new ZodDeprecatedMessageConversionTransformer(),
            new ZodMessageNameConversionTransformer(),
            new ZodEnumNameConversionTransformer(),
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
