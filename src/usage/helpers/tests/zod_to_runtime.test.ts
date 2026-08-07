import { ZodRequiredFieldConversionTransformer } from '#plugin/classes/zod_conversion_transformers/required_field'
import { MessageIn } from '#usage/types/messages'
import { getFullTransformers } from '#usage/helpers/get_full_transformers'
import { zodToProto } from '#usage/helpers/zod_to_proto'
import { zodToRuntime } from '#usage/helpers/zod_to_runtime'
import { pz } from '#zod/helpers/zod_one_of_union'
import type { Proto3RawFile } from '#usage/types/file'
import type { ZodConversionTransformers } from '#zod_converter/types/transformers'
import { describe, test } from 'vitest'
import z from 'zod'

const SERVICE_FULL_NAME = 'services.synchronization.v1.SynchronizationService'

const TargetSchema = z.object({
    externalId: z.string().nonempty(),
})

const TaskSchema = pz.oneOfUnion([
    ['synchronizeUsers', TargetSchema],
    ['createWorkspace', TargetSchema],
])

const PostAsyncTasksInputSchema = z.object({
    fullName: z.string(),
    retryCount: z.int(),
    role: z.enum(['ADMIN', 'VIEWER']),
    tags: z.array(z.string()),
    task: TaskSchema,
})

const getRawFile = function (): Proto3RawFile {
    return {
        syntax: 'proto3',
        packageName: 'services.synchronization.v1',
        services: [
            {
                name: 'SynchronizationService',
                functions: [
                    {
                        name: 'PostAsyncTasks',
                        in: MessageIn.new(PostAsyncTasksInputSchema),
                    },
                ],
            },
        ],
    }
}

//// the required annotation imports `buf/validate/validate.proto`, which protobufjs does
//// not bundle, so a field carrying it cannot be resolved at runtime
const getRuntimeTransformers = function (): ZodConversionTransformers {
    const transformers = getFullTransformers()

    return {
        ...transformers,
        messageField: transformers.messageField.filter(
            (transformer) => transformer !== ZodRequiredFieldConversionTransformer
        ),
    }
}

const getMethod = function () {
    const result = zodToRuntime(getRawFile(), {
        transformers: getRuntimeTransformers(),
    })

    return result.services[SERVICE_FULL_NAME]?.['PostAsyncTasks']
}

describe('`zodToRuntime` test suite', () => {
    test('Testing a round trip that the source Zod schema still accepts', async ({
        expect,
    }) => {
        const method = getMethod()

        const value = {
            fullName: 'Ada',
            retryCount: 3,
            role: 'VIEWER',
            tags: ['a', 'b'],
            task: { $case: 'synchronizeUsers', value: { externalId: 'w-1' } },
        }

        const bytes = method?.requestSerialize(value)
        const decoded = method?.requestDeserialize(bytes as Buffer)

        expect(decoded).toStrictEqual(value)
        expect(PostAsyncTasksInputSchema.safeParse(decoded).success).toBe(true)
    })

    test('Testing that the proto text is snake cased while the runtime is camel cased', async ({
        expect,
    }) => {
        const proto = zodToProto(getRawFile())
        const method = getMethod()

        const decoded = method?.requestDeserialize(
            method.requestSerialize({
                fullName: 'Ada',
                retryCount: 0,
                role: 'ADMIN',
                tags: [],
                task: { $case: 'createWorkspace', value: { externalId: 'w-2' } },
            })
        ) as Record<string, unknown>

        expect(proto).toContain('full_name')
        expect(Object.keys(decoded)).toContain('fullName')
    })

    test('Testing that a `z.int()` field round trips as a number', async ({ expect }) => {
        const method = getMethod()

        const decoded = method?.requestDeserialize(
            method.requestSerialize({
                fullName: 'Ada',
                retryCount: 7,
                role: 'ADMIN',
                tags: [],
                task: { $case: 'synchronizeUsers', value: { externalId: 'w-3' } },
            })
        ) as { retryCount: unknown }

        expect(typeof decoded.retryCount).toBe('number')
    })
})
