import { Proto3Deprecated } from '#plugin/types/global'
import { Proto3MessageOneOfField } from '#proto3_definition/types/fields'
import { ZodMessageOneOfFieldType } from '#zod_converter/types/messages'
import { ZodPassthroughType } from '#zod_converter/types/passthroughs'
import type { ZodMessageOneOfFieldConversionTransformer } from '#zod_converter/types/transformers'

export class ZodDeprecatedOneOfFieldConversionTransformer implements ZodMessageOneOfFieldConversionTransformer {
    transform(
        schema: ZodMessageOneOfFieldType | ZodPassthroughType,
        protoDefinition: Proto3MessageOneOfField
    ): Proto3MessageOneOfField {
        // TODO: tous les checker ? et si un à deprecated = true
        const isDeprecated = schema.meta()?.deprecated

        if (!isDeprecated) {
            return protoDefinition
        }

        return Proto3MessageOneOfField.new({
            ...protoDefinition,
            extensions: [
                ...protoDefinition.extensions,
                Proto3Deprecated.useExtension(true),
            ],
        })
    }
}
