import { Proto3Deprecated } from '#plugin/types/global'
import { type ReadOnlyProto3MessageOneOfField } from '#proto3_definition/types/fields'
import { isZodSchemaDeprecated } from '#zod_converter/helpers/is_zod_schema_deprecated'
import type { ZodMessageOneOfFieldType } from '#zod_converter/types/messages'
import type { WithMaybeZodPassthrough } from '#zod_converter/types/passthroughs'
import type { ZodMessageOneOfFieldConversionTransformer } from '#zod_converter/types/transformers'

export class ZodDeprecatedOneOfFieldConversionTransformer implements ZodMessageOneOfFieldConversionTransformer {
    transform(
        schema: WithMaybeZodPassthrough<ZodMessageOneOfFieldType>,
        protoDefinition: ReadOnlyProto3MessageOneOfField
    ): ReadOnlyProto3MessageOneOfField {
        const isDeprecated = isZodSchemaDeprecated(schema)

        if (!isDeprecated) {
            return protoDefinition
        }

        return protoDefinition.clone({
            extensions: [
                ...protoDefinition.extensions,
                Proto3Deprecated.useExtension(true),
            ],
        })
    }
}
