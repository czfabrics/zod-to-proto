import type { DeepReadOnly } from '#proto3_definition/types/deep_read_only'
import type { Proto3DynamicSizeType } from '#proto3_definition/types/dynamic_size'
import type { Proto3Extension } from '#proto3_definition/types/extension'
import type { GetNewParams } from '#proto3_definition/types/get_new_params'
import type { AnyProto3Message } from '#proto3_definition/types/messages'
import type { Proto3ScalarType } from '#proto3_definition/types/scalars'
import type { Proto3ImportedType } from '#proto3_definition/types/types'

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
    getDeepMessages(): AnyProto3Message[]
    getDeepImportedTypes(): Proto3ImportedType[]
    index: number
    internalName: 'message_field'
    optionalState: Proto3OptionalState
    type: Proto3MessageFieldType
    extensions: Proto3Extension[]
    comments: string[]
}

export const Proto3MessageField = {
    new: function <const TParams extends DeepReadOnly<GetNewParams<Proto3MessageField>>>(
        params: TParams
    ) {
        return {
            internalName: 'message_field',
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
        } as const satisfies DeepReadOnly<Proto3MessageField>
    },
} as const

export type Proto3MessageOneOfFieldSubField = Proto3MessageField & {
    optionalState: 'NOT_NEEDED'
}

export const Proto3MessageOneOfFieldSubField = {
    new: function <
        const TParams extends DeepReadOnly<GetNewParams<Proto3MessageOneOfFieldSubField>>,
    >(params: TParams) {
        return {
            ...Proto3MessageField.new(params),
            optionalState: 'NOT_NEEDED',
        } as const satisfies DeepReadOnly<Proto3MessageOneOfFieldSubField>
    },
} as const

export type Proto3MessageOneOfField = Proto3BaseField & {
    getDeepMessages(): AnyProto3Message[]
    getDeepImportedTypes(): Proto3ImportedType[]
    internalName: 'message_one_of_field'
    subFields: Proto3MessageOneOfFieldSubField[]
    extensions: Proto3Extension[]
    comments: string[]
}

export const Proto3MessageOneOfField = {
    new: function <
        const TParams extends DeepReadOnly<GetNewParams<Proto3MessageOneOfField>>,
    >(params: TParams) {
        return {
            internalName: 'message_one_of_field',
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
