import { writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { ZodRequiredFieldConversionTransformer } from '#plugin/classes/zod_conversion_transformers/required_field'
import { getFullTransformers } from '#usage/helpers/get_full_transformers'
import { zodToRuntime } from '#usage/helpers/zod_to_runtime'
import { MessageIn } from '#usage/types/messages'
import type { Proto3RawFile } from '#usage/types/file'
import { pz } from '#zod/helpers/zod_one_of_union'
import type { ZodConversionTransformers } from '#zod_converter/types/transformers'
import { pascalCase } from 'change-case'
import type * as protobuf from 'protobufjs'
import * as descriptor from 'protobufjs/ext/descriptor'
import z from 'zod'

type DescriptorField = {
    name: string
    typeName?: string
}

type DescriptorMessage = {
    name: string
    field: DescriptorField[]
    nestedType?: DescriptorMessage[]
    options?: { mapEntry?: boolean }
}

type DescriptorMethod = {
    inputType: string
    outputType: string
}

type DescriptorFile = {
    name: string
    package: string
    dependency?: string[]
    messageType?: DescriptorMessage[]
    enumType?: { name: string }[]
    service?: { method: DescriptorMethod[] }[]
}

type DescriptorSet = {
    file: DescriptorFile[]
}

const TargetSchema = z.object({
    externalId: z.string().nonempty(),
})

const PostAsyncTasksInputSchema = z.object({
    fullName: z.string(),
    retryCount: z.int(),
    role: z.enum(['ADMIN', 'VIEWER']),
    tags: z.array(z.string()),
    scores: z.record(z.string(), z.int()),
    task: pz.oneOfUnion([
        ['synchronizeUsers', TargetSchema],
        ['createWorkspace', TargetSchema],
    ]),
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

const getDeclaredTypeNames = function (
    message: DescriptorMessage,
    scope: string
): string[] {
    const fullName = `${scope}.${message.name}`

    return [
        fullName,
        ...(message.nestedType ?? []).flatMap((nested) =>
            getDeclaredTypeNames(nested, fullName)
        ),
    ]
}

const getReferencedTypeNames = function (file: DescriptorFile): string[] {
    const fromMessage = function (message: DescriptorMessage): string[] {
        return [
            ...message.field.map((field) => field.typeName),
            ...(message.nestedType ?? []).flatMap(fromMessage),
        ].filter((typeName): typeName is string => typeName !== undefined)
    }

    return [
        ...(file.messageType ?? []).flatMap(fromMessage),
        ...(file.service ?? []).flatMap((service) =>
            service.method.flatMap((method) => [method.inputType, method.outputType])
        ),
    ]
}

//// protobufjs never fills `dependency`, so protoc reports every cross-file reference as
//// a missing import. Only an absolute reference can leave its own file, a relative one
//// resolves through the enclosing scopes
const addDependencies = function (set: DescriptorSet): void {
    const owners = new Map<string, string>()

    for (const file of set.file) {
        const declared = [
            ...(file.messageType ?? []).flatMap((message) =>
                getDeclaredTypeNames(message, `.${file.package}`)
            ),
            ...(file.enumType ?? []).map((item) => `.${file.package}.${item.name}`),
        ]

        for (const typeName of declared) {
            owners.set(typeName, file.name)
        }
    }

    for (const file of set.file) {
        const dependency = getReferencedTypeNames(file)
            .filter((typeName) => typeName.startsWith('.'))
            .map((typeName) => owners.get(typeName))
            .filter(
                (owner): owner is string => owner !== undefined && owner !== file.name
            )

        file.dependency = [...new Set(dependency)]
    }
}

//// protoc only takes a nested type for a synthesized map entry when it is named
//// `<PascalFieldName>Entry`, and rejects `map_entry` as explicitly set otherwise
const renameMapEntries = function (message: DescriptorMessage, scope: string): void {
    const fullName = `${scope}.${message.name}`

    for (const nested of message.nestedType ?? []) {
        if (nested.options?.mapEntry === true) {
            const field = message.field.find(
                (candidate) =>
                    candidate.typeName === nested.name ||
                    candidate.typeName === `${fullName}.${nested.name}`
            )

            if (field !== undefined) {
                const entryName = `${pascalCase(field.name)}Entry`

                nested.name = entryName
                field.typeName = `.${fullName}.${entryName}`
            }
        }

        renameMapEntries(nested, fullName)
    }
}

const getProtosetBytes = function (raw: Proto3RawFile): Uint8Array {
    const { root } = zodToRuntime(raw, { transformers: getRuntimeTransformers() })

    const withDescriptor = root as unknown as {
        toDescriptor(edition: string): protobuf.Message
    }
    const set = withDescriptor.toDescriptor('proto3')

    addDependencies(set as unknown as DescriptorSet)

    for (const file of (set as unknown as DescriptorSet).file) {
        for (const message of file.messageType ?? []) {
            renameMapEntries(message, file.package)
        }
    }

    return descriptor.FileDescriptorSet.encode(set).finish()
}

const outputPath = process.argv[2] ?? join(tmpdir(), 'service.protoset.bin')
const bytes = getProtosetBytes(getRawFile())

writeFileSync(outputPath, bytes)

const set = descriptor.FileDescriptorSet.decode(bytes).toJSON() as DescriptorSet

console.log(`${outputPath} (${bytes.length} bytes)`)

for (const file of set.file) {
    const messages = (file.messageType ?? []).map((message) => message.name)
    const dependency = file.dependency ?? []

    console.log(
        `${file.name} package=${file.package} dependency=[${dependency.join(', ')}] messages=[${messages.join(', ')}]`
    )
}
