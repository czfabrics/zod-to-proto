import { Proto3Extension } from '#proto3_definition/types/extension'
import { Proto3MessageField } from '#proto3_definition/types/fields'
import { GetNewParams } from '#proto3_definition/types/get_new_params'
import { AnyProto3Message } from '#proto3_definition/types/messages'
import { Proto3ImportedType } from '#proto3_definition/types/types'

export type Proto3RpcFunction = {
    internalName: 'rpc_function'
    getDeepMessages(): AnyProto3Message[]
    getDeepImportedTypes(): Proto3ImportedType[]
    getDeepOptionalMessageFields(): Proto3MessageField[]
    name: string
    in: AnyProto3Message | Proto3ImportedType
    inStream: boolean
    out: AnyProto3Message | Proto3ImportedType
    outStream: boolean
    extensions: Proto3Extension[]
}

export const Proto3RpcFunction = {
    new: (params: GetNewParams<Proto3RpcFunction>): Proto3RpcFunction => {
        return {
            internalName: 'rpc_function',
            getDeepMessages() {
                return [...this.in.getDeepMessages(), ...this.out.getDeepMessages()]
            },
            getDeepImportedTypes() {
                return [
                    ...this.in.getDeepImportedTypes(),
                    ...this.out.getDeepImportedTypes(),
                    ...this.extensions.map((extension) =>
                        extension.getDeepImportedTypes()
                    ),
                ].flat()
            },
            getDeepOptionalMessageFields() {
                return [
                    ...this.in.getDeepOptionalMessageFields(),
                    ...this.out.getDeepOptionalMessageFields(),
                ]
            },
            ...params,
        }
    },
} as const
