import { fileContentMatter } from '#file/classes/content_matter'
import type {
    AnyFileContentMatter,
    FreshFileContentMatter,
} from '#file/types/content_matter'
import { Proto3File } from '#proto3_definition/types/file'
import { Proto3ImportedType } from '#proto3_definition/types/imported_type'
import { AnyProto3Message } from '#proto3_definition/types/messages'
import { Proto3RpcService } from '#proto3_definition/types/service'
import { Proto3ImportedTypeProcessor } from '#proto3_processor/classes/proto3_imported_type_processor'
import { Proto3MessageProcessor } from '#proto3_processor/classes/proto3_message_processor'
import { Proto3ServiceProcessor } from '#proto3_processor/classes/proto3_service_processor'

export class Proto3Processor {
    private getImportContent(
        importedTypes: Proto3ImportedType[]
    ): FreshFileContentMatter {
        const content = fileContentMatter()
        const processor = new Proto3ImportedTypeProcessor(content)

        let isFirst = true

        for (const imported of importedTypes) {
            if (!isFirst) {
                content.endLine().endLine()
            }

            processor.process(imported)

            isFirst = false
        }

        return content
    }

    private getServiceContent(service: Proto3RpcService): FreshFileContentMatter {
        const content = fileContentMatter()
        const processor = new Proto3ServiceProcessor(content)

        processor.process(service)

        return content
    }

    private getMessageContent(messages: AnyProto3Message[]): FreshFileContentMatter {
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

    public process(file: Proto3File): AnyFileContentMatter {
        const content = fileContentMatter()
        const importedTypes = file.getDeepImportedTypes()
        const importContent = this.getImportContent(importedTypes)
        const serviceContent = this.getServiceContent(file.service)
        const messages = file.getDeepMessages()
        const messageContent = this.getMessageContent(messages)

        content.write(`syntax = "${file.syntax}";`)

        if (!importContent.isEmpty()) {
            content.endLine().endLine().write(importContent)
        }

        content.endLine().endLine().write(`package ${file.packageName};`)

        if (!serviceContent.isEmpty()) {
            content.endLine().endLine().write(serviceContent)
        }

        if (!messageContent.isEmpty()) {
            content.endLine().endLine().write(messageContent)
        }

        return content
    }
}
