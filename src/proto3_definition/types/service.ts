import { Proto3Extension } from '#proto3_definition/types/extension'
import { Proto3RpcFunction } from '#proto3_definition/types/functions'
import { GetNewParams } from '#proto3_definition/types/get_new_params'
import { AnyProto3Message } from '#proto3_definition/types/messages'
import { Proto3ImportedType } from '#proto3_definition/types/types'

export type Proto3RpcService = {
    internalName: 'rpc_service'
    getDeepMessages(): AnyProto3Message[]
    getDeepImportedTypes(): Proto3ImportedType[]
    /**
     * @example 'UserService'
     */
    name: string
    functions: Proto3RpcFunction[]
    extensions: Proto3Extension[]
    comments: string[]
}

export const Proto3RpcService = {
    new: (params: GetNewParams<Proto3RpcService>): Proto3RpcService => {
        return {
            internalName: 'rpc_service',
            getDeepMessages() {
                return this.functions
                    .map((rpcFunction) => rpcFunction.getDeepMessages())
                    .flat()
            },
            getDeepImportedTypes() {
                return this.functions
                    .map((rpcFunction) => rpcFunction.getDeepImportedTypes())
                    .flat()
            },
            ...params,
        }
    },
} as const
