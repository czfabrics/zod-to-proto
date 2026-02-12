import { DeepReadOnly } from '#core/types/deep_read_only'
import type { Proto3Message } from '#proto3_definition/types/messages'
import type { Proto3ImportedType } from '#proto3_definition/types/types'
import type { ConversionReuseStrategies } from '#zod_converter/types/reuse_strategy'
import type { ZodConversionTransformers } from '#zod_converter/types/transformers'

export type UsageSettings = {
    reuseStrategies: ConversionReuseStrategies
    transformers: ZodConversionTransformers
    protoVoidType: DeepReadOnly<Proto3Message | Proto3ImportedType>
}
