import { PurgeUndefinedValues } from '#core/types/purge_undefined_values'
import { CloneOutput, CloneParams } from '#proto3_definition/types/clone'
import type { DeepReadOnly } from '#proto3_definition/types/deep_read_only'
import type { Proto3DynamicSizeType } from '#proto3_definition/types/dynamic_size'
import type { Proto3Extension } from '#proto3_definition/types/extension'
import type { GetNewParams } from '#proto3_definition/types/get_new_params'
import { type AnyProto3Message } from '#proto3_definition/types/messages'
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

export const Proto3MessageField = {
    new: function <const TParams extends DeepReadOnly<GetNewParams<Proto3MessageField>>>(
        params: TParams
    ) {
        return {
            internalName: 'message_field',
            clone<
                const T extends DeepReadOnly<Proto3MessageField>,
                const TParams extends CloneParams<Proto3MessageField>,
            >(this: T, params: PurgeUndefinedValues<TParams>) {
                return Proto3MessageField.clone(this, params)
            },
            propagateTypePrefix<
                const T extends DeepReadOnly<Proto3MessageField>,
                const TPrefix extends string,
            >(this: T, prefix: TPrefix) {
                return Proto3MessageField.propagateTypePrefix(this, prefix)
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
        } as const satisfies DeepReadOnly<Proto3MessageField>
    },
    clone<
        const T extends DeepReadOnly<Proto3MessageField>,
        const TParams extends CloneParams<Proto3MessageField>,
        const TOutput extends CloneOutput<T, TParams>,
    >(
        object: T,
        params: PurgeUndefinedValues<TParams>
    ): TOutput extends DeepReadOnly<Proto3MessageField> ? TOutput : never {
        return {
            ...object,
            ...params,
        } as any // I didn't have a better solution than any XD, but out of the method, the types are fine.
    },
    propagateTypePrefix<
        const T extends DeepReadOnly<Proto3MessageField>,
        const TPrefix extends string,
    >(object: T, prefix: TPrefix) {
        if (
            object.type.internalName === 'message' ||
            object.type.internalName === 'enum'
        ) {
            return object.clone({
                type: object.type.addPrefix(prefix),
            })
        }

        return object
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

export const Proto3MessageOneOfFieldSubField = {
    new: function <
        const TParams extends DeepReadOnly<GetNewParams<Proto3MessageOneOfFieldSubField>>,
    >(params: TParams) {
        return {
            ...Proto3MessageField.new(params),
            clone<
                const T extends DeepReadOnly<Proto3MessageOneOfFieldSubField>,
                const TParams extends CloneParams<Proto3MessageOneOfFieldSubField>,
            >(this: T, params: PurgeUndefinedValues<TParams>) {
                return Proto3MessageOneOfFieldSubField.clone(this, params)
            },
            propagateTypePrefix<
                const T extends DeepReadOnly<Proto3MessageOneOfFieldSubField>,
                const TPrefix extends string,
            >(this: T, prefix: TPrefix) {
                return Proto3MessageOneOfFieldSubField.propagateTypePrefix(this, prefix)
            },
            optionalState: 'NOT_NEEDED',
        } as const satisfies DeepReadOnly<Proto3MessageOneOfFieldSubField>
    },
    clone<
        const T extends DeepReadOnly<Proto3MessageOneOfFieldSubField>,
        const TParams extends CloneParams<Proto3MessageOneOfFieldSubField>,
        const TOutput extends CloneOutput<T, TParams>,
    >(
        object: T,
        params: PurgeUndefinedValues<TParams>
    ): TOutput extends DeepReadOnly<Proto3MessageOneOfFieldSubField> ? TOutput : never {
        return {
            ...object,
            ...params,
        } as any // I didn't have a better solution than any XD, but out of the method, the types are fine.
    },
    // TODO: literal pas maj
    // en gros si T['type'].internalName === 'message' || 'enum'
    // override le name du message sinon garder T
    // Mais au pire ne rien mettre en return et ts va le déduire tout seul
    propagateTypePrefix<
        const T extends DeepReadOnly<Proto3MessageOneOfFieldSubField>,
        const TPrefix extends string,
    >(object: T, prefix: TPrefix) {
        // TODOD: faille bitch, faut voir les complex...
        if (
            object.type.internalName === 'message' ||
            object.type.internalName === 'enum'
        ) {
            return object.clone({
                type: object.type.addPrefix(prefix),
            })
        }

        return object
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
            clone<
                const T extends DeepReadOnly<Proto3MessageOneOfField>,
                const TParams extends CloneParams<Proto3MessageOneOfField>,
            >(this: T, params: PurgeUndefinedValues<TParams>) {
                return Proto3MessageOneOfField.clone(this, params)
            },
            propagateTypePrefix<
                const T extends DeepReadOnly<Proto3MessageOneOfField>,
                const TPrefix extends string,
            >(this: T, prefix: TPrefix) {
                return Proto3MessageOneOfField.propagateTypePrefix(this, prefix)
            },
            ...params,
        } as const satisfies DeepReadOnly<Proto3MessageOneOfField>
    },
    clone<
        const T extends DeepReadOnly<Proto3MessageOneOfField>,
        const TParams extends CloneParams<Proto3MessageOneOfField>,
        const TOutput extends CloneOutput<T, TParams>,
    >(
        object: T,
        params: PurgeUndefinedValues<TParams>
    ): TOutput extends DeepReadOnly<Proto3MessageOneOfField> ? TOutput : never {
        return {
            ...object,
            ...params,
        } as any // I didn't have a better solution than any XD, but out of the method, the types are fine.
    },
    propagateTypePrefix<
        const T extends DeepReadOnly<Proto3MessageOneOfField>,
        const TPrefix extends string,
    >(object: T, prefix: TPrefix) {
        const subFields = object.subFields.map((subField) =>
            subField.propagateTypePrefix(prefix)
        )

        return object.clone({
            subFields,
        })
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
