import { Proto3Empty } from '#plugin/types/google_protobuf'
import { Proto3RpcFunction } from '#proto3_definition/types/functions'
import { Proto3Message } from '#proto3_definition/types/messages'
import { Proto3RpcService } from '#proto3_definition/types/service'
import { Proto3RuntimeServiceResolver } from '#proto3_runtime/classes/proto3_runtime_service_resolver'
import * as protobuf from 'protobufjs'
import { describe, test } from 'vitest'

const getService = function (inStream: boolean, outStream: boolean) {
    const input = Proto3Message.new({
        name: 'PostAsyncTasksInput',
        fields: [],
        extensions: [],
        comments: [],
    })

    return Proto3RpcService.new({
        name: 'SynchronizationService',
        typePrefix: null,
        functions: [
            Proto3RpcFunction.new({
                name: 'PostAsyncTasks',
                typePrefix: null,
                in: input,
                inStream,
                out: Proto3Empty.useType(),
                outStream,
                extensions: [],
                comments: [],
            }),
        ],
        extensions: [],
        comments: [],
    })
}

describe('`Proto3RuntimeServiceResolver` test suite', () => {
    test('Testing a unary function with an imported response', async ({ expect }) => {
        const resolver = new Proto3RuntimeServiceResolver()

        const result = resolver.resolveType(getService(false, false))

        expect(result).toBeInstanceOf(protobuf.Service)
        expect(result.name).toBe('SynchronizationService')

        //// protobufjs drops a `false` stream flag rather than storing it
        expect(result.toJSON()).toStrictEqual({
            methods: {
                PostAsyncTasks: {
                    requestType: 'PostAsyncTasksInput',
                    responseType: '.google.protobuf.Empty',
                },
            },
        })
        expect(result.methods['PostAsyncTasks']?.comment).toBe('')
    })

    test('Testing a bidirectional streaming function', async ({ expect }) => {
        const resolver = new Proto3RuntimeServiceResolver()

        const result = resolver.resolveType(getService(true, true))

        expect(result.toJSON()).toStrictEqual({
            methods: {
                PostAsyncTasks: {
                    requestType: 'PostAsyncTasksInput',
                    requestStream: true,
                    responseType: '.google.protobuf.Empty',
                    responseStream: true,
                },
            },
        })
    })
})
