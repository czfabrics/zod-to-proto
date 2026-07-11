import { Proto3Deprecated } from '#plugin/types/global'
import { type ReadOnlyProto3Enum } from '#proto3_definition/types/messages'
import { isZodSchemaDeprecated } from '#zod_converter/helpers/is_zod_schema_deprecated'
import type { ZodConversionContext } from '#zod_converter/types/conversion'
import type { AnyZodMessage } from '#zod_converter/types/messages'
import type { WithMaybeZodPassthrough } from '#zod_converter/types/passthroughs'
import type { ZodEnumConversionTransformer } from '#zod_converter/types/transformers'

export class ZodDeprecatedEnumConversionTransformer implements ZodEnumConversionTransformer {
    transform(
        context: ZodConversionContext,
        schema: WithMaybeZodPassthrough<AnyZodMessage>,
        protoDefinition: ReadOnlyProto3Enum
    ): ReadOnlyProto3Enum {
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
