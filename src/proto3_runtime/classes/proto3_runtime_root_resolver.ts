import type { ReadOnlyProto3File } from '#proto3_definition/types/file'
import type { ReadOnlyAnyProto3Message } from '#proto3_definition/types/messages'
import type { ReadOnlyProto3ImportedType } from '#proto3_definition/types/types'
import { Proto3RuntimeAnyMessageResolver } from '#proto3_runtime/classes/proto3_runtime_any_message_resolver'
import { Proto3RuntimeServiceResolver } from '#proto3_runtime/classes/proto3_runtime_service_resolver'
import type { Proto3RuntimeNested } from '#proto3_runtime/types/descriptor'
import * as protobuf from 'protobufjs'

export class Proto3RuntimeRootResolver {
    //// `getDeepMessages` concatenates every branch it walks, so a message reused by two
    //// functions comes back twice and protobufjs rejects the duplicate name
    private getUniqueMessages(
        file: ReadOnlyProto3File
    ): readonly ReadOnlyAnyProto3Message[] {
        return file.getDeepMessages().reduceRight((accumulator, message) => {
            const isAlreadyPresent = accumulator.some(
                (accumulated) => accumulated.id === message.id
            )

            if (isAlreadyPresent) {
                return accumulator
            }

            return [...accumulator, message]
        }, [] as ReadOnlyAnyProto3Message[])
    }

    private getCommonNested(importPath: string): Proto3RuntimeNested {
        const commonFile = protobuf.common.get(importPath)

        if (commonFile?.nested === undefined) {
            throw new Error(
                `Cannot resolve imported type from "${importPath}" at runtime: only the protobufjs well-known types are bundled`
            )
        }

        return commonFile.nested
    }

    private getUniqueImportPaths(
        importedTypes: readonly ReadOnlyProto3ImportedType[]
    ): readonly string[] {
        return [...new Set(importedTypes.map((imported) => imported.importPath))]
    }

    public resolveType(file: ReadOnlyProto3File): protobuf.Root {
        const anyMessageResolver = new Proto3RuntimeAnyMessageResolver()
        const serviceResolver = new Proto3RuntimeServiceResolver()

        const root = new protobuf.Root()
        const namespace = root.define(file.packageName)

        for (const message of this.getUniqueMessages(file)) {
            namespace.add(anyMessageResolver.resolveType(message))
        }

        for (const service of file.services) {
            namespace.add(serviceResolver.resolveType(service))
        }

        for (const importPath of this.getUniqueImportPaths(file.getDeepImportedTypes())) {
            root.addJSON(this.getCommonNested(importPath))
        }

        return root
    }
}
