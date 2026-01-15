import { Proto3Deprecated } from '#plugin/types/global'
import { Proto3Enum } from '#proto3_definition/types/messages'
import { AnyZodMessage } from '#zod_converter/types/messages'
import { ZodPassthroughType } from '#zod_converter/types/passthroughs'
import type { ZodEnumConversionTransformer } from '#zod_converter/types/transformers'

export class ZodDeprecatedEnumConversionTransformer implements ZodEnumConversionTransformer {
    transform(
        schema: AnyZodMessage | ZodPassthroughType,
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
