import { Proto3Deprecated } from '#plugin/types/global'
import {
    Proto3MessageField,
    type ReadOnlyProto3MessageField,
} from '#proto3_definition/types/fields'
import { isZodSchemaDeprecated } from '#zod_converter/helpers/is_zod_schema_deprecated'
import type { ZodMessageFieldType } from '#zod_converter/types/messages'
import type { WithMaybeZodPassthrough } from '#zod_converter/types/passthroughs'
import type { ZodMessageFieldConversionTransformer } from '#zod_converter/types/transformers'

export class ZodDeprecatedFieldConversionTransformer implements ZodMessageFieldConversionTransformer {
    transform(
        schema: WithMaybeZodPassthrough<ZodMessageFieldType>,
        protoDefinition: ReadOnlyProto3MessageField
    ): ReadOnlyProto3MessageField {
        const isDeprecated = isZodSchemaDeprecated(schema)

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
