import { Proto3Message } from '#proto3_definition/types/messages'
import { getProtoMeta } from '#zod_converter/helpers/registry'
import type { AnyZodMessage } from '#zod_converter/types/messages'
import {
    ZodPassthroughType,
    type WithMaybeZodPassthrough,
} from '#zod_converter/types/passthroughs'
import type { ZodMessageConversionTransformer } from '#zod_converter/types/transformers'
import { pascalCase } from 'change-case'

export class ZodMessageNameConversionTransformer implements ZodMessageConversionTransformer {
    transform(
        schema: WithMaybeZodPassthrough<AnyZodMessage>,
        protoDefinition: Proto3Message
    ): Proto3Message {
        const deepSchema = ZodPassthroughType.pass(schema)

        const protoMeta = getProtoMeta(deepSchema)

        if (protoMeta.protoDefinitionName === undefined) {
            return protoDefinition
        }

        return Proto3Message.new({
            ...protoDefinition,
            name: pascalCase(protoMeta.protoDefinitionName),
        })
    }
}
