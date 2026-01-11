import { AnyProto3ExtensionValue } from '#proto3_definition/types/extensions/values'
import { GetNewParams } from '#proto3_definition/types/get_new_params'
import { Proto3ImportedType } from '#proto3_definition/types/imported_type'

export type Proto3RpcFunctionExtension = {
    internalName: 'rpc_function_extension'
    getDeepImportedTypes(): Proto3ImportedType[]
    //// TODO: handle extend keyword (custom extension)
    key: Proto3ImportedType
    value: AnyProto3ExtensionValue
}

export const Proto3RpcFunctionExtension = {
    new: (
        params: GetNewParams<Proto3RpcFunctionExtension>
    ): Proto3RpcFunctionExtension => {
        return {
            internalName: 'rpc_function_extension',
            getDeepImportedTypes() {
                return [this.key]
            },
            ...params,
        }
    },
} as const
