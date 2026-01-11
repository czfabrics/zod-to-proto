import { fileContentMatter } from '#file/classes/content_matter'
import type { FreshFileContentMatter } from '#file/types/content_matter'
import { AnyProto3ExtensionValue } from '#proto3_definition/types/extension'

export class Proto3ExtensionValueProcessor {
    public constructor(private readonly content: FreshFileContentMatter) {}

    public process(extensionValue: AnyProto3ExtensionValue): void {
        if (Array.isArray(extensionValue)) {
            const arrayContents: FreshFileContentMatter[] = []

            for (const arrayValue of extensionValue) {
                const arrayValueContent = fileContentMatter()
                const processor = new Proto3ExtensionValueProcessor(arrayValueContent)

                processor.process(arrayValue)

                arrayContents.push(arrayValueContent)
            }

            this.content.writeList(...arrayContents)
        } else if (typeof extensionValue === 'object') {
            const recordContentEntries: {
                key: string
                content: FreshFileContentMatter
            }[] = []

            const messageEntries = Object.entries(extensionValue)

            for (const [key, value] of messageEntries) {
                const valueContent = fileContentMatter()
                const processor = new Proto3ExtensionValueProcessor(valueContent)

                processor.process(value)

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
