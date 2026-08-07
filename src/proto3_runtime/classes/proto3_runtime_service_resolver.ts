import type { ReadOnlyProto3RpcService } from '#proto3_definition/types/service'
import { Proto3RuntimeMethodResolver } from '#proto3_runtime/classes/proto3_runtime_method_resolver'
import { pinProto3Edition } from '#proto3_runtime/helpers/pin_proto3_edition'
import * as protobuf from 'protobufjs'

export class Proto3RuntimeServiceResolver {
    private readonly methodResolver = new Proto3RuntimeMethodResolver()

    public resolveType(service: ReadOnlyProto3RpcService): protobuf.Service {
        const runtimeService = pinProto3Edition(new protobuf.Service(service.name))

        for (const rpcFunction of service.functions) {
            runtimeService.add(this.methodResolver.resolveType(rpcFunction))
        }

        return runtimeService
    }
}
