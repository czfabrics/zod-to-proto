import type { ReadOnlyProto3Message } from '#proto3_definition/types/messages'
import type { ReadOnlyProto3ImportedType } from '#proto3_definition/types/types'
import type { ConversionReuseStrategies } from '#zod_converter/types/reuse_strategy'
import type { ZodConversionTransformers } from '#zod_converter/types/transformers'

export type UsageSettings = {
    reuseStrategies: ConversionReuseStrategies
    transformers: ZodConversionTransformers
    protoVoidType: ReadOnlyProto3Message | ReadOnlyProto3ImportedType
}
