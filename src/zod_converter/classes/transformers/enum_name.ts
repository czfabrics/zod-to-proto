import { type ReadOnlyProto3Enum } from '#proto3_definition/types/messages'
import { alreadyTransformedMessages } from '#zod_converter/classes/transformers/enum_name_included_in_field'
import { getProtoMeta } from '#zod_converter/helpers/registry'
import type { AnyZodMessage } from '#zod_converter/types/messages'
import {
    ZodPassthroughType,
    type WithMaybeZodPassthrough,
} from '#zod_converter/types/passthroughs'
import type { ZodEnumConversionTransformer } from '#zod_converter/types/transformers'
import { pascalCase } from 'change-case'

export class ZodEnumNameConversionTransformer implements ZodEnumConversionTransformer {
    transform(
        schema: WithMaybeZodPassthrough<AnyZodMessage>,
        protoDefinition: ReadOnlyProto3Enum
    ): ReadOnlyProto3Enum {
        const deepSchema = ZodPassthroughType.pass(schema)

        const protoMeta = getProtoMeta(deepSchema)

        if (protoMeta.protoDefinitionName === undefined) {
            return protoDefinition
        }

        const newProtoDefinition = protoDefinition.duplicate({
            name: pascalCase(protoMeta.protoDefinitionName),
        })

        alreadyTransformedMessages.set(newProtoDefinition.id, newProtoDefinition)

        return newProtoDefinition
    }
}
