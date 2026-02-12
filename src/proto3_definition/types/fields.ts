import type { PurgeUndefinedValues } from '#core/types/purge_undefined_values'
import type { ReadOnly } from '#core/types/read_only'
import type { CloneParams } from '#proto3_definition/types/clone'
import type { Proto3DynamicSizeType } from '#proto3_definition/types/dynamic_size'
import type { ReadOnlyProto3Extension } from '#proto3_definition/types/extension'
import type { GetNewParams } from '#proto3_definition/types/get_new_params'
import type {
    AnyProto3Message,
    ReadOnlyAnyProto3Message,
} from '#proto3_definition/types/messages'
import type { Proto3ScalarType } from '#proto3_definition/types/scalars'
import type {
    Proto3ImportedType,
    ReadOnlyProto3ImportedType,
} from '#proto3_definition/types/types'
import { match } from 'ts-pattern'

export type Proto3BaseField = {
    key: string
}

export type Proto3MessageFieldType =
    | Proto3DynamicSizeType
    | Proto3ScalarType
    | AnyProto3Message
    | Proto3ImportedType
export type ReadOnlyProto3MessageFieldType = ReadOnly<Proto3MessageFieldType>

export const Proto3OptionalState = {
    PRESENT: 'PRESENT',
    NONE: 'NONE',
    NOT_NEEDED: 'NOT_NEEDED',
} as const
export type Proto3OptionalState =
    (typeof Proto3OptionalState)[keyof typeof Proto3OptionalState]

export type Proto3MessageField = Proto3BaseField & {
    clone(params: CloneParams<Proto3MessageField>): ReadOnlyProto3MessageField
    propagateTypePrefix(prefixList: string[]): ReadOnlyProto3MessageField
    getDeepMessages(): readonly ReadOnlyAnyProto3Message[]
    getDeepImportedTypes(): readonly ReadOnlyProto3ImportedType[]
    index: number
    internalName: 'message_field'
    optionalState: Proto3OptionalState
    type: ReadOnlyProto3MessageFieldType
    extensions: readonly ReadOnlyProto3Extension[]
    comments: readonly string[]
}
export type ReadOnlyProto3MessageField = ReadOnly<Proto3MessageField>

export const Proto3MessageField = {
    new: function (params: GetNewParams<Proto3MessageField>): ReadOnlyProto3MessageField {
        return {
            internalName: 'message_field',
            clone(
                this: ReadOnlyProto3MessageField,
                params: PurgeUndefinedValues<CloneParams<Proto3MessageField>>
            ): ReadOnlyProto3MessageField {
                return {
                    ...this,
                    ...params,
                }
            },
            propagateTypePrefix(
                this: ReadOnlyProto3MessageField,
                prefixList: string[]
            ): ReadOnlyProto3MessageField {
                const newType = match(this.type)
                    .with(
                        { internalName: 'message' },
                        { internalName: 'enum' },
                        (type) => {
                            return type.addPrefix(prefixList)
                        }
                    )
                    .with(
                        { internalName: 'repeated' },
                        { internalName: 'map' },
                        (type) => {
                            return type.propagateTypePrefix(prefixList)
                        }
                    )
                    .otherwise((type) => type)

                return this.clone({
                    type: newType,
                })
            },
            getDeepMessages() {
                return this.type.getDeepMessages()
            },
            getDeepImportedTypes() {
                return [
                    ...this.type.getDeepImportedTypes(),
                    ...this.extensions.map((extension) =>
                        extension.getDeepImportedTypes()
                    ),
                ].flat()
            },
            ...params,
        }
    },
} as const

export type Proto3MessageOneOfFieldSubField = Omit<
    Proto3MessageField,
    'clone' | 'propagateTypePrefix'
> & {
    clone(
        params: CloneParams<Proto3MessageOneOfFieldSubField>
    ): ReadOnlyProto3MessageOneOfFieldSubField
    propagateTypePrefix(prefixList: string[]): ReadOnlyProto3MessageOneOfFieldSubField
}
export type ReadOnlyProto3MessageOneOfFieldSubField =
    ReadOnly<Proto3MessageOneOfFieldSubField>

export const Proto3MessageOneOfFieldSubField = {
    new: function (
        params: GetNewParams<Proto3MessageOneOfFieldSubField>
    ): ReadOnlyProto3MessageOneOfFieldSubField {
        return {
            ...Proto3MessageField.new(params),
            clone(
                this: ReadOnlyProto3MessageOneOfFieldSubField,
                params: PurgeUndefinedValues<CloneParams<Proto3MessageOneOfFieldSubField>>
            ): ReadOnlyProto3MessageOneOfFieldSubField {
                return {
                    ...this,
                    ...params,
                }
            },
            propagateTypePrefix(
                this: ReadOnlyProto3MessageOneOfFieldSubField,
                prefixList: string[]
            ): ReadOnlyProto3MessageOneOfFieldSubField {
                const newType = match(this.type)
                    .with(
                        { internalName: 'message' },
                        { internalName: 'enum' },
                        (type) => {
                            return type.addPrefix(prefixList)
                        }
                    )
                    .with(
                        { internalName: 'repeated' },
                        { internalName: 'map' },
                        (type) => {
                            return type.propagateTypePrefix(prefixList)
                        }
                    )
                    .otherwise((type) => type)

                return this.clone({
                    type: newType,
                })
            },
            optionalState: 'NOT_NEEDED',
        }
    },
} as const

export type Proto3MessageOneOfField = Proto3BaseField & {
    clone(params: CloneParams<Proto3MessageOneOfField>): ReadOnlyProto3MessageOneOfField
    propagateTypePrefix(prefixList: string[]): ReadOnlyProto3MessageOneOfField
    getDeepMessages(): readonly ReadOnlyAnyProto3Message[]
    getDeepImportedTypes(): readonly ReadOnlyProto3ImportedType[]
    internalName: 'message_one_of_field'
    subFields: readonly ReadOnlyProto3MessageOneOfFieldSubField[]
    extensions: readonly ReadOnlyProto3Extension[]
    comments: readonly string[]
}
export type ReadOnlyProto3MessageOneOfField = ReadOnly<Proto3MessageOneOfField>

export const Proto3MessageOneOfField = {
    new: function <const TParams extends ReadOnly<GetNewParams<Proto3MessageOneOfField>>>(
        params: TParams
    ): ReadOnlyProto3MessageOneOfField {
        return {
            internalName: 'message_one_of_field',
            clone(
                this: ReadOnlyProto3MessageOneOfField,
                params: PurgeUndefinedValues<CloneParams<Proto3MessageOneOfField>>
            ): ReadOnlyProto3MessageOneOfField {
                return {
                    ...this,
                    ...params,
                }
            },
            propagateTypePrefix(
                this: ReadOnlyProto3MessageOneOfField,
                prefixList: string[]
            ): ReadOnlyProto3MessageOneOfField {
                const subFields = this.subFields.map((subField) =>
                    subField.propagateTypePrefix(prefixList)
                )

                return this.clone({
                    subFields,
                })
            },
            getDeepMessages() {
                return this.subFields.map((field) => field.getDeepMessages()).flat()
            },
            getDeepImportedTypes() {
                return this.subFields.map((field) => field.getDeepImportedTypes()).flat()
            },
            ...params,
        }
    },
} as const

export type Proto3EnumField = Proto3BaseField & {
    index: number
    internalName: 'enum_field'
    clone(params: CloneParams<Proto3EnumField>): ReadOnlyProto3EnumField
    extensions: readonly ReadOnlyProto3Extension[]
    comments: readonly string[]
}

export type ReadOnlyProto3EnumField = ReadOnly<Proto3EnumField>

export const Proto3EnumField = {
    new: function (params: GetNewParams<Proto3EnumField>): ReadOnlyProto3EnumField {
        return {
            internalName: 'enum_field',
            clone(
                this: ReadOnlyProto3EnumField,
                params: PurgeUndefinedValues<CloneParams<Proto3EnumField>>
            ): ReadOnlyProto3EnumField {
                return {
                    ...this,
                    ...params,
                }
            },
            ...params,
        }
    },
} as const

export type AnyProto3MessageField = Proto3MessageField | Proto3MessageOneOfField
export type ReadOnlyAnyProto3MessageField =
    | ReadOnlyProto3MessageField
    | ReadOnlyProto3MessageOneOfField
export type AnyProto3Field =
    | Proto3MessageField
    | Proto3MessageOneOfField
    | Proto3EnumField
export type ReadOnlyAnyProto3Field =
    | ReadOnlyProto3MessageField
    | ReadOnlyProto3MessageOneOfField
    | ReadOnlyProto3EnumField
