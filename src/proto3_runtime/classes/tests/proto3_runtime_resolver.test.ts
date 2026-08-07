import { Proto3Empty } from '#plugin/types/google_protobuf'
import { Proto3MessageField } from '#proto3_definition/types/fields'
import { Proto3File } from '#proto3_definition/types/file'
import { Proto3RpcFunction } from '#proto3_definition/types/functions'
import { Proto3Message } from '#proto3_definition/types/messages'
import { Proto3StringType } from '#proto3_definition/types/scalar_standalones'
import { Proto3RpcService } from '#proto3_definition/types/service'
import { Proto3ImportedType } from '#proto3_definition/types/types'
import { Proto3RuntimeResolver } from '#proto3_runtime/classes/proto3_runtime_resolver'
import type { ReadOnlyProto3ImportedType } from '#proto3_definition/types/types'
import { describe, test } from 'vitest'

const SERVICE_FULL_NAME = 'services.synchronization.v1.SynchronizationService'

const getFile = function (
    out: ReadOnlyProto3ImportedType,
    inStream: boolean = false,
    outStream: boolean = false
) {
    const input = Proto3Message.new({
        name: 'PostAsyncTasksInput',
        fields: [
            Proto3MessageField.new({
                key: 'external_id',
                index: 1,
                optionalState: 'NONE',
                type: Proto3StringType.new(),
                extensions: [],
                comments: [],
            }),
        ],
        extensions: [],
        comments: [],
    })

    return Proto3File.new({
        syntax: 'proto3',
        packageName: 'services.synchronization.v1',
        typePrefix: null,
        services: [
            Proto3RpcService.new({
                name: 'SynchronizationService',
                typePrefix: null,
                functions: [
                    Proto3RpcFunction.new({
                        name: 'PostAsyncTasks',
                        typePrefix: null,
                        in: input,
                        inStream,
                        out,
                        outStream,
                        extensions: [],
                        comments: [],
                    }),
                ],
                extensions: [],
                comments: [],
            }),
        ],
        unscopedMessages: [],
        extensions: [],
    })
}

describe('`Proto3RuntimeResolver` test suite', () => {
    test('Testing the produced gRPC service definition shape', async ({ expect }) => {
        const resolver = new Proto3RuntimeResolver()

        const result = resolver.resolveType(getFile(Proto3Empty.useType()))

        expect(Object.keys(result.services)).toStrictEqual([SERVICE_FULL_NAME])

        const method = result.services[SERVICE_FULL_NAME]?.['PostAsyncTasks']

        expect(method?.path).toBe(`/${SERVICE_FULL_NAME}/PostAsyncTasks`)
        expect(method?.originalName).toBe('postAsyncTasks')
        expect(method?.requestStream).toBe(false)
        expect(method?.responseStream).toBe(false)
    })

    test('Testing the request serializer round trip', async ({ expect }) => {
        const resolver = new Proto3RuntimeResolver()

        const result = resolver.resolveType(getFile(Proto3Empty.useType()))
        const method = result.services[SERVICE_FULL_NAME]?.['PostAsyncTasks']

        const value = { externalId: 'w-1' }
        const bytes = method?.requestSerialize(value)

        expect(bytes).toBeInstanceOf(Buffer)
        expect(method?.requestDeserialize(bytes as Buffer)).toStrictEqual(value)
    })

    test('Testing that the imported response type resolves', async ({ expect }) => {
        const resolver = new Proto3RuntimeResolver()

        const result = resolver.resolveType(getFile(Proto3Empty.useType()))
        const method = result.services[SERVICE_FULL_NAME]?.['PostAsyncTasks']

        const bytes = method?.responseSerialize({})

        expect(bytes).toBeInstanceOf(Buffer)

        //// imported well-known types keep their protobufjs representation, so this is an `Empty` instance
        expect({ ...method?.responseDeserialize(bytes as Buffer) }).toStrictEqual({})
    })

    test('Testing that both streaming flags reach the definition', async ({ expect }) => {
        const resolver = new Proto3RuntimeResolver()

        const result = resolver.resolveType(getFile(Proto3Empty.useType(), true, true))
        const method = result.services[SERVICE_FULL_NAME]?.['PostAsyncTasks']

        expect(method?.requestStream).toBe(true)
        expect(method?.responseStream).toBe(true)
    })

    test('Testing that an unbundled imported type throws a named error', async ({
        expect,
    }) => {
        const resolver = new Proto3RuntimeResolver()

        const custom = Proto3ImportedType.new({
            importPath: 'acme/custom.proto',
            typeReference: 'acme.Custom',
        })

        expect(() => resolver.resolveType(getFile(custom))).toThrowError(
            /acme\/custom\.proto/
        )
    })
})
