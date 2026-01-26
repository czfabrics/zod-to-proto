import { fileContentMatter } from '#file/classes/content_matter'
import type { FileContentMatter } from '#file/types/content_matter'
import { Proto3Extension } from '#proto3_definition/types/extension'
import { Proto3File } from '#proto3_definition/types/file'
import { AnyProto3Message } from '#proto3_definition/types/messages'
import { Proto3RpcService } from '#proto3_definition/types/service'
import { Proto3ImportedType } from '#proto3_definition/types/types'
import { Proto3ImportProcessor } from '#proto3_processor/classes/proto3_import_processor'
import { Proto3MessageProcessor } from '#proto3_processor/classes/proto3_message_processor'
import { Proto3RecordExtensionProcessor } from '#proto3_processor/classes/proto3_record_extension_processor'
import { Proto3ServiceProcessor } from '#proto3_processor/classes/proto3_service_processor'

export class Proto3FileProcessor {
    private getImportContent(importedTypes: Proto3ImportedType[]): FileContentMatter {
        const content = fileContentMatter()
        const processor = new Proto3ImportProcessor(content)

        processor.process(importedTypes)

        return content
    }

    private getRecordExtensionContent(extension: Proto3Extension): FileContentMatter {
        const extensionContent = fileContentMatter()
        const extensionProcessor = new Proto3RecordExtensionProcessor(extensionContent)

        extensionProcessor.process(extension)

        return extensionContent
    }

    private getExtensionContents(extensions: Proto3Extension[]): FileContentMatter[] {
        const contents: FileContentMatter[] = []

        for (const extension of extensions) {
            const updatedExtension = Proto3Extension.simplify(extension)

            const content = this.getRecordExtensionContent(updatedExtension)

            if (content.isEmpty()) {
                continue
            }

            contents.push(content)
        }

        return contents
    }

    private getServiceContent(service: Proto3RpcService): FileContentMatter {
        const content = fileContentMatter()
        const processor = new Proto3ServiceProcessor(content)

        processor.process(service)

        return content
    }

    private getMessageContent(messages: AnyProto3Message[]): FileContentMatter {
        const content = fileContentMatter()
        const processor = new Proto3MessageProcessor(content)

        let isFirst = true

        for (const message of messages) {
            if (!isFirst) {
                content.endLine().endLine()
            }

            processor.process(message)

            isFirst = false
        }

        return content
    }

    public process(file: Proto3File): FileContentMatter {
        file.applyTypePrefix()

        const content = fileContentMatter()
        const importedTypes = file.getDeepImportedTypes()
        const importContent = this.getImportContent(importedTypes)
        const extensionContents = this.getExtensionContents(file.extensions)
        const serviceContent = file.service
            ? this.getServiceContent(file.service)
            : fileContentMatter()
        const messages = file.getDeepMessages()
        const messageContent = this.getMessageContent(messages)

        content.write(`syntax = "${file.syntax}";`)

        if (!importContent.isEmpty()) {
            content.endLine().endLine().write(importContent)
        }

        content.endLine().endLine().write(`package ${file.packageName};`)

        if (extensionContents.length > 0) {
            content.endLine().endLine()

            let isFirst = true

            for (const extensionContent of extensionContents) {
                if (!isFirst) {
                    extensionContent.endLine()
                }

                content.write(extensionContent)

                isFirst = false
            }
        }

        if (!serviceContent.isEmpty()) {
            content.endLine().endLine().write(serviceContent)
        }

        if (!messageContent.isEmpty()) {
            content.endLine().endLine().write(messageContent)
        }

        return content
    }
}
