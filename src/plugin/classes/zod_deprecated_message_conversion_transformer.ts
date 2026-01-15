import { Proto3Deprecated } from '#plugin/types/global'
import { Proto3Message } from '#proto3_definition/types/messages'
import { AnyZodMessage } from '#zod_converter/types/messages'
import { ZodPassthroughType } from '#zod_converter/types/passthroughs'
import type { ZodMessageConversionTransformer } from '#zod_converter/types/transformers'

export class ZodDeprecatedMessageConversionTransformer implements ZodMessageConversionTransformer {
    transform(
        schema: AnyZodMessage | ZodPassthroughType,
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
