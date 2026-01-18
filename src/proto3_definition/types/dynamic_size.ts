import type { Proto3MessageField } from '#proto3_definition/types/fields'
import type { AnyProto3Message } from '#proto3_definition/types/messages'
import type { Proto3ScalarType } from '#proto3_definition/types/scalars'
import type { Proto3ImportedType } from '#proto3_definition/types/types'
import type { WithInternalName } from '#proto3_definition/types/with_internal_name'

export type Proto3RepeatedInnerType =
    | AnyProto3Message
    | Proto3ImportedType
    | Proto3ScalarType
    | WithInternalName<Proto3DynamicSizeTypes, 'REPEATED'>

export type Proto3MapValueType = AnyProto3Message | Proto3ImportedType | Proto3ScalarType

type Proto3DynamicSizeTypes = {
    MAP: {
        getDeepMessages(): AnyProto3Message[]
        getDeepImportedTypes(): Proto3ImportedType[]
        getDeepOptionalMessageFields(): Proto3MessageField[]
        key: Proto3ScalarType
        value: Proto3MapValueType
    }
    REPEATED: {
        getDeepMessages(): AnyProto3Message[]
        getDeepImportedTypes(): Proto3ImportedType[]
        getDeepOptionalMessageFields(): Proto3MessageField[]
        inner: Proto3RepeatedInnerType
    }
}

export type Proto3DynamicSizeType = {
    [TKey in keyof Proto3DynamicSizeTypes]: WithInternalName<Proto3DynamicSizeTypes, TKey>
}[keyof Proto3DynamicSizeTypes]
