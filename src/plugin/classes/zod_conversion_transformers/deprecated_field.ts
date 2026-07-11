import { Proto3Deprecated } from '#plugin/types/global'
import { type ReadOnlyProto3MessageField } from '#proto3_definition/types/fields'
import { isZodSchemaDeprecated } from '#zod_converter/helpers/is_zod_schema_deprecated'
import type { ZodConversionContext } from '#zod_converter/types/conversion'
import type { ZodMessageFieldType } from '#zod_converter/types/messages'
import type { WithMaybeZodPassthrough } from '#zod_converter/types/passthroughs'
import type { ZodMessageFieldConversionTransformer } from '#zod_converter/types/transformers'

export class ZodDeprecatedFieldConversionTransformer implements ZodMessageFieldConversionTransformer {
    transform(
        context: ZodConversionContext,
        schema: WithMaybeZodPassthrough<ZodMessageFieldType>,
        protoDefinition: ReadOnlyProto3MessageField
    ): ReadOnlyProto3MessageField {
        const isDeprecated = isZodSchemaDeprecated(context, schema)

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
