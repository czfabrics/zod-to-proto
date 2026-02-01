import type { DeepReadOnly } from '#proto3_definition/types/deep_read_only'
import type { GetNewParams } from '#proto3_definition/types/get_new_params'
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
        key: Proto3ScalarType
        value: Proto3MapValueType
    }
    REPEATED: {
        getDeepMessages(): AnyProto3Message[]
        getDeepImportedTypes(): Proto3ImportedType[]
        inner: Proto3RepeatedInnerType
    }
}

export type Proto3DynamicSizeType = {
    [TKey in keyof Proto3DynamicSizeTypes]: WithInternalName<Proto3DynamicSizeTypes, TKey>
}[keyof Proto3DynamicSizeTypes]

export const Proto3MapType = {
    new: function <
        const TParams extends DeepReadOnly<
            GetNewParams<Extract<Proto3DynamicSizeType, { internalName: 'map' }>>
        >,
    >(params: TParams) {
        return {
            internalName: 'map',
            getDeepMessages() {
                return this.value.getDeepMessages()
            },
            getDeepImportedTypes() {
                return this.value.getDeepImportedTypes()
            },
            ...params,
        } as const satisfies DeepReadOnly<Proto3DynamicSizeType>
    },
} as const

export const Proto3RepeatedType = {
    new: function <
        const TParams extends DeepReadOnly<
            GetNewParams<Extract<Proto3DynamicSizeType, { internalName: 'repeated' }>>
        >,
    >(params: TParams) {
        return {
            internalName: 'repeated',
            getDeepMessages() {
                let currentItem: DeepReadOnly<
                    | AnyProto3Message
                    | Proto3ImportedType
                    | Proto3DynamicSizeType
                    | Proto3ScalarType
                > = this

                while (currentItem.internalName === 'repeated') {
                    currentItem = currentItem.inner
                }

                return currentItem.getDeepMessages()
            },
            getDeepImportedTypes() {
                let currentItem: DeepReadOnly<
                    | AnyProto3Message
                    | Proto3ImportedType
                    | Proto3DynamicSizeType
                    | Proto3ScalarType
                > = this

                while (currentItem.internalName === 'repeated') {
                    currentItem = currentItem.inner
                }

                return currentItem.getDeepImportedTypes()
            },
            ...params,
        } as const satisfies DeepReadOnly<Proto3DynamicSizeType>
    },
} as const
