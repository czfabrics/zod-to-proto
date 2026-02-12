import { fileContentMatter } from '#file/classes/content_matter'
import type { FileContentMatter } from '#file/types/content_matter'
import type { ReadOnlyAnyProto3ExtensionValue } from '#proto3_definition/types/extension'

export class Proto3ExtensionValueProcessor {
    public constructor(private readonly content: FileContentMatter) {}

    public process(extensionValue: ReadOnlyAnyProto3ExtensionValue): void {
        if (extensionValue === undefined) {
            return
        } else if (Array.isArray(extensionValue)) {
            const arrayContents: FileContentMatter[] = []

            for (const arrayValue of extensionValue) {
                const arrayValueContent = fileContentMatter()
                const processor = new Proto3ExtensionValueProcessor(arrayValueContent)

                processor.process(arrayValue)

                if (arrayValueContent.isEmpty()) {
                    continue
                }

                arrayContents.push(arrayValueContent)
            }

            this.content.writeList(...arrayContents)
        } else if (typeof extensionValue === 'object') {
            const recordContentEntries: {
                key: string
                content: FileContentMatter
            }[] = []

            const messageEntries = Object.entries(extensionValue)

            if (messageEntries.length === 0) {
                return
            }

            for (const [key, value] of messageEntries) {
                const valueContent = fileContentMatter()
                const processor = new Proto3ExtensionValueProcessor(valueContent)

                processor.process(value)

                if (valueContent.isEmpty()) {
                    continue
                }

                recordContentEntries.push({
                    key,
                    content: valueContent,
                })
            }

            this.content.writeRecord(...recordContentEntries)
        } else if (typeof extensionValue === 'string') {
            this.content.write(`"${extensionValue}"`)
        } else {
            this.content.write('' + extensionValue)
        }
    }
}
