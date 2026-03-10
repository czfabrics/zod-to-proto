import { type ReadOnlyProto3Enum } from '#proto3_definition/types/messages'
import { getProtoMeta } from '#zod_converter/helpers/registry'
import type { AnyZodMessage } from '#zod_converter/types/messages'
import {
    ZodPassthroughType,
    type WithMaybeZodPassthrough,
} from '#zod_converter/types/passthroughs'
import { TransformationReuseStrategies } from '#zod_converter/types/reuse_strategy'
import type { ZodEnumConversionTransformer } from '#zod_converter/types/transformers'
import { pascalCase } from 'change-case'

export class ZodEnumNameConversionTransformer implements ZodEnumConversionTransformer {
    public constructor(private readonly reuseStrategies: TransformationReuseStrategies) {}

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

        //// This is useful to override behavior of the `ZodEnumNameIncludedInFieldConversionTransformer`
        //// to keep the name as defined in the meta
        this.reuseStrategies.enum.storeTransformation(
            newProtoDefinition.id,
            newProtoDefinition
        )

        return newProtoDefinition
    }
}
