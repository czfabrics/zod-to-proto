import { fileContentMatter } from '#file/classes/content_matter'
import type { FreshFileContentMatter } from '#file/types/content_matter'
import { Proto3Extension } from '#proto3_definition/types/extension'
import { Proto3RpcFunction } from '#proto3_definition/types/functions'
import { AnyProto3Message } from '#proto3_definition/types/messages'
import { Proto3ImportedType } from '#proto3_definition/types/types'
import { Proto3RecordExtensionProcessor } from '#proto3_processor/classes/proto3_record_extension_processor'
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

    public process(rpcFunction: Proto3RpcFunction): void {
        const inTypeReference = this.getTypeReferenceString(rpcFunction.in)
        const outTypeReference = this.getTypeReferenceString(rpcFunction.out)

        const extensionBlockContent = fileContentMatter()

        let isFirstExtension = true

        for (const extension of rpcFunction.extensions) {
            const extensionContent = fileContentMatter()
            const extensionProcessor = new Proto3RecordExtensionProcessor(
                extensionContent
            )

            const updatedExtension = Proto3Extension.simplify(extension)

            extensionProcessor.process(updatedExtension)

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
            .write(`rpc ${rpcFunction.name}(`)
            .writeIf(rpcFunction.inStream, 'stream ')
            .write(`${inTypeReference}) returns (`)
            .writeIf(rpcFunction.outStream, 'stream ')
            .write(`${outTypeReference}) `)
            .writeBlock(extensionBlockContent)
    }
}
