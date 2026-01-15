import { fileContentMatter } from '#file/classes/content_matter'
import type { FreshFileContentMatter } from '#file/types/content_matter'
import type { Proto3Extension } from '#proto3_definition/types/extension'
import { Proto3ExtensionValueProcessor } from '#proto3_processor/classes/proto3_extension_value_processor'

export class Proto3RecordExtensionProcessor {
    public constructor(private readonly content: FreshFileContentMatter) {}

    public process(extension: Proto3Extension): void {
        const extensionValueContent = fileContentMatter()
        const processor = new Proto3ExtensionValueProcessor(extensionValueContent)

        processor.process(extension.value)

        if (extensionValueContent.isEmpty()) {
            return
        }

        this.content
            .write(`option ${extension.key.typeReference} = `)
            .write(extensionValueContent)
            .write(';')
    }
}
