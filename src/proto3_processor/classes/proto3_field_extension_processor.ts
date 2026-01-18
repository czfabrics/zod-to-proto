import { fileContentMatter } from '#file/classes/content_matter'
import type { FileContentMatter } from '#file/types/content_matter'
import type { Proto3Extension } from '#proto3_definition/types/extension'
import { Proto3ExtensionValueProcessor } from '#proto3_processor/classes/proto3_extension_value_processor'

export class Proto3FieldExtensionProcessor {
    public constructor(private readonly content: FileContentMatter) {}

    public process(extension: Proto3Extension): void {
        const extensionValueContent = fileContentMatter()
        const processor = new Proto3ExtensionValueProcessor(extensionValueContent)

        processor.process(extension.value)

        if (extensionValueContent.isEmpty()) {
            return
        }

        this.content
            .write(`${extension.key.typeReference} = `)
            .write(extensionValueContent)
    }
}
