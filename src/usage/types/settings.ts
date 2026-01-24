import type { AnyProto3Message } from '#proto3_definition/types/messages'
import type { Proto3ImportedType } from '#proto3_definition/types/types'
import type { ZodConversionTransformers } from '#zod_converter/types/transformers'

export type UsageSettings = {
    transformers: ZodConversionTransformers
    protoVoidType: AnyProto3Message | Proto3ImportedType
}
