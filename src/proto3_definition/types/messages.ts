import { getRandomId } from '#core/helpers/get_random_id'
import type { PurgeUndefinedValues } from '#core/types/purge_undefined_values'
import type { DeepReadOnly } from '#proto3_definition/types/deep_read_only'
import type { Proto3Extension } from '#proto3_definition/types/extension'
import {
    type AnyProto3MessageField,
    type Proto3EnumField,
} from '#proto3_definition/types/fields'
import type { GetNewParams } from '#proto3_definition/types/get_new_params'
import type { Proto3ImportedType } from '#proto3_definition/types/types'

export type Proto3Message = {
    id: string
    internalName: 'message'
    clone(params: Partial<GetNewParams<Proto3Message>>): Proto3Message
    addPrefix(prefix: string): Proto3Message
    getDeepMessages(): AnyProto3Message[]
    getDeepImportedTypes(): Proto3ImportedType[]
    getNextIndex(): number
    /**
     * @example 'User'
     */
    name: string
    fields: AnyProto3MessageField[]
    extensions: Proto3Extension[]
    comments: string[]
}

export const Proto3Message = {
    new: function <const TParams extends DeepReadOnly<GetNewParams<Proto3Message>>>(
        params: TParams
    ) {
        return {
            id: getRandomId(),
            internalName: 'message',
            clone<
                const T extends DeepReadOnly<Proto3Message>,
                const TParams extends Partial<DeepReadOnly<GetNewParams<Proto3Message>>>,
            >(this: T, params: PurgeUndefinedValues<TParams>) {
                return Proto3Message.clone(this, params)
            },
            addPrefix<
                const T extends DeepReadOnly<Proto3Message>,
                const TPrefix extends string,
            >(this: T, prefix: TPrefix) {
                return Proto3Message.addPrefix(this, prefix)
            },
            getDeepMessages() {
                const deepMessages = this.fields
                    .map((field) => field.getDeepMessages())
                    .flat()

                return [this, ...deepMessages]
            },
            getDeepImportedTypes() {
                return this.fields.map((field) => field.getDeepImportedTypes()).flat()
            },
            getNextIndex() {
                const normalFieldsCount = this.fields.filter(
                    (field) => field.internalName === 'message_field'
                ).length

                const oneOfFieldsCounts = this.fields
                    .filter((field) => field.internalName === 'message_one_of_field')
                    .map((field) => field.subFields.length)

                const counts = [normalFieldsCount, oneOfFieldsCounts].flat()
                const fieldsCount = counts.reduce(
                    (accumulator, currentValue) => accumulator + currentValue,
                    0
                )

                return fieldsCount + 1
            },
            ...params,
        } as const satisfies DeepReadOnly<Proto3Message>
    },
    clone<
        const T extends DeepReadOnly<Proto3Message>,
        const TParams extends Partial<DeepReadOnly<GetNewParams<Proto3Message>>>,
        const TOutput extends Omit<T, keyof TParams> & TParams,
        // TODO: Omit<T, keyof TParams> & TParams
    >(
        object: T,
        params: PurgeUndefinedValues<TParams>
    ): TOutput extends DeepReadOnly<Proto3Message> ? TOutput : never {
        return {
            ...object,
            ...params,
        } as any // I didn't have a better solution than any XD, but out of the method, the types are fine.
        // TODO: as const satisfies DeepReadOnly<Proto3Message>
        // as DeepReadOnly<Omit<Proto3Message, keyof TParams> & TParams>
        // as any
    },
    addPrefix<const T extends DeepReadOnly<Proto3Message>, const TPrefix extends string>(
        object: T,
        prefix: TPrefix
    ): Omit<T, 'name'> & { readonly name: `${TPrefix}${T['name']}` } {
        return {
            ...object,
            name: `${prefix}${object.name}`,
        } as const satisfies DeepReadOnly<Proto3Message>
    },
} as const

// const message = Proto3Message.new({
//     name: 'tes',
//     fields: [],
//     extensions: [],
//     comments: ['allo'],
// })
// message.name

// const test = Proto3Message.clone(message, {
//     name: undefined,
// })
// const test = message.clone({
//     name: 'tes222',
//     fields: [Proto3MessageField.new({
//         'comments': [],
//         'extensions': [],
//         'index': 1,
//         'key': '',
//         'optionalState': 'NONE',
//         'type': Proto3StringType.new()
//     })]
// })
// const test = message.addPrefix('ddd=--')

// test.fields[0].

// const test = Proto3Message.addPrefix(message, 'fdd')
// const test = message.addPrefix( 'fdd')
// const test = Proto3Message.clone(message,{ name: 'test' })

// test.fields
// type tt = (typeof test)['name']

export type Proto3Enum = {
    id: string
    internalName: 'enum'
    getDeepMessages(): AnyProto3Message[]
    getDeepImportedTypes(): Proto3ImportedType[]
    name: string
    fields: Proto3EnumField[]
    extensions: Proto3Extension[]
    comments: string[]
}

export const Proto3Enum = {
    new: function <const TParams extends DeepReadOnly<GetNewParams<Proto3Enum>>>(
        params: TParams
    ) {
        return {
            id: getRandomId(),
            internalName: 'enum',
            getDeepMessages() {
                return [this]
            },
            getDeepImportedTypes() {
                return []
            },
            ...params,
        } as const satisfies DeepReadOnly<Proto3Enum>
    },
} as const

export type AnyProto3Message = Proto3Message | Proto3Enum
