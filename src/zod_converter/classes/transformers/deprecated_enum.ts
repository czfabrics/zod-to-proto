import { Proto3Deprecated } from '#plugin/types/global'
import { Proto3Enum, type ReadOnlyProto3Enum } from '#proto3_definition/types/messages'
import { isZodSchemaDeprecated } from '#zod_converter/helpers/is_zod_schema_deprecated'
import type { AnyZodMessage } from '#zod_converter/types/messages'
import type { WithMaybeZodPassthrough } from '#zod_converter/types/passthroughs'
import type { ZodEnumConversionTransformer } from '#zod_converter/types/transformers'

export class ZodDeprecatedEnumConversionTransformer implements ZodEnumConversionTransformer {
    transform(
        schema: WithMaybeZodPassthrough<AnyZodMessage>,
        protoDefinition: ReadOnlyProto3Enum
    ): ReadOnlyProto3Enum {
        const isDeprecated = isZodSchemaDeprecated(schema)

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
