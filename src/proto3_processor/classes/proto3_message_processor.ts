import { fileContentMatter } from '#file/classes/content_matter'
import type { FreshFileContentMatter } from '#file/types/content_matter'
import { Proto3Extension } from '#proto3_definition/types/extension'
import type { AnyProto3Message } from '#proto3_definition/types/messages'
import { AnyProto3Type } from '#proto3_definition/types/types'
import { Proto3FieldProcessor } from '#proto3_processor/classes/proto3_field_processor'
import { Proto3RecordExtensionProcessor } from '#proto3_processor/classes/proto3_record_extension_processor'
import { match } from 'ts-pattern'

export class Proto3MessageProcessor {
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

    public process(anyMessage: AnyProto3Message): void {
        match(anyMessage)
            .with({ internalName: 'message' }, (message) => {
                const messageContent = fileContentMatter()

                let isFirst = true

                for (const extension of message.extensions) {
                    const updatedExtension =
                        this.alterateExtensionDependingOnValue(extension)

                    const extensionContent =
                        this.getRecordExtensionContent(updatedExtension)

                    if (extensionContent.isEmpty()) {
                        continue
                    }

                    if (!isFirst) {
                        messageContent.endLine()
                    }

                    messageContent.write(extensionContent)

                    isFirst = false
                }

                for (const field of message.fields) {
                    if (!isFirst) {
                        messageContent.endLine()
                    }

                    const fieldProcessor = new Proto3FieldProcessor(messageContent)

                    fieldProcessor.process(field)

                    isFirst = false
                }

                this.content.write(`message ${message.name} `).writeBlock(messageContent)
            })
            .with({ internalName: 'enum' }, (messageEnum) => {
                const enumContent = fileContentMatter()

                let isFirst = true

                for (const extension of messageEnum.extensions) {
                    const updatedExtension =
                        this.alterateExtensionDependingOnValue(extension)

                    const extensionContent =
                        this.getRecordExtensionContent(updatedExtension)

                    if (extensionContent.isEmpty()) {
                        continue
                    }

                    if (!isFirst) {
                        enumContent.endLine()
                    }

                    enumContent.write(extensionContent)

                    isFirst = false
                }

                for (const field of messageEnum.fields) {
                    if (!isFirst) {
                        enumContent.endLine()
                    }

                    const fieldProcessor = new Proto3FieldProcessor(enumContent)

                    fieldProcessor.process(field)

                    isFirst = false
                }

                this.content.write(`enum ${messageEnum.name} `).writeBlock(enumContent)
            })
            .exhaustive()
    }
}
