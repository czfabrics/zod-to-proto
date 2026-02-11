import { fileContentMatter } from '#file/classes/content_matter'
import type { FileContentMatter } from '#file/types/content_matter'
import type { ReadOnlyProto3Extension } from '#proto3_definition/types/extension'
import type { ReadOnlyAnyProto3Message } from '#proto3_definition/types/messages'
import { Proto3CommentProcessor } from '#proto3_processor/classes/proto3_comment_processor'
import { Proto3FieldProcessor } from '#proto3_processor/classes/proto3_field_processor'
import { Proto3RecordExtensionProcessor } from '#proto3_processor/classes/proto3_record_extension_processor'
import { match } from 'ts-pattern'

export class Proto3MessageProcessor {
    public constructor(private readonly content: FileContentMatter) {}

    public getCommentContent(comments: readonly string[]): FileContentMatter {
        const content = fileContentMatter()
        const processor = new Proto3CommentProcessor(content)

        processor.process(comments)

        return content
    }

    private getRecordExtensionContent(
        extension: ReadOnlyProto3Extension
    ): FileContentMatter {
        const extensionContent = fileContentMatter()
        const extensionProcessor = new Proto3RecordExtensionProcessor(extensionContent)

        extensionProcessor.process(extension)

        return extensionContent
    }

    public process(anyMessage: ReadOnlyAnyProto3Message): void {
        const commentContent = this.getCommentContent(anyMessage.comments)

        this.content.write(commentContent)

        match(anyMessage)
            .with({ internalName: 'message' }, (message) => {
                const messageContent = fileContentMatter()

                let isFirst = true

                for (const extension of message.extensions) {
                    const extensionContent = this.getRecordExtensionContent(extension)

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
                    const extensionContent = this.getRecordExtensionContent(extension)

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
