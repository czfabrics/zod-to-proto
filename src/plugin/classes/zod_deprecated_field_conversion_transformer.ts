import { Proto3Deprecated } from '#plugin/types/global'
import { Proto3MessageField } from '#proto3_definition/types/fields'
import type { ZodMessageFieldType } from '#zod_converter/types/messages'
import type { WithMaybeZodPassthrough } from '#zod_converter/types/passthroughs'
import type { ZodMessageFieldConversionTransformer } from '#zod_converter/types/transformers'

export class ZodDeprecatedFieldConversionTransformer implements ZodMessageFieldConversionTransformer {
    transform(
        schema: WithMaybeZodPassthrough<ZodMessageFieldType>,
        protoDefinition: Proto3MessageField
    ): Proto3MessageField {
        // TODO: tous les checker ? et si un à deprecated = true
        const isDeprecated = schema.meta()?.deprecated

        if (!isDeprecated) {
            return protoDefinition
        }

        return Proto3MessageField.new({
            ...protoDefinition,
            extensions: [
                ...protoDefinition.extensions,
                Proto3Deprecated.useExtension(true),
            ],
        })
    }
}
