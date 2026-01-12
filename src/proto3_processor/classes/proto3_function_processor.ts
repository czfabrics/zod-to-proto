import { fileContentMatter } from '#file/classes/content_matter'
import type {
    FreshFileContentMatter,
    NestedFileContentMatter,
} from '#file/types/content_matter'
import { Proto3Extension } from '#proto3_definition/types/extension'
import { Proto3RpcFunction } from '#proto3_definition/types/functions'
import { AnyProto3Message } from '#proto3_definition/types/messages'
import { Proto3ImportedType } from '#proto3_definition/types/types'
import { Proto3ExtensionValueProcessor } from '#proto3_processor/classes/proto3_extension_value_processor'
import { match } from 'ts-pattern'

export class Proto3FunctionProcessor {
    public constructor(private readonly content: FreshFileContentMatter) {}

    private getTypeReferenceString(item: AnyProto3Message | Proto3ImportedType): string {
        return match(item)
            .returnType<string>()
            .with(
                { internalName: 'enum' },
                { internalName: 'message' },
                (message) => message.name
            )
            .with({ internalName: 'imported_type' }, (imported) => imported.typeReference)
            .exhaustive()
    }

    private writeExtension(
        extensionContent: NestedFileContentMatter,
        extension: Proto3Extension
    ): void {
        const extensionValueContent = fileContentMatter()
        const processor = new Proto3ExtensionValueProcessor(extensionValueContent)

        processor.process(extension.value)

        extensionContent
            .write(`option (${extension.key.typeReference}) = `)
            .write(extensionValueContent)
            .write(';')
    }

    private shouldSkipExtensionDependingOnValue(
        extensionValue: Proto3Extension['value']
    ): boolean {
        if (typeof extensionValue === 'object' && !Array.isArray(extensionValue)) {
            const messageEntryLength = Object.keys(extensionValue).length

            if (messageEntryLength === 0) {
                return true
            }
        }

        return false
    }

    private alterateExtensionDependingOnValue(
        extension: Proto3Extension
    ): Proto3Extension {
        if (typeof extension.value !== 'object' || Array.isArray(extension.value)) {
            return extension
        }

        const messageEntries = Object.entries(extension.value)

        if (messageEntries.length < 1 || messageEntries.length > 1) {
            return extension
        }

        const firstKey = messageEntries[0]![0]
        const firstValue = messageEntries[0]![1]

        return Proto3Extension.new({
            ...extension,
            key: Proto3ImportedType.new({
                ...extension.key,
                typeReference: `(${extension.key.typeReference}).${firstKey}`,
            }),
            value: firstValue,
        })
    }

    public process(rpcFunction: Proto3RpcFunction): void {
        const inTypeReference = this.getTypeReferenceString(rpcFunction.in)
        const outTypeReference = this.getTypeReferenceString(rpcFunction.out)

        const extensionContent = fileContentMatter().singleNest()

        let isFirstExtension = true

        for (const extension of rpcFunction.extensions) {
            if (!isFirstExtension) {
                extensionContent.endLine()
            }

            const shouldSkip = this.shouldSkipExtensionDependingOnValue(extension.value)

            if (shouldSkip) {
                continue
            }

            const updatedExtension = this.alterateExtensionDependingOnValue(extension)

            this.writeExtension(extensionContent, updatedExtension)

            isFirstExtension = false
        }

        this.content
            .write(`rpc ${rpcFunction.name}(`)
            .writeIf(rpcFunction.inStream, 'stream ')
            .write(`${inTypeReference}) returns (`)
            .writeIf(rpcFunction.outStream, 'stream ')
            .write(`${outTypeReference}) `)
            .writeBlock(extensionContent)
    }
}
