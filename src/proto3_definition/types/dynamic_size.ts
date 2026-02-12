import type { PurgeUndefinedValues } from '#core/types/purge_undefined_values'
import type { ReadOnly } from '#core/types/read_only'
import type { CloneParams } from '#proto3_definition/types/clone'
import type { GetNewParams } from '#proto3_definition/types/get_new_params'
import type {
    AnyProto3Message,
    ReadOnlyAnyProto3Message,
} from '#proto3_definition/types/messages'
import type {
    Proto3ScalarType,
    ReadOnlyProto3ScalarType,
} from '#proto3_definition/types/scalars'
import type {
    Proto3ImportedType,
    ReadOnlyProto3ImportedType,
} from '#proto3_definition/types/types'
import type { WithInternalName } from '#proto3_definition/types/with_internal_name'
import { match } from 'ts-pattern'

export type Proto3RepeatedInnerType =
    | AnyProto3Message
    | Proto3ImportedType
    | Proto3ScalarType
    | WithInternalName<Proto3DynamicSizeTypes, 'REPEATED'>
export type ReadOnlyProto3RepeatedInnerType = ReadOnly<Proto3RepeatedInnerType>

export type Proto3MapValueType = AnyProto3Message | Proto3ImportedType | Proto3ScalarType
export type ReadOnlyProto3MapValueType = ReadOnly<Proto3MapValueType>

type Proto3DynamicSizeTypes = {
    MAP: {
        clone(params: CloneParams<Proto3MapType>): ReadOnlyProto3MapType
        propagateTypePrefix(prefixList: string[]): ReadOnlyProto3MapType
        getDeepMessages(): readonly ReadOnlyAnyProto3Message[]
        getDeepImportedTypes(): readonly ReadOnlyProto3ImportedType[]
        key: ReadOnlyProto3ScalarType
        value: ReadOnlyProto3MapValueType
    }
    REPEATED: {
        clone(params: CloneParams<Proto3RepeatedType>): ReadOnlyProto3RepeatedType
        updateDeepInnerType(
            newInner: Proto3RepeatedInnerType | ReadOnlyProto3RepeatedInnerType
        ): ReadOnlyProto3RepeatedType
        propagateTypePrefix(prefixList: string[]): ReadOnlyProto3RepeatedType
        getDeepMessages(): readonly ReadOnlyAnyProto3Message[]
        getDeepImportedTypes(): readonly ReadOnlyProto3ImportedType[]
        getDeepInnerType(): ReadOnly<
            Exclude<Proto3RepeatedInnerType, { internalName: 'repeated' }>
        >
        inner: ReadOnlyProto3RepeatedInnerType
    }
}

export type Proto3DynamicSizeType = {
    [TKey in keyof Proto3DynamicSizeTypes]: WithInternalName<Proto3DynamicSizeTypes, TKey>
}[keyof Proto3DynamicSizeTypes]
export type ReadOnlyProto3DynamicSizeType = ReadOnly<Proto3DynamicSizeType>

export type Proto3MapType = Extract<Proto3DynamicSizeType, { internalName: 'map' }>
export type ReadOnlyProto3MapType = ReadOnly<Proto3MapType>

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
                prefixList: string[]
            ): ReadOnlyProto3MapType {
                const newValue = match(this.value)
                    .with(
                        { internalName: 'message' },
                        { internalName: 'enum' },
                        (type) => {
                            return type.addPrefix(prefixList)
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
export type ReadOnlyProto3RepeatedType = ReadOnly<Proto3RepeatedType>

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
            updateDeepInnerType(
                newInner: Proto3RepeatedInnerType | ReadOnlyProto3RepeatedInnerType
            ): ReadOnlyProto3RepeatedType {
                let currentItem: ReadOnlyProto3RepeatedInnerType = this

                const repeatedLayers: ReadOnlyProto3RepeatedType[] = []

                while (currentItem.internalName === 'repeated') {
                    repeatedLayers.push(currentItem)

                    currentItem = currentItem.inner
                }

                repeatedLayers.shift()

                if (repeatedLayers.length === 0) {
                    return this.clone({
                        inner: newInner,
                    })
                }

                let previous: ReadOnlyProto3RepeatedType | undefined = repeatedLayers
                    .pop()
                    ?.clone({
                        inner: newInner,
                    })

                while (repeatedLayers.length > 0) {
                    const current = repeatedLayers.pop()!

                    previous = current.clone({
                        inner: previous,
                    })
                }

                return this.clone({
                    inner: previous,
                })
            },
            propagateTypePrefix(
                this: ReadOnlyProto3RepeatedType,
                prefixList: string[]
            ): ReadOnlyProto3RepeatedType {
                const newInner = match(this.inner)
                    .with(
                        { internalName: 'message' },
                        { internalName: 'enum' },
                        (type) => {
                            return type.addPrefix(prefixList)
                        }
                    )
                    .with({ internalName: 'repeated' }, (type) => {
                        return type.propagateTypePrefix(prefixList)
                    })
                    .otherwise((type) => type)

                return this.clone({
                    inner: newInner,
                })
            },
            getDeepMessages() {
                let currentItem:
                    | ReadOnlyAnyProto3Message
                    | ReadOnlyProto3ImportedType
                    | ReadOnlyProto3DynamicSizeType
                    | ReadOnlyProto3ScalarType = this

                while (currentItem.internalName === 'repeated') {
                    currentItem = currentItem.inner
                }

                return currentItem.getDeepMessages()
            },
            getDeepImportedTypes() {
                let currentItem:
                    | ReadOnlyAnyProto3Message
                    | ReadOnlyProto3ImportedType
                    | ReadOnlyProto3DynamicSizeType
                    | ReadOnlyProto3ScalarType = this

                while (currentItem.internalName === 'repeated') {
                    currentItem = currentItem.inner
                }

                return currentItem.getDeepImportedTypes()
            },
            getDeepInnerType() {
                let currentItem:
                    | ReadOnlyAnyProto3Message
                    | ReadOnlyProto3ImportedType
                    | ReadOnlyProto3DynamicSizeType
                    | ReadOnlyProto3ScalarType = this

                while (currentItem.internalName === 'repeated') {
                    currentItem = currentItem.inner
                }

                return currentItem
            },
            ...params,
        }
    },
} as const
