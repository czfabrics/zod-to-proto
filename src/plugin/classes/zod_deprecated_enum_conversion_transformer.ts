import { Proto3Deprecated } from '#plugin/types/global'
import { Proto3Enum } from '#proto3_definition/types/messages'
import type { AnyZodMessage } from '#zod_converter/types/messages'
import type { WithMaybeZodPassthrough } from '#zod_converter/types/passthroughs'
import type { ZodEnumConversionTransformer } from '#zod_converter/types/transformers'

export class ZodDeprecatedEnumConversionTransformer implements ZodEnumConversionTransformer {
    transform(
        schema: WithMaybeZodPassthrough<AnyZodMessage>,
        protoDefinition: Proto3Enum
    ): Proto3Enum {
        // TODO: tous les checker ? et si un à deprecated = true
        const isDeprecated = schema.meta()?.deprecated

        if (!isDeprecated) {
            return protoDefinition
        }

        return Proto3Enum.new({
            ...protoDefinition,
            extensions: [
                ...protoDefinition.extensions,
                Proto3Deprecated.useExtension(true),
            ],
        })
    }
}
