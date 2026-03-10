import { type ReadOnlyProto3Message } from '#proto3_definition/types/messages'
import { getProtoMeta } from '#zod_converter/helpers/registry'
import type { AnyZodMessage } from '#zod_converter/types/messages'
import {
    ZodPassthroughType,
    type WithMaybeZodPassthrough,
} from '#zod_converter/types/passthroughs'
import { TransformationReuseStrategies } from '#zod_converter/types/reuse_strategy'
import type { ZodMessageConversionTransformer } from '#zod_converter/types/transformers'
import { pascalCase } from 'change-case'

export class ZodMessageNameConversionTransformer implements ZodMessageConversionTransformer {
    public constructor(private readonly reuseStrategies: TransformationReuseStrategies) {}

    transform(
        schema: WithMaybeZodPassthrough<AnyZodMessage>,
        protoDefinition: ReadOnlyProto3Message
    ): ReadOnlyProto3Message {
        const deepSchema = ZodPassthroughType.pass(schema)

        const protoMeta = getProtoMeta(deepSchema)

        if (protoMeta.protoDefinitionName === undefined) {
            return protoDefinition
        }

        const newProtoDefinition = protoDefinition.duplicate({
            name: pascalCase(protoMeta.protoDefinitionName),
        })

        //// This is useful to override behavior of the `ZodMessageNameIncludedInFieldConversionTransformer`
        //// to keep the name as defined in the meta
        this.reuseStrategies.message.storeTransformation(
            newProtoDefinition.id,
            newProtoDefinition
        )

        return newProtoDefinition
    }
}
