import type { ReadOnlyProto3File } from '#proto3_definition/types/file'
import { Proto3RuntimeRootResolver } from '#proto3_runtime/classes/proto3_runtime_root_resolver'
import type { Proto3RuntimeDefinition } from '#proto3_runtime/types/runtime'
import type { MethodDefinition, ServiceDefinition } from '@grpc/grpc-js'
import { camelCase } from 'change-case'

export class Proto3RuntimeResolver {
    public resolveType(file: ReadOnlyProto3File): Proto3RuntimeDefinition {
        file = file.propagateTypePrefix()

        const resolver = new Proto3RuntimeRootResolver()
        const root = resolver.resolveType(file)

        root.resolveAll()

        const services: Record<string, ServiceDefinition> = {}

        for (const service of file.services) {
            const fullName = `${file.packageName}.${service.name}`
            const runtimeService = root.lookupService(fullName)

            const definition: Record<string, MethodDefinition<unknown, unknown>> = {}

            for (const rpcFunction of service.functions) {
                const method = runtimeService.methods[rpcFunction.name]

                if (
                    method === undefined ||
                    method.resolvedRequestType === null ||
                    method.resolvedResponseType === null
                ) {
                    throw new Error(
                        `Cannot resolve runtime types for "${fullName}/${rpcFunction.name}"`
                    )
                }

                const requestType = method.resolvedRequestType
                const responseType = method.resolvedResponseType

                definition[rpcFunction.name] = {
                    path: `/${fullName}/${rpcFunction.name}`,
                    originalName: camelCase(rpcFunction.name),
                    requestStream: rpcFunction.inStream,
                    responseStream: rpcFunction.outStream,
                    requestSerialize: (value) =>
                        Buffer.from(requestType.encode(value as object).finish()),
                    requestDeserialize: (bytes) => requestType.decode(bytes),
                    responseSerialize: (value) =>
                        Buffer.from(responseType.encode(value as object).finish()),
                    responseDeserialize: (bytes) => responseType.decode(bytes),
                }
            }

            services[fullName] = definition
        }

        return { root, services }
    }
}
