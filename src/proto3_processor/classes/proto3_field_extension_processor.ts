import { fileContentMatter } from '#file/classes/content_matter'
import type { FileContentMatter } from '#file/types/content_matter'
import type {
    ReadOnlyProto3Extension,
    Proto3ExtensionMessageValue,
} from '#proto3_definition/types/extension'
import { Proto3ExtensionValueProcessor } from '#proto3_processor/classes/proto3_extension_value_processor'

export class Proto3FieldExtensionProcessor {
    public constructor(private readonly content: FileContentMatter) {}

    public isObjectWithExactlyOneEntry(
        extension: Proto3Extension
    ): extension is Proto3Extension & { value: Proto3ExtensionMessageValue } {
        if (typeof extension.value !== 'object' || Array.isArray(extension.value)) {
            return false
        }

        const messageEntries = Object.entries(extension.value)

        if (messageEntries.length < 1 || messageEntries.length > 1) {
            return false
        }

        return true
    }

    public process(extension: ReadOnlyProto3Extension): void {
        const extensionValueContent = fileContentMatter()
        const processor = new Proto3ExtensionValueProcessor(extensionValueContent)

        if (this.isObjectWithExactlyOneEntry(extension)) {
            const messageEntries = Object.entries(extension.value)
            const firstKey = messageEntries[0]![0]
            const firstValue = messageEntries[0]![1]

            processor.process(firstValue)

            if (extensionValueContent.isEmpty()) {
                return
            }

            this.content
                .write(`(${extension.key.typeReference}).${firstKey} = `)
                .write(extensionValueContent)

            return
        }

        processor.process(extension.value)

        if (extensionValueContent.isEmpty()) {
            return
        }

        this.content
            .write(`(${extension.key.typeReference}) = `)
            .write(extensionValueContent)
    }
}
