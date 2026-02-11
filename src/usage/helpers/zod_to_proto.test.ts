import { Proto3Deprecated } from '#plugin/types/global'
import { Proto3HttpAnnotation } from '#plugin/types/google_api_annotations'
import { zodToProto } from '#usage/helpers/zod_to_proto'
import { describe, test } from 'vitest'
import z from 'zod'

const User = z.object({
    id: z.int64(),
    fullName: z.string().optional(),
    role: z.enum(['ADMIN', 'VIEWER']),
})

describe('`zodToProto` test suite', () => {
    test('Testing basic usage (unscoped message)', async ({ expect }) => {
        const result = zodToProto({
            syntax: 'proto3',
            packageName: 'services.authentification.v1',
            services: [],
            unscopedMessages: {
                user: User,
            },
        })

        expect(result).toMatchSnapshot('result')
    })

    test('Testing gRPC Service usage', async ({ expect }) => {
        const result = zodToProto({
            syntax: 'proto3',
            packageName: 'services.authentification.v1',
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
        const result = zodToProto({
            syntax: 'proto3',
            packageName: 'services.authentification.v1',
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
        const result = zodToProto({
            syntax: 'proto3',
            packageName: 'services.authentification.v1',
            typePrefix: 'AuthentificationPackage', // First level prefix
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
                                users: z.array(User),
                            }),
                        },
                    ],
                },
            ],
        })

        expect(result).toMatchSnapshot('result')
    })

    test('Testing extension usage', async ({ expect }) => {
        const result = zodToProto({
            syntax: 'proto3',
            packageName: 'services.authentification.v1',
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
})
