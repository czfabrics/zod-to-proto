import { fileContentMatter } from '#file/classes/content_matter'
import type { FreshFileContentMatter } from '#file/types/content_matter'
import { Proto3Extension } from '#proto3_definition/types/extension'
import type {
    AnyProto3Field,
    Proto3MessageFieldType,
} from '#proto3_definition/types/fields'
import type { Proto3PrimitifType } from '#proto3_definition/types/primitifs'
import { AnyProto3Type } from '#proto3_definition/types/types'
import { Proto3FieldExtensionProcessor } from '#proto3_processor/classes/proto3_field_extension_processor'
import { Proto3RecordExtensionProcessor } from '#proto3_processor/classes/proto3_record_extension_processor'
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
                .with({ internalName: 'imported_type' }, (imported) => {
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

    private getFieldExtensionContent(extension: Proto3Extension): FreshFileContentMatter {
        const extensionContent = fileContentMatter()
        const extensionProcessor = new Proto3FieldExtensionProcessor(extensionContent)

        extensionProcessor.process(extension)

        return extensionContent
    }

    private getRecordExtensionContent(
        extension: Proto3Extension
    ): FreshFileContentMatter {
        const extensionContent = fileContentMatter()
        const extensionProcessor = new Proto3RecordExtensionProcessor(extensionContent)

        extensionProcessor.process(extension)

        return extensionContent
    }

    // TODO: can be a transformer...
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
            key: AnyProto3Type.new({
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
                    const updatedExtension =
                        this.alterateExtensionDependingOnValue(extension)

                    const extensionContent =
                        this.getFieldExtensionContent(updatedExtension)

                    if (extensionContent.isEmpty()) {
                        continue
                    }

                    extensionContents.push(extensionContent)
                }

                const typeString = this.getTypeReferenceString(field.type)

                if (field.optionalState === 'PRESENT') {
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

                for (const extension of field.extensions) {
                    const updatedExtension =
                        this.alterateExtensionDependingOnValue(extension)

                    const extensionContent =
                        this.getRecordExtensionContent(updatedExtension)

                    if (extensionContent.isEmpty()) {
                        continue
                    }

                    if (!isFirst) {
                        oneOfFieldContent.endLine()
                    }

                    oneOfFieldContent.write(extensionContent)

                    isFirst = false
                }

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
