import { fileContentMatter } from '#file/classes/content_matter'
import type { FreshFileContentMatter } from '#file/types/content_matter'
import { Proto3Extension } from '#proto3_definition/types/extension'
import { Proto3RpcService } from '#proto3_definition/types/service'
import { AnyProto3Type } from '#proto3_definition/types/types'
import { Proto3FunctionProcessor } from '#proto3_processor/classes/proto3_function_processor'
import { Proto3RecordExtensionProcessor } from '#proto3_processor/classes/proto3_record_extension_processor'

export class Proto3ServiceProcessor {
    public constructor(private readonly content: FreshFileContentMatter) {}

    private getRecordExtensionContent(
        extension: Proto3Extension
    ): FreshFileContentMatter {
        const extensionContent = fileContentMatter()
        const extensionProcessor = new Proto3RecordExtensionProcessor(extensionContent)

        extensionProcessor.process(extension)

        return extensionContent
    }

    // TODO: can be a transformer...
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
            key: AnyProto3Type.new({
                ...extension.key,
                typeReference: `(${extension.key.typeReference}).${firstKey}`,
            }),
            value: firstValue,
        })
    }

    public process(service: Proto3RpcService): void {
        const serviceContent = fileContentMatter()

        let isFirst = true

        for (const extension of service.extensions) {
            const updatedExtension = this.alterateExtensionDependingOnValue(extension)

            const extensionContent = this.getRecordExtensionContent(updatedExtension)

            if (extensionContent.isEmpty()) {
                continue
            }

            if (!isFirst) {
                serviceContent.endLine()
            }

            serviceContent.write(extensionContent)

            isFirst = false
        }

        for (const rpcFunction of service.functions) {
            if (!isFirst) {
                serviceContent.endLine()
            }

            const functionProcessor = new Proto3FunctionProcessor(serviceContent)

            functionProcessor.process(rpcFunction)

            isFirst = false
        }

        this.content.write(`service ${service.name} `).writeBlock(serviceContent)
    }
}
