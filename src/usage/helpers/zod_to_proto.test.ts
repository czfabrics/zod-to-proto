import { Proto3Deprecated } from '#plugin/types/global'
import { Proto3HttpAnnotation } from '#plugin/types/google_api_annotations'
import { zodToProto } from '#usage/helpers/zod_to_proto'
import { pz } from '#zod/helpers/zod_one_of_union'
import { setProtoMeta } from '#zod_converter/helpers/registry'
import { describe, test } from 'vitest'
import z from 'zod'

type TaskSchemaParams = {
    name: string
    target: readonly string[]
}

const getTaskSchema = function <const TParams extends TaskSchemaParams>(params: TParams) {
    const entries = params.target.map((entityName) => {
        return [
            entityName,
            setProtoMeta(
                z.object({
                    externalId: z.string().nonempty(),
                }),
                {
                    protoConversionId: `task_external_entity_${entityName}_schema`,
                }
            ),
        ]
    })

    const shape = Object.fromEntries(entries)
    const target = z.object(shape)

    return z.object({
        name: z.literal(params.name),
        target,
    })
}

export const SynchronizationTaskEnum = {
    SYNCHRONIZE_USERS: 'synchronizeUsers',
    CREATE_WORKSPACE: 'createWorkspace',
    UPDATE_WORKSPACE: 'updateWorkspace',
} as const

export const SynchronizeUsersTaskSchema = getTaskSchema({
    name: SynchronizationTaskEnum.SYNCHRONIZE_USERS,
    target: ['workspace'],
})

export const CreateWorkspaceTaskSchema = getTaskSchema({
    name: SynchronizationTaskEnum.CREATE_WORKSPACE,
    target: ['credential', 'workspace'],
})

export const UpdateWorkspaceTaskSchema = getTaskSchema({
    name: SynchronizationTaskEnum.UPDATE_WORKSPACE,
    target: ['credential', 'workspace'],
})

export const SynchronizationTaskOrGroupExternalUnionWithGroupSchema = pz.oneOfUnion([
    [
        SynchronizationTaskEnum.SYNCHRONIZE_USERS,
        SynchronizeUsersTaskSchema.omit({ name: true }),
    ],
    [
        SynchronizationTaskEnum.CREATE_WORKSPACE,
        CreateWorkspaceTaskSchema.omit({ name: true }),
    ],
    [
        SynchronizationTaskEnum.UPDATE_WORKSPACE,
        UpdateWorkspaceTaskSchema.omit({ name: true }),
    ],
])

describe('`zodToProto` test suite', () => {
    test('Testing basic usage (unscoped message)', async ({ expect }) => {
        const User = z.object({
            id: z.int64(),
            fullName: z.string().optional(),
            role: z.enum(['ADMIN', 'VIEWER']),
        })

        const result = zodToProto({
            syntax: 'proto3',
            packageName: 'services.authentication.v1',
            services: [],
            unscopedMessages: {
                user: User,
            },
        })

        expect(result).toMatchSnapshot('result')
    })

    test('Testing gRPC Service usage', async ({ expect }) => {
        const User = z.object({
            id: z.int64(),
            fullName: z.string().optional(),
            role: z.enum(['ADMIN', 'VIEWER']),
        })

        const result = zodToProto({
            syntax: 'proto3',
            packageName: 'services.user.v1',
            services: [
                {
                    name: 'UserService',
                    functions: [
                        {
                            name: 'GetUsers',
                            in: undefined,
                            inStream: false,
                            out: z.object({
                                users: z.array(User),
                            }),
                            outStream: true,
                        },
                    ],
                },
            ],
        })

        expect(result).toMatchSnapshot('result')
    })

    test('Testing gRPC Service with gRPC gateway annotations usage', async ({
        expect,
    }) => {
        const User = z.object({
            id: z.int64(),
            fullName: z.string().optional(),
            role: z.enum(['ADMIN', 'VIEWER']),
        })

        const result = zodToProto({
            syntax: 'proto3',
            packageName: 'services.user.v1',
            services: [
                {
                    name: 'UserService',
                    functions: [
                        {
                            name: 'AddUser',
                            in: z.object({
                                user: User.omit({ id: true }),
                            }),
                            extensions: [
                                Proto3HttpAnnotation.useExtension({
                                    post: '/users',
                                    body: '*',
                                }),
                            ],
                        },
                    ],
                },
            ],
        })

        expect(result).toMatchSnapshot('result')
    })

    test('Testing type prefix usage', async ({ expect }) => {
        const User = z.object({
            id: z.int64(),
            fullName: z.string().optional(),
            role: z.enum(['ADMIN', 'VIEWER']),
        })
        const User2 = z.object({
            id: z.int64(),
            fullName: z.string().optional(),
            role: z.enum(['ADMIN', 'VIEWER']),
        })

        const result = zodToProto({
            syntax: 'proto3',
            packageName: 'services.user.v1',
            typePrefix: 'UserPackage', // First level prefix
            services: [
                {
                    name: 'UserService',
                    typePrefix: 'UserService', // Second level prefix
                    functions: [
                        {
                            name: 'GetUsers',
                            typePrefix: 'GetUsers', // Third level prefix
                            out: z.object({
                                users: z.array(User),
                            }),
                        },
                    ],
                },
                {
                    name: 'UserService2',
                    typePrefix: 'UserService2',
                    functions: [
                        {
                            name: 'GetUsers',
                            typePrefix: 'GetUsers',
                            out: z.object({
                                users: z.array(User2),
                            }),
                        },
                    ],
                },
            ],
        })

        expect(result).toMatchSnapshot('result')
    })

    test('Testing extension usage', async ({ expect }) => {
        const User = z.object({
            id: z.int64(),
            fullName: z.string().optional(),
            role: z.enum(['ADMIN', 'VIEWER']),
        })

        const result = zodToProto({
            syntax: 'proto3',
            packageName: 'services.user.v1',
            services: [
                {
                    name: 'UserService',
                    functions: [
                        {
                            name: 'GetUsers',
                            out: z.object({
                                users: z.array(User),
                            }),
                            outStream: true,
                            extensions: [
                                //// google.api.http option for gRPC restful gateway
                                Proto3HttpAnnotation.useExtension({
                                    get: '/users',
                                }),
                            ],
                        },
                    ],
                    extensions: [
                        //// Global option
                        Proto3Deprecated.useExtension(true),
                    ],
                },
            ],
        })

        expect(result).toMatchSnapshot('result')
    })

    test('Testing complex usage', async ({ expect }) => {
        const PostAsyncTasksInputDtoSchema = z.object({
            tasks: z
                .array(
                    z.object({
                        task: SynchronizationTaskOrGroupExternalUnionWithGroupSchema,
                    })
                )
                .min(1),
        })

        const result = zodToProto({
            syntax: 'proto3',
            packageName: 'services.synchronization.v1',
            services: [
                {
                    name: 'SynchronizationService',
                    functions: [
                        {
                            name: 'PostAsyncTasks',
                            in: PostAsyncTasksInputDtoSchema,
                            inStream: false,
                        },
                    ],
                },
            ],
        })

        expect(result).toMatchSnapshot('result')
    })

    test('Testing with map dynamic type', async ({ expect }) => {
        const AccessMappingSchema = z.record(
            z.string().pipe(z.enum(['READ_USER', 'UPDATE_USER', 'DELETER_USER'])),
            z.object({
                can: z.boolean(),
            })
        )

        const result = zodToProto({
            syntax: 'proto3',
            packageName: 'services.user.v1',
            services: [
                {
                    name: 'UserService',
                    functions: [
                        {
                            name: 'PostAccesses',
                            in: z.object({
                                accesses: AccessMappingSchema,
                            }),
                            inStream: false,
                        },
                    ],
                },
            ],
        })

        expect(result).toMatchSnapshot('result')
    })
})
