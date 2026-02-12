import type { DeepReadOnly } from '#core/types/deep_read_only'
import { fileContentMatter } from '#file/classes/content_matter'
import type { FileContentMatter } from '#file/types/content_matter'
import type { ReadOnlyProto3RpcFunction } from '#proto3_definition/types/functions'
import type { AnyProto3Message } from '#proto3_definition/types/messages'
import type { Proto3ImportedType } from '#proto3_definition/types/types'
import { Proto3CommentProcessor } from '#proto3_processor/classes/proto3_comment_processor'
import { Proto3RecordExtensionProcessor } from '#proto3_processor/classes/proto3_record_extension_processor'
import { match } from 'ts-pattern'

export class Proto3FunctionProcessor {
    public constructor(private readonly content: FileContentMatter) {}

    public getCommentContent(comments: readonly string[]): FileContentMatter {
        const content = fileContentMatter()
        const processor = new Proto3CommentProcessor(content)

        processor.process(comments)

        return content
    }

    private getTypeReferenceString(
        item: DeepReadOnly<AnyProto3Message | Proto3ImportedType>
    ): string {
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

    public process(rpcFunction: ReadOnlyProto3RpcFunction): void {
        const commentContent = this.getCommentContent(rpcFunction.comments)

        const inTypeReference = this.getTypeReferenceString(rpcFunction.in)
        const outTypeReference = this.getTypeReferenceString(rpcFunction.out)

        const extensionBlockContent = fileContentMatter()

        let isFirstExtension = true

        for (const extension of rpcFunction.extensions) {
            const extensionContent = fileContentMatter()
            const extensionProcessor = new Proto3RecordExtensionProcessor(
                extensionContent
            )

            extensionProcessor.process(extension)

            if (extensionContent.isEmpty()) {
                continue
            }

            if (!isFirstExtension) {
                extensionBlockContent.endLine()
            }

            extensionBlockContent.write(extensionContent)

            isFirstExtension = false
        }

        this.content
            .write(commentContent)
            .write(`rpc ${rpcFunction.name}(`)
            .writeIf(rpcFunction.inStream, 'stream ')
            .write(`${inTypeReference}) returns (`)
            .writeIf(rpcFunction.outStream, 'stream ')
            .write(`${outTypeReference}) `)
            .writeBlock(extensionBlockContent)
    }
}
