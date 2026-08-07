import type { ReadOnlyProto3RpcFunction } from '#proto3_definition/types/functions'
import { getTypeReference } from '#proto3_runtime/helpers/get_type_reference'
import * as protobuf from 'protobufjs'

export class Proto3RuntimeMethodResolver {
    public resolveType(rpcFunction: ReadOnlyProto3RpcFunction): protobuf.Method {
        return new protobuf.Method(
            rpcFunction.name,
            'rpc',
            getTypeReference(rpcFunction.in),
            getTypeReference(rpcFunction.out),
            rpcFunction.inStream,
            rpcFunction.outStream,
            undefined,
            rpcFunction.comments.join('\n')
        )
    }
}
