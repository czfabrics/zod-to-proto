import type { Proto3MessageField } from '#proto3_definition/types/fields'
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

export const Proto3MapType = {
    new: (
        params: GetNewParams<Extract<Proto3DynamicSizeType, { internalName: 'map' }>>
    ): Proto3DynamicSizeType => {
        return {
            internalName: 'map',
            getDeepMessages() {
                return this.value.getDeepMessages()
            },
            getDeepImportedTypes() {
                return this.value.getDeepImportedTypes()
            },
            getDeepOptionalMessageFields() {
                return this.value.getDeepOptionalMessageFields()
            },
            ...params,
        }
    },
} as const

export const Proto3RepeatedType = {
    new: (
        params: GetNewParams<Extract<Proto3DynamicSizeType, { internalName: 'repeated' }>>
    ): Proto3DynamicSizeType => {
        return {
            internalName: 'repeated',
            getDeepMessages() {
                let currentItem:
                    | AnyProto3Message
                    | Proto3ImportedType
                    | Proto3DynamicSizeType
                    | Proto3ScalarType = this

                while (currentItem.internalName === 'repeated') {
                    currentItem = currentItem.inner
                }

                return currentItem.getDeepMessages()
            },
            getDeepImportedTypes() {
                let currentItem:
                    | AnyProto3Message
                    | Proto3ImportedType
                    | Proto3DynamicSizeType
                    | Proto3ScalarType = this

                while (currentItem.internalName === 'repeated') {
                    currentItem = currentItem.inner
                }

                return currentItem.getDeepImportedTypes()
            },
            getDeepOptionalMessageFields() {
                let currentItem:
                    | AnyProto3Message
                    | Proto3ImportedType
                    | Proto3DynamicSizeType
                    | Proto3ScalarType = this

                while (currentItem.internalName === 'repeated') {
                    currentItem = currentItem.inner
                }

                return currentItem.getDeepOptionalMessageFields()
            },
            ...params,
        }
    },
} as const
