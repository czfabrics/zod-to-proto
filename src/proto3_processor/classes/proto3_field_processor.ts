import { fileContentMatter } from '#file/classes/content_matter'
import type { FreshFileContentMatter } from '#file/types/content_matter'
import { Proto3Extension } from '#proto3_definition/types/extension'
import type {
    AnyProto3Field,
    Proto3MessageFieldType,
} from '#proto3_definition/types/fields'
import { Proto3ImportedType } from '#proto3_definition/types/imported_type'
import type { Proto3PrimitifType } from '#proto3_definition/types/primitifs'
import { Proto3ExtensionValueProcessor } from '#proto3_processor/classes/proto3_extension_value_processor'
import { match } from 'ts-pattern'

export class Proto3FieldProcessor {
    public constructor(private readonly fileContent: FreshFileContentMatter) {}

    private getScalarTypeReferenceString(primitif: Proto3PrimitifType): string {
        return primitif.name
    }

    private getTypeReferenceString(item: Proto3MessageFieldType): string {
        let finalType = ''
        let currentItem: Proto3MessageFieldType | undefined = item

        while (currentItem) {
            let currentType = match(currentItem)
                .returnType<string>()
                .with(
                    { internalName: 'string' },
                    { internalName: 'bool' },
                    { internalName: 'int32' },
                    { internalName: 'int64' },
                    { internalName: 'uint32' },
                    { internalName: 'uint64' },
                    { internalName: 'sint32' },
                    { internalName: 'sint64' },
                    { internalName: 'fixed32' },
                    { internalName: 'fixed64' },
                    { internalName: 'sfixed32' },
                    { internalName: 'sfixed64' },
                    { internalName: 'float' },
                    { internalName: 'double' },
                    { internalName: 'bytes' },
                    this.getScalarTypeReferenceString
                )
                .with(
                    { internalName: 'message' },
                    { internalName: 'enum' },
                    (message) => message.name
                )
                .with({ internalName: 'repeated' }, () => 'repeated')
                .with({ internalName: 'map' }, (map) => {
                    const keyType: string = this.getScalarTypeReferenceString(map.key)
                    const valueType: string = this.getTypeReferenceString(map.value)

                    return `map<${keyType}, ${valueType}>`
                })
                .with({ internalName: 'imported' }, (imported) => {
                    return imported.typeReference
                })
                .exhaustive()

            if (finalType === '') {
                finalType = currentType
            } else {
                finalType += ` ${currentType}`
            }

            currentItem = match(currentItem)
                .with({ internalName: 'repeated' }, (current) => current.inner)
                .otherwise(() => undefined)
        }

        return finalType
    }

    private getExtensionContent(extension: Proto3Extension): FreshFileContentMatter {
        const extensionContent = fileContentMatter()

        const extensionValueContent = fileContentMatter()
        const processor = new Proto3ExtensionValueProcessor(extensionValueContent)

        processor.process(extension.value)

        extensionContent
            .write(`${extension.key.typeReference} = `)
            .write(extensionValueContent)

        return extensionContent
    }

    private shouldSkipExtensionDependingOnValue(
        extensionValue: Proto3Extension['value']
    ): boolean {
        if (typeof extensionValue === 'object' && !Array.isArray(extensionValue)) {
            const messageEntryLength = Object.keys(extensionValue).length

            if (messageEntryLength === 0) {
                return true
            }
        }

        return false
    }

    private alterateExtensionDependingOnValue(
        extension: Proto3Extension
    ): Proto3Extension {
        if (typeof extension.value !== 'object' || Array.isArray(extension.value)) {
            return extension
        }

        const messageEntries = Object.entries(extension.value)

        if (messageEntries.length < 1 || messageEntries.length > 1) {
            return extension
        }

        const firstKey = messageEntries[0]![0]
        const firstValue = messageEntries[0]![1]

        return Proto3Extension.new({
            ...extension,
            key: Proto3ImportedType.new({
                ...extension.key,
                typeReference: `(${extension.key.typeReference}).${firstKey}`,
            }),
            value: firstValue,
        })
    }

    public process(anyField: AnyProto3Field): void {
        match(anyField)
            .with({ internalName: 'message_field' }, (field) => {
                const extensionContents: FreshFileContentMatter[] = []

                for (const extension of field.extensions) {
                    const shouldSkip = this.shouldSkipExtensionDependingOnValue(
                        extension.value
                    )

                    if (shouldSkip) {
                        continue
                    }

                    const updatedExtension =
                        this.alterateExtensionDependingOnValue(extension)

                    const extensionContent = this.getExtensionContent(updatedExtension)

                    extensionContents.push(extensionContent)
                }

                const typeString = this.getTypeReferenceString(field.type)

                if (field.isOptional) {
                    this.fileContent.write('optional ')
                }

                this.fileContent.write(`${typeString} ${field.key} = ${field.index}`)

                if (extensionContents.length > 0) {
                    this.fileContent.write(' ').writeList(...extensionContents)
                }

                this.fileContent.write(';')
            })
            .with({ internalName: 'message_one_of_field' }, (field) => {
                const oneOfFieldContent = fileContentMatter()

                let isFirst = true

                for (const subField of field.subFields) {
                    if (!isFirst) {
                        oneOfFieldContent.endLine()
                    }

                    const fieldProcessor = new Proto3FieldProcessor(oneOfFieldContent)

                    fieldProcessor.process(subField)

                    isFirst = false
                }

                this.fileContent
                    .write(`oneof ${field.key} `)
                    .writeBlock(oneOfFieldContent)
            })
            .with({ internalName: 'enum_field' }, (field) => {
                this.fileContent.write(`${field.key} = ${field.index};`)
            })
            .exhaustive()
    }
}
