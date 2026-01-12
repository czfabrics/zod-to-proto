import { Proto3ValidateFieldAnnotation } from '#plugin/types/buf_validate'
import { Proto3MessageField } from '#proto3_definition/types/fields'
import { isZodSchemaOptional } from '#zod_converter/helpers/is_zod_schema_optional'
import { ZodMessageFieldType } from '#zod_converter/types/messages'
import { ZodPassthroughType } from '#zod_converter/types/passthroughs'
import { ZodMessageFieldConversionTransformer } from '#zod_converter/types/transformers'

export class ZodRequiredFieldConversionTransformer implements ZodMessageFieldConversionTransformer {
    transform(
        schema: ZodMessageFieldType | ZodPassthroughType,
        protoDefinition: Proto3MessageField
    ): Proto3MessageField {
        const isOptional = isZodSchemaOptional(schema)

        if (isOptional) {
            return protoDefinition
        }

        return Proto3MessageField.new({
            ...protoDefinition,
            extensions: [
                ...protoDefinition.extensions,
                Proto3ValidateFieldAnnotation.useExtension({ required: true }),
            ],
        })
    }
}
