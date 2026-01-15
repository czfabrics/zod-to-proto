import { Proto3ValidateOneOfAnnotation } from '#plugin/types/buf_validate'
import { Proto3MessageOneOfField } from '#proto3_definition/types/fields'
import { isZodSchemaOptional } from '#zod_converter/helpers/is_zod_schema_optional'
import type { ZodMessageOneOfFieldType } from '#zod_converter/types/messages'
import type { ZodPassthroughType } from '#zod_converter/types/passthroughs'
import type { ZodMessageOneOfFieldConversionTransformer } from '#zod_converter/types/transformers'

export class ZodRequiredOneOfFieldConversionTransformer implements ZodMessageOneOfFieldConversionTransformer {
    transform(
        schema: ZodMessageOneOfFieldType | ZodPassthroughType,
        protoDefinition: Proto3MessageOneOfField
    ): Proto3MessageOneOfField {
        const isOptional = isZodSchemaOptional(schema)

        if (isOptional) {
            return protoDefinition
        }

        return Proto3MessageOneOfField.new({
            ...protoDefinition,
            extensions: [
                ...protoDefinition.extensions,
                Proto3ValidateOneOfAnnotation.useExtension({ required: true }),
            ],
        })
    }
}
