import { Proto3ValidateFieldAnnotation } from '#plugin/types/buf_validate'
import { Proto3Empty } from '#plugin/types/google_protobuf'
import { Proto3MessageField } from '#proto3_definition/types/fields'
import { Proto3File } from '#proto3_definition/types/file'
import { Proto3RpcFunction } from '#proto3_definition/types/functions'
import { Proto3Message } from '#proto3_definition/types/messages'
import { Proto3StringType } from '#proto3_definition/types/scalar_standalones'
import { Proto3RpcService } from '#proto3_definition/types/service'
import { Proto3ImportedType } from '#proto3_definition/types/types'
import { Proto3RuntimeAnyMessageResolver } from '#proto3_runtime/classes/proto3_runtime_any_message_resolver'
import { Proto3RuntimeRootResolver } from '#proto3_runtime/classes/proto3_runtime_root_resolver'
import type { ReadOnlyAnyProto3Message } from '#proto3_definition/types/messages'
import type { ReadOnlyProto3RpcFunction } from '#proto3_definition/types/functions'
import * as protobuf from 'protobufjs'
import { describe, test } from 'vitest'

const getUserMessage = function () {
    return Proto3Message.new({
        name: 'User',
        fields: [
            Proto3MessageField.new({
                key: 'full_name',
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
}

const getFile = function (
    functions: readonly ReadOnlyProto3RpcFunction[],
    unscopedMessages: readonly ReadOnlyAnyProto3Message[] = []
) {
    return Proto3File.new({
        syntax: 'proto3',
        packageName: 'services.authentication.v1',
        typePrefix: null,
        services: [
            Proto3RpcService.new({
                name: 'UserService',
                typePrefix: null,
                functions,
                extensions: [],
                comments: [],
            }),
        ],
        unscopedMessages,
        extensions: [],
    })
}

const getFunction = function (
    name: string,
    input: ReadOnlyAnyProto3Message
): ReadOnlyProto3RpcFunction {
    return Proto3RpcFunction.new({
        name,
        typePrefix: null,
        in: input,
        inStream: false,
        out: Proto3Empty.useType(),
        outStream: false,
        extensions: [],
        comments: [],
    })
}

describe('`Proto3RuntimeRootResolver` test suite', () => {
    test('Testing the package name nesting', async ({ expect }) => {
        const resolver = new Proto3RuntimeRootResolver()

        const root = resolver.resolveType(getFile([], [getUserMessage()]))

        expect(root).toBeInstanceOf(protobuf.Root)
        expect(root.toJSON()).toStrictEqual({
            nested: {
                services: {
                    nested: {
                        authentication: {
                            nested: {
                                v1: {
                                    nested: {
                                        User: {
                                            fields: {
                                                full_name: { id: 1, type: 'string' },
                                            },
                                        },
                                        UserService: { methods: {} },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        })
    })

    test('Testing that a message referenced twice is emitted once', async ({
        expect,
    }) => {
        const resolver = new Proto3RuntimeRootResolver()

        const user = getUserMessage()
        const root = resolver.resolveType(
            getFile([getFunction('GetUsers', user), getFunction('PostUsers', user)])
        )

        const namespace = root.lookup('services.authentication.v1')

        expect(namespace).toBeInstanceOf(protobuf.Namespace)
        expect(
            (namespace as protobuf.Namespace).nestedArray.map((nested) => nested.name)
        ).toStrictEqual(['User', 'UserService'])
    })

    test('Testing that `getDeepMessages` itself hands back the duplicate', async ({
        expect,
    }) => {
        const user = getUserMessage()
        const file = getFile([
            getFunction('GetUsers', user),
            getFunction('PostUsers', user),
        ])

        const names = file.getDeepMessages().map((message) => message.name)

        //// the deduplication belongs to the resolver, the definition only concatenates
        expect(names).toStrictEqual(['User', 'User'])
    })

    test('Testing that a duplicate message would break the protobufjs namespace', async ({
        expect,
    }) => {
        const user = getUserMessage()
        const file = getFile([
            getFunction('GetUsers', user),
            getFunction('PostUsers', user),
        ])

        const resolver = new Proto3RuntimeAnyMessageResolver()
        const namespace = new protobuf.Root().define('services.authentication.v1')

        expect(() => {
            for (const message of file.getDeepMessages()) {
                namespace.add(resolver.resolveType(message))
            }
        }).toThrowError(/duplicate name 'User'/)
    })

    test('Testing that an extension import is collected like a payload one', async ({
        expect,
    }) => {
        const resolver = new Proto3RuntimeRootResolver()

        const validatedUser = Proto3Message.new({
            name: 'User',
            fields: [
                Proto3MessageField.new({
                    key: 'full_name',
                    index: 1,
                    optionalState: 'NONE',
                    type: Proto3StringType.new(),
                    extensions: [
                        Proto3ValidateFieldAnnotation.useExtension({ required: true }),
                    ],
                    comments: [],
                }),
            ],
            extensions: [],
            comments: [],
        })

        //// `getDeepImportedTypes` walks the field extensions too, and
        //// `buf/validate/validate.proto` is not bundled
        expect(() =>
            resolver.resolveType(getFile([getFunction('GetUsers', validatedUser)]))
        ).toThrowError(/buf\/validate\/validate\.proto/)
    })

    test('Testing that a repeated import path is registered once', async ({ expect }) => {
        const resolver = new Proto3RuntimeRootResolver()

        const user = getUserMessage()
        const root = resolver.resolveType(
            getFile([getFunction('GetUsers', user), getFunction('PostUsers', user)])
        )

        expect(root.lookup('.google.protobuf.Empty')).not.toBeNull()
    })

    test('Testing that the resolved root carries the installed codecs', async ({
        expect,
    }) => {
        const resolver = new Proto3RuntimeRootResolver()

        const root = resolver.resolveType(getFile([], [getUserMessage()]))
        const User = root.lookupType('services.authentication.v1.User')

        const decoded = User.decode(User.encode({ fullName: 'Ada' }).finish())

        expect(decoded).toStrictEqual({ fullName: 'Ada' })
    })

    test('Testing that an unbundled imported type throws a named error', async ({
        expect,
    }) => {
        const resolver = new Proto3RuntimeRootResolver()

        const custom = Proto3ImportedType.new({
            importPath: 'acme/custom.proto',
            typeReference: 'acme.Custom',
        })

        const file = getFile([
            Proto3RpcFunction.new({
                name: 'GetUsers',
                typePrefix: null,
                in: getUserMessage(),
                inStream: false,
                out: custom,
                outStream: false,
                extensions: [],
                comments: [],
            }),
        ])

        expect(() => resolver.resolveType(file)).toThrowError(/acme\/custom\.proto/)
    })
})
