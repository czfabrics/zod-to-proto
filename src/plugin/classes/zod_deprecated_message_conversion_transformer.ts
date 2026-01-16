import { Proto3Deprecated } from '#plugin/types/global'
import { Proto3Message } from '#proto3_definition/types/messages'
import type { AnyZodMessage } from '#zod_converter/types/messages'
import type { WithMaybeZodPassthrough } from '#zod_converter/types/passthroughs'
import type { ZodMessageConversionTransformer } from '#zod_converter/types/transformers'

export class ZodDeprecatedMessageConversionTransformer implements ZodMessageConversionTransformer {
    transform(
        schema: WithMaybeZodPassthrough<AnyZodMessage>,
        protoDefinition: Proto3Message
    ): Proto3Message {
        // TODO: tous les checker ? et si un à deprecated = true
        const isDeprecated = schema.meta()?.deprecated

        if (!isDeprecated) {
            return protoDefinition
        }

        return Proto3Message.new({
            ...protoDefinition,
            extensions: [
                ...protoDefinition.extensions,
                Proto3Deprecated.useExtension(true),
            ],
        })
    }
}
