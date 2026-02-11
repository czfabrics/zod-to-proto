import type { PurgeUndefinedValues } from '#core/types/purge_undefined_values'
import type { CloneParams } from '#proto3_definition/types/clone'
import type { DeepReadOnly } from '#proto3_definition/types/deep_read_only'
import type { GetNewParams } from '#proto3_definition/types/get_new_params'
import type { AnyProto3Message } from '#proto3_definition/types/messages'
import type { Proto3ScalarType } from '#proto3_definition/types/scalars'
import type { Proto3ImportedType } from '#proto3_definition/types/types'
import type { WithInternalName } from '#proto3_definition/types/with_internal_name'
import { match } from 'ts-pattern'

export type Proto3RepeatedInnerType =
    | AnyProto3Message
    | Proto3ImportedType
    | Proto3ScalarType
    | WithInternalName<Proto3DynamicSizeTypes, 'REPEATED'>

export type Proto3MapValueType = AnyProto3Message | Proto3ImportedType | Proto3ScalarType

type Proto3DynamicSizeTypes = {
    MAP: {
        clone(params: CloneParams<Proto3MapType>): Proto3MapType
        propagateTypePrefix(prefix: string): Proto3MapType
        getDeepMessages(): AnyProto3Message[]
        getDeepImportedTypes(): Proto3ImportedType[]
        key: Proto3ScalarType
        value: Proto3MapValueType
    }
    REPEATED: {
        clone(params: CloneParams<Proto3RepeatedType>): Proto3RepeatedType
        propagateTypePrefix(prefix: string): Proto3RepeatedType
        getDeepMessages(): AnyProto3Message[]
        getDeepImportedTypes(): Proto3ImportedType[]
        inner: Proto3RepeatedInnerType
    }
}

export type Proto3DynamicSizeType = {
    [TKey in keyof Proto3DynamicSizeTypes]: WithInternalName<Proto3DynamicSizeTypes, TKey>
}[keyof Proto3DynamicSizeTypes]

export type Proto3MapType = Extract<Proto3DynamicSizeType, { internalName: 'map' }>
export type ReadOnlyProto3MapType = DeepReadOnly<Proto3MapType>

export const Proto3MapType = {
    new: function (params: GetNewParams<Proto3MapType>): ReadOnlyProto3MapType {
        return {
            internalName: 'map',
            clone(
                this: ReadOnlyProto3MapType,
                params: PurgeUndefinedValues<CloneParams<Proto3MapType>>
            ): ReadOnlyProto3MapType {
                return {
                    ...this,
                    ...params,
                }
            },
            propagateTypePrefix(
                this: ReadOnlyProto3MapType,
                prefix: string
            ): ReadOnlyProto3MapType {
                const newValue = match(this.value)
                    .with(
                        { internalName: 'message' },
                        { internalName: 'enum' },
                        (type) => {
                            return type.addPrefix(prefix)
                        }
                    )
                    .otherwise((type) => type)

                return this.clone({
                    value: newValue,
                })
            },
            getDeepMessages() {
                return this.value.getDeepMessages()
            },
            getDeepImportedTypes() {
                return this.value.getDeepImportedTypes()
            },
            ...params,
        }
    },
} as const

export type Proto3RepeatedType = Extract<
    Proto3DynamicSizeType,
    { internalName: 'repeated' }
>
export type ReadOnlyProto3RepeatedType = DeepReadOnly<Proto3RepeatedType>

export const Proto3RepeatedType = {
    new: function (params: GetNewParams<Proto3RepeatedType>): ReadOnlyProto3RepeatedType {
        return {
            internalName: 'repeated',
            clone(
                this: ReadOnlyProto3RepeatedType,
                params: PurgeUndefinedValues<CloneParams<Proto3RepeatedType>>
            ): ReadOnlyProto3RepeatedType {
                return {
                    ...this,
                    ...params,
                }
            },
            propagateTypePrefix(
                this: ReadOnlyProto3RepeatedType,
                prefix: string
            ): ReadOnlyProto3RepeatedType {
                const newInner = match(this.inner)
                    .with(
                        { internalName: 'message' },
                        { internalName: 'enum' },
                        (type) => {
                            return type.addPrefix(prefix)
                        }
                    )
                    .with({ internalName: 'repeated' }, (type) => {
                        return type.propagateTypePrefix(prefix)
                    })
                    .otherwise((type) => type)

                return this.clone({
                    inner: newInner,
                })
            },
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
        }
    },
} as const
