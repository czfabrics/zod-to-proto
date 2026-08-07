import { Proto3MapType, Proto3RepeatedType } from '#proto3_definition/types/dynamic_size'
import {
    Proto3EnumField,
    Proto3MessageField,
    Proto3MessageOneOfField,
    Proto3MessageOneOfFieldSubField,
} from '#proto3_definition/types/fields'
import { Proto3Enum, Proto3Message } from '#proto3_definition/types/messages'
import {
    Proto3Int32Type,
    Proto3Int64Type,
    Proto3StringType,
} from '#proto3_definition/types/scalar_standalones'
import { Proto3RuntimeEnumResolver } from '#proto3_runtime/classes/proto3_runtime_enum_resolver'
import { Proto3RuntimeMessageResolver } from '#proto3_runtime/classes/proto3_runtime_message_resolver'
import type { ReadOnlyProto3Message } from '#proto3_definition/types/messages'
import * as protobuf from 'protobufjs'
import { describe, test } from 'vitest'

const getTaskMessage = function (name: string) {
    return Proto3Message.new({
        name,
        fields: [],
        extensions: [],
        comments: [],
    })
}

const getAccessMessage = function () {
    return Proto3Message.new({
        name: 'Access',
        fields: [
            Proto3MessageField.new({
                key: 'level',
                index: 1,
                optionalState: 'NONE',
                type: Proto3Int32Type.new(),
                extensions: [],
                comments: [],
            }),
        ],
        extensions: [],
        comments: [],
    })
}

const getTargetMessage = function () {
    return Proto3Message.new({
        name: 'Target',
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
}

const getUserRoleEnum = function () {
    return Proto3Enum.new({
        name: 'UserRole',
        fields: [
            Proto3EnumField.new({
                key: 'ADMIN',
                index: 0,
                extensions: [],
                comments: [],
            }),
            Proto3EnumField.new({
                key: 'VIEWER',
                index: 1,
                extensions: [],
                comments: [],
            }),
        ],
        extensions: [],
        comments: [],
    })
}

const getOneOfTaskMessage = function () {
    return Proto3Message.new({
        name: 'Task',
        fields: [
            Proto3MessageOneOfField.new({
                key: 'task',
                subFields: [
                    Proto3MessageOneOfFieldSubField.new({
                        key: 'synchronize_users',
                        index: 1,
                        optionalState: 'NOT_NEEDED',
                        type: getTargetMessage(),
                        extensions: [],
                        comments: [],
                    }),
                    Proto3MessageOneOfFieldSubField.new({
                        key: 'create_workspace',
                        index: 2,
                        optionalState: 'NOT_NEEDED',
                        type: getTargetMessage(),
                        extensions: [],
                        comments: [],
                    }),
                ],
                extensions: [],
                comments: [],
            }),
        ],
        extensions: [],
        comments: [],
    })
}

const getInputMessage = function () {
    return Proto3Message.new({
        name: 'Input',
        fields: [
            Proto3MessageField.new({
                key: 'user_id',
                index: 1,
                optionalState: 'NONE',
                type: Proto3Int64Type.new(),
                extensions: [],
                comments: [],
            }),
            Proto3MessageField.new({
                key: 'full_name',
                index: 2,
                optionalState: 'PRESENT',
                type: Proto3StringType.new(),
                extensions: [],
                comments: [],
            }),
            Proto3MessageField.new({
                key: 'role',
                index: 3,
                optionalState: 'NONE',
                type: getUserRoleEnum(),
                extensions: [],
                comments: [],
            }),
            Proto3MessageField.new({
                key: 'tasks',
                index: 4,
                optionalState: 'NONE',
                type: Proto3RepeatedType.new({ inner: getOneOfTaskMessage() }),
                extensions: [],
                comments: [],
            }),
            Proto3MessageField.new({
                key: 'accesses',
                index: 5,
                optionalState: 'NONE',
                type: Proto3MapType.new({
                    key: Proto3StringType.new(),
                    value: getAccessMessage(),
                }),
                extensions: [],
                comments: [],
            }),
        ],
        extensions: [],
        comments: [],
    })
}

const getCodecMessages = function (): readonly ReadOnlyProto3Message[] {
    return [
        getAccessMessage(),
        getTargetMessage(),
        getOneOfTaskMessage(),
        getInputMessage(),
    ]
}

const getRoot = function () {
    const resolver = new Proto3RuntimeMessageResolver()

    const root = new protobuf.Root()
    const namespace = root.define('demo.v1')

    namespace.add(new Proto3RuntimeEnumResolver().resolveType(getUserRoleEnum()))

    for (const message of getCodecMessages()) {
        namespace.add(resolver.resolveType(message))
    }

    root.resolveAll()

    return root
}

//// rebuilt from the resolved descriptor, so it carries the same schema without the overrides
const getNativeRoot = function () {
    const root = protobuf.Root.fromJSON(getRoot().toJSON())

    root.resolveAll()

    return root
}

describe('`Proto3RuntimeMessageResolver` test suite', () => {
    test('Testing a plain message', async ({ expect }) => {
        const resolver = new Proto3RuntimeMessageResolver()

        const message = Proto3Message.new({
            name: 'User',
            fields: [
                Proto3MessageField.new({
                    key: 'id',
                    index: 1,
                    optionalState: 'NONE',
                    type: Proto3Int64Type.new(),
                    extensions: [],
                    comments: [],
                }),
                Proto3MessageField.new({
                    key: 'full_name',
                    index: 2,
                    optionalState: 'PRESENT',
                    type: Proto3StringType.new(),
                    extensions: [],
                    comments: [],
                }),
            ],
            extensions: [],
            comments: [],
        })

        const result = resolver.resolveType(message)

        expect(result).toBeInstanceOf(protobuf.Type)
        expect(result.name).toBe('User')
        expect(result.toJSON()).toStrictEqual({
            fields: {
                id: { id: 1, type: 'int64' },
                full_name: {
                    id: 2,
                    type: 'string',
                    options: { proto3_optional: true },
                },
            },
        })
    })

    test('Testing a message holding a one of field', async ({ expect }) => {
        const resolver = new Proto3RuntimeMessageResolver()

        const message = Proto3Message.new({
            name: 'PostAsyncTasksInputTask',
            fields: [
                Proto3MessageOneOfField.new({
                    key: 'task',
                    subFields: [
                        Proto3MessageOneOfFieldSubField.new({
                            key: 'synchronize_users',
                            index: 1,
                            optionalState: 'NOT_NEEDED',
                            type: getTaskMessage('SynchronizeUsersTask'),
                            extensions: [],
                            comments: [],
                        }),
                        Proto3MessageOneOfFieldSubField.new({
                            key: 'create_workspace',
                            index: 2,
                            optionalState: 'NOT_NEEDED',
                            type: getTaskMessage('CreateWorkspaceTask'),
                            extensions: [],
                            comments: [],
                        }),
                        Proto3MessageOneOfFieldSubField.new({
                            key: 'update_workspace',
                            index: 3,
                            optionalState: 'NOT_NEEDED',
                            type: getTaskMessage('UpdateWorkspaceTask'),
                            extensions: [],
                            comments: [],
                        }),
                    ],
                    extensions: [],
                    comments: [],
                }),
            ],
            extensions: [],
            comments: [],
        })

        const result = resolver.resolveType(message)

        expect(result.toJSON()).toStrictEqual({
            fields: {
                synchronize_users: { id: 1, type: 'SynchronizeUsersTask' },
                create_workspace: { id: 2, type: 'CreateWorkspaceTask' },
                update_workspace: { id: 3, type: 'UpdateWorkspaceTask' },
            },
            oneofs: {
                task: {
                    oneof: ['synchronize_users', 'create_workspace', 'update_workspace'],
                },
            },
        })
    })

    test('Testing that a one of binds its sub fields to the type', async ({ expect }) => {
        const resolver = new Proto3RuntimeMessageResolver()

        const result = resolver.resolveType(getOneOfTaskMessage())

        expect(result).toBeInstanceOf(protobuf.Type)
        expect(result.oneofsArray.map((oneof) => oneof.name)).toStrictEqual(['task'])
        expect(
            result.oneofsArray[0]?.fieldsArray.map((field) => field.name)
        ).toStrictEqual(['synchronize_users', 'create_workspace'])
    })

    test('Testing that a repeated scalar keeps the proto3 packed encoding', async ({
        expect,
    }) => {
        const resolver = new Proto3RuntimeMessageResolver()

        const message = Proto3Message.new({
            name: 'Scores',
            fields: [
                Proto3MessageField.new({
                    key: 'values',
                    index: 1,
                    optionalState: 'NONE',
                    type: Proto3RepeatedType.new({ inner: Proto3Int32Type.new() }),
                    extensions: [],
                    comments: [],
                }),
            ],
            extensions: [],
            comments: [],
        })

        const root = new protobuf.Root()
        const resolved = resolver.resolveType(message)

        root.define('demo.v1').add(resolved)
        root.resolveAll()

        const Scores = root.lookupType('demo.v1.Scores')
        const bytes = Buffer.from(Scores.encode({ values: [1, 2, 3] }).finish())

        //// proto2 would resolve the same field as expanded, emitting `080108020803`
        expect(bytes.toString('hex')).toBe('0a03010203')
    })

    test('Testing a full round trip in the JS shape', async ({ expect }) => {
        const Input = getRoot().lookupType('demo.v1.Input')

        const value = {
            userId: 42,
            fullName: 'Ada',
            role: 'VIEWER',
            tasks: [
                {
                    task: {
                        $case: 'synchronizeUsers',
                        value: { externalId: 'w-1' },
                    },
                },
            ],
            accesses: { 'team-a': { level: 3 } },
        }

        const decoded = Input.decode(Input.encode(value).finish())

        expect(decoded).toStrictEqual(value)
    })

    test('Testing that an omitted optional field stays omitted', async ({ expect }) => {
        const Input = getRoot().lookupType('demo.v1.Input')

        const value = {
            userId: 7,
            role: 'ADMIN',
            tasks: [],
            accesses: {},
        }

        const decoded = Input.decode(Input.encode(value).finish())

        expect(decoded).toStrictEqual(value)
    })

    test('Testing that absent non optional fields fall back to the proto3 defaults', async ({
        expect,
    }) => {
        const Input = getRoot().lookupType('demo.v1.Input')

        const decoded = Input.decode(new Uint8Array())

        expect(decoded).toStrictEqual({
            userId: 0,
            role: 'ADMIN',
            tasks: [],
            accesses: {},
        })
    })

    test('Testing that an unknown enum name is rejected instead of encoded as zero', async ({
        expect,
    }) => {
        const Input = getRoot().lookupType('demo.v1.Input')

        expect(() =>
            Input.encode({ userId: 1, role: 'GHOST', tasks: [], accesses: {} })
        ).toThrowError(/GHOST.*ADMIN, VIEWER/)
    })

    test('Testing that a raw enum value is left untouched', async ({ expect }) => {
        const Input = getRoot().lookupType('demo.v1.Input')

        const bytes = Input.encode({
            userId: 0,
            role: 1,
            tasks: [],
            accesses: {},
        }).finish()

        expect(Input.decode(bytes)).toStrictEqual({
            userId: 0,
            role: 'VIEWER',
            tasks: [],
            accesses: {},
        })
    })

    test('Testing that an enum value absent from the schema survives a decode', async ({
        expect,
    }) => {
        const Input = getRoot().lookupType('demo.v1.Input')

        //// field 3, varint 99: a value a newer peer knows and this schema does not
        const decoded = Input.decode(Buffer.from('1863', 'hex'))

        expect(decoded).toStrictEqual({
            userId: 0,
            role: 99,
            tasks: [],
            accesses: {},
        })
    })

    test('Testing that a repeated field rejects a value that is not a list', async ({
        expect,
    }) => {
        const Input = getRoot().lookupType('demo.v1.Input')

        expect(() =>
            Input.encode({ userId: 1, role: 'ADMIN', tasks: {}, accesses: {} })
        ).toThrowError(/repeated field "tasks"/)
    })

    test('Testing that map keys are never camel cased', async ({ expect }) => {
        const Input = getRoot().lookupType('demo.v1.Input')

        const value = {
            userId: 1,
            role: 'ADMIN',
            tasks: [],
            accesses: { team_a: { level: 1 } },
        }

        const decoded = Input.decode(Input.encode(value).finish()) as unknown as {
            accesses: Record<string, unknown>
        }

        expect(Object.keys(decoded.accesses)).toStrictEqual(['team_a'])
    })

    test('Testing that the wire format stays untouched by the conversion', async ({
        expect,
    }) => {
        const Input = getRoot().lookupType('demo.v1.Input')

        const bytes = Input.encode({
            userId: 42,
            fullName: 'Ada',
            role: 'VIEWER',
            tasks: [
                {
                    task: {
                        $case: 'synchronizeUsers',
                        value: { externalId: 'w-1' },
                    },
                },
            ],
            accesses: {},
        }).finish()

        const NativeInput = getNativeRoot().lookupType('demo.v1.Input')
        const native = NativeInput.toObject(NativeInput.decode(bytes), {
            longs: Number,
        })

        expect(native).toStrictEqual({
            user_id: 42,
            full_name: 'Ada',
            role: 1,
            tasks: [{ synchronize_users: { external_id: 'w-1' } }],
        })
    })

    test('Testing that a nested type converts through its own override', async ({
        expect,
    }) => {
        const Target = getRoot().lookupType('demo.v1.Target')

        const decoded = Target.decode(Target.encode({ externalId: 'w-9' }).finish())

        expect(decoded).toStrictEqual({ externalId: 'w-9' })
    })
})
