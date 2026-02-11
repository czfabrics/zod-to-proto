import { fileContentMatter } from '#file/classes/content_matter'
import type { FileContentMatter } from '#file/types/content_matter'
import {
    Proto3Extension,
    ReadOnlyProto3Extension,
} from '#proto3_definition/types/extension'
import type {
    Proto3MessageFieldType,
    ReadOnlyAnyProto3Field,
} from '#proto3_definition/types/fields'
import type { Proto3ScalarType } from '#proto3_definition/types/scalars'
import { Proto3CommentProcessor } from '#proto3_processor/classes/proto3_comment_processor'
import { Proto3FieldExtensionProcessor } from '#proto3_processor/classes/proto3_field_extension_processor'
import { Proto3RecordExtensionProcessor } from '#proto3_processor/classes/proto3_record_extension_processor'
import { match } from 'ts-pattern'

export class Proto3FieldProcessor {
    public constructor(private readonly fileContent: FileContentMatter) {}

    public getCommentContent(comments: readonly string[]): FileContentMatter {
        const content = fileContentMatter()
        const processor = new Proto3CommentProcessor(content)

        processor.process(comments)

        return content
    }

    private getScalarTypeReferenceString(scalarType: Proto3ScalarType): string {
        return scalarType.name
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

    private getFieldExtensionContent(
        extension: ReadOnlyProto3Extension
    ): FileContentMatter {
        const extensionContent = fileContentMatter()
        const extensionProcessor = new Proto3FieldExtensionProcessor(extensionContent)

        extensionProcessor.process(extension)

        return extensionContent
    }

    private getRecordExtensionContent(
        extension: ReadOnlyProto3Extension
    ): FileContentMatter {
        const extensionContent = fileContentMatter()
        const extensionProcessor = new Proto3RecordExtensionProcessor(extensionContent)

        extensionProcessor.process(extension)

        return extensionContent
    }

    public process(anyField: ReadOnlyAnyProto3Field): void {
        const commentContent = this.getCommentContent(anyField.comments)

        this.fileContent.write(commentContent)

        match(anyField)
            .with({ internalName: 'message_field' }, (field) => {
                const extensionContents: FileContentMatter[] = []

                for (const extension of field.extensions) {
                    const extensionContent = this.getFieldExtensionContent(extension)

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
                    const extensionContent = this.getRecordExtensionContent(extension)

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
                const extensionContents: FileContentMatter[] = []

                for (const extension of field.extensions) {
                    const extensionContent = this.getFieldExtensionContent(extension)

                    if (extensionContent.isEmpty()) {
                        continue
                    }

                    extensionContents.push(extensionContent)
                }

                this.fileContent.write(`${field.key} = ${field.index}`)

                if (extensionContents.length > 0) {
                    this.fileContent.write(' ').writeList(...extensionContents)
                }

                this.fileContent.write(';')
            })
            .exhaustive()
    }
}
