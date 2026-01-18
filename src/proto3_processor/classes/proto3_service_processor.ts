import { fileContentMatter } from '#file/classes/content_matter'
import type { FileContentMatter } from '#file/types/content_matter'
import { Proto3Extension } from '#proto3_definition/types/extension'
import { Proto3RpcService } from '#proto3_definition/types/service'
import { Proto3CommentProcessor } from '#proto3_processor/classes/proto3_comment_processor'
import { Proto3FunctionProcessor } from '#proto3_processor/classes/proto3_function_processor'
import { Proto3RecordExtensionProcessor } from '#proto3_processor/classes/proto3_record_extension_processor'

export class Proto3ServiceProcessor {
    public constructor(private readonly content: FileContentMatter) {}

    public getCommentContent(comments: string[]): FileContentMatter {
        const content = fileContentMatter()
        const processor = new Proto3CommentProcessor(content)

        processor.process(comments)

        return content
    }

    private getRecordExtensionContent(extension: Proto3Extension): FileContentMatter {
        const extensionContent = fileContentMatter()
        const extensionProcessor = new Proto3RecordExtensionProcessor(extensionContent)

        extensionProcessor.process(extension)

        return extensionContent
    }

    public process(service: Proto3RpcService): void {
        const commentContent = this.getCommentContent(service.comments)

        const serviceContent = fileContentMatter()

        let isFirst = true

        for (const extension of service.extensions) {
            const updatedExtension = Proto3Extension.simplify(extension)

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

        this.content
            .write(commentContent)
            .write(`service ${service.name} `)
            .writeBlock(serviceContent)
    }
}
