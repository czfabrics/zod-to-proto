import { Proto3Deprecated } from '#plugin/types/global'
import {
    Proto3Message,
    type ReadOnlyProto3Message,
} from '#proto3_definition/types/messages'
import { isZodSchemaDeprecated } from '#zod_converter/helpers/is_zod_schema_deprecated'
import type { AnyZodMessage } from '#zod_converter/types/messages'
import type { WithMaybeZodPassthrough } from '#zod_converter/types/passthroughs'
import type { ZodMessageConversionTransformer } from '#zod_converter/types/transformers'

export class ZodDeprecatedMessageConversionTransformer implements ZodMessageConversionTransformer {
    transform(
        schema: WithMaybeZodPassthrough<AnyZodMessage>,
        protoDefinition: ReadOnlyProto3Message
    ): ReadOnlyProto3Message {
        const isDeprecated = isZodSchemaDeprecated(schema)

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
