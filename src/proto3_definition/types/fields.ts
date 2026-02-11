import type { PurgeUndefinedValues } from '#core/types/purge_undefined_values'
import type { CloneParams } from '#proto3_definition/types/clone'
import type { DeepReadOnly } from '#proto3_definition/types/deep_read_only'
import type { Proto3DynamicSizeType } from '#proto3_definition/types/dynamic_size'
import type { Proto3Extension } from '#proto3_definition/types/extension'
import type { GetNewParams } from '#proto3_definition/types/get_new_params'
import type { AnyProto3Message } from '#proto3_definition/types/messages'
import type { Proto3ScalarType } from '#proto3_definition/types/scalars'
import type { Proto3ImportedType } from '#proto3_definition/types/types'
import { match } from 'ts-pattern'

export type Proto3BaseField = {
    key: string
}

export type Proto3MessageFieldType =
    | Proto3DynamicSizeType
    | Proto3ScalarType
    | AnyProto3Message
    | Proto3ImportedType

export const Proto3OptionalState = {
    PRESENT: 'PRESENT',
    NONE: 'NONE',
    NOT_NEEDED: 'NOT_NEEDED',
} as const
export type Proto3OptionalState =
    (typeof Proto3OptionalState)[keyof typeof Proto3OptionalState]

export type Proto3MessageField = Proto3BaseField & {
    clone(params: CloneParams<Proto3MessageField>): Proto3MessageField
    propagateTypePrefix(prefix: string): Proto3MessageField
    getDeepMessages(): AnyProto3Message[]
    getDeepImportedTypes(): Proto3ImportedType[]
    index: number
    internalName: 'message_field'
    optionalState: Proto3OptionalState
    type: Proto3MessageFieldType
    extensions: Proto3Extension[]
    comments: string[]
}
export type ReadOnlyProto3MessageField = DeepReadOnly<Proto3MessageField>

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
                prefix: string
            ): ReadOnlyProto3MessageField {
                const newType = match(this.type)
                    .with(
                        { internalName: 'message' },
                        { internalName: 'enum' },
                        (type) => {
                            return type.addPrefix(prefix)
                        }
                    )
                    .with(
                        { internalName: 'repeated' },
                        { internalName: 'map' },
                        (type) => {
                            return type.propagateTypePrefix(prefix)
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
    ): Proto3MessageOneOfFieldSubField
    propagateTypePrefix(prefix: string): Proto3MessageOneOfFieldSubField
    optionalState: 'NOT_NEEDED'
}
export type ReadOnlyProto3MessageOneOfFieldSubField =
    DeepReadOnly<Proto3MessageOneOfFieldSubField>

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
                prefix: string
            ): ReadOnlyProto3MessageOneOfFieldSubField {
                const newType = match(this.type)
                    .with(
                        { internalName: 'message' },
                        { internalName: 'enum' },
                        (type) => {
                            return type.addPrefix(prefix)
                        }
                    )
                    .with(
                        { internalName: 'repeated' },
                        { internalName: 'map' },
                        (type) => {
                            return type.propagateTypePrefix(prefix)
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
    clone(params: CloneParams<Proto3MessageOneOfField>): Proto3MessageOneOfField
    propagateTypePrefix(prefix: string): Proto3MessageOneOfField
    getDeepMessages(): AnyProto3Message[]
    getDeepImportedTypes(): Proto3ImportedType[]
    internalName: 'message_one_of_field'
    subFields: Proto3MessageOneOfFieldSubField[]
    extensions: Proto3Extension[]
    comments: string[]
}
export type ReadOnlyProto3MessageOneOfField = DeepReadOnly<Proto3MessageOneOfField>

export const Proto3MessageOneOfField = {
    new: function <
        const TParams extends DeepReadOnly<GetNewParams<Proto3MessageOneOfField>>,
    >(params: TParams): ReadOnlyProto3MessageOneOfField {
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
                prefix: string
            ): ReadOnlyProto3MessageOneOfField {
                const subFields = this.subFields.map((subField) =>
                    subField.propagateTypePrefix(prefix)
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
        } as const satisfies DeepReadOnly<Proto3MessageOneOfField>
    },
} as const

export type Proto3EnumField = Proto3BaseField & {
    index: number
    internalName: 'enum_field'
    extensions: Proto3Extension[]
    comments: string[]
}

export const Proto3EnumField = {
    new: function <const TParams extends DeepReadOnly<GetNewParams<Proto3EnumField>>>(
        params: TParams
    ) {
        return {
            internalName: 'enum_field',
            ...params,
        } as const satisfies DeepReadOnly<Proto3EnumField>
    },
} as const

export type AnyProto3MessageField = Proto3MessageField | Proto3MessageOneOfField
export type AnyProto3Field =
    | Proto3MessageField
    | Proto3MessageOneOfField
    | Proto3EnumField
