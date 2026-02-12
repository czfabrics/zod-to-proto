import type { DeepReadOnly } from '#core/types/deep_read_only'
import type { PurgeUndefinedValues } from '#core/types/purge_undefined_values'
import type { CloneParams } from '#proto3_definition/types/clone'
import type { Proto3Extension } from '#proto3_definition/types/extension'
import type { Proto3RpcFunction } from '#proto3_definition/types/functions'
import type { GetNewParams } from '#proto3_definition/types/get_new_params'
import type { AnyProto3Message } from '#proto3_definition/types/messages'
import type { Proto3ImportedType } from '#proto3_definition/types/types'

export type Proto3RpcService = {
    internalName: 'rpc_service'
    clone(params: CloneParams<Proto3RpcService>): ReadOnlyProto3RpcService
    propagateTypePrefix(prefixList: string[]): ReadOnlyProto3RpcService
    getDeepMessages(): AnyProto3Message[]
    getDeepImportedTypes(): Proto3ImportedType[]
    /**
     * @example 'UserService'
     */
    name: string
    typePrefix: string | null
    functions: Proto3RpcFunction[]
    extensions: Proto3Extension[]
    comments: string[]
}
export type ReadOnlyProto3RpcService = DeepReadOnly<Proto3RpcService>

export const Proto3RpcService = {
    new: function (params: GetNewParams<Proto3RpcService>): ReadOnlyProto3RpcService {
        return {
            internalName: 'rpc_service',
            clone(
                this: ReadOnlyProto3RpcService,
                params: PurgeUndefinedValues<CloneParams<Proto3RpcFunction>>
            ): ReadOnlyProto3RpcService {
                return {
                    ...this,
                    ...params,
                }
            },
            propagateTypePrefix(
                this: ReadOnlyProto3RpcService,
                prefixList: string[]
            ): ReadOnlyProto3RpcService {
                const newFunctions = this.functions.map((rpcFunction) => {
                    if (this.typePrefix !== null) {
                        return rpcFunction.propagateTypePrefix([
                            ...prefixList,
                            this.typePrefix,
                        ])
                    }

                    return rpcFunction.propagateTypePrefix(prefixList)
                })

                return this.clone({
                    functions: newFunctions,
                })
            },
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
