import type { NestedFileContentMatter } from '#file/types/content_matter'
import type {
    AnyProto3Field,
    Proto3MessageFieldType,
} from '#proto3_definition/types/fields'
import type { Proto3PrimitifType } from '#proto3_definition/types/primitifs'
import { match } from 'ts-pattern'

export class Proto3FieldProcessor {
    public constructor(private readonly fileContent: NestedFileContentMatter) {}

    private getScalarTypeString(primitif: Proto3PrimitifType): string {
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
                    this.getScalarTypeString
                )
                .with(
                    { internalName: 'message' },
                    { internalName: 'enum' },
                    (message) => message.name
                )
                .with({ internalName: 'repeated' }, () => 'repeated')
                .with({ internalName: 'map' }, (map) => {
                    const keyType: string = this.getScalarTypeString(map.key)
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

    public process(anyField: AnyProto3Field): void {
        match(anyField)
            .with({ internalName: 'message_field' }, (field) => {
                // TODO: run extension => puis remplacer EXTs
                // message LogInInput {
                //     map<string, double> test444 = 1 [(buf.validate.field).required = true];
                // }
                // field.extensions

                const typeString = this.getTypeReferenceString(field.type)

                this.fileContent.write(
                    `${typeString} ${field.key} = ${field.index} EXTs;`
                )
            })
            .with({ internalName: 'message_one_of_field' }, (field) => {
                let isFirst = true

                for (const subField of field.subFields) {
                    if (!isFirst) {
                        this.fileContent.endLine()
                    }

                    const fieldProcessor = new Proto3FieldProcessor(this.fileContent)

                    fieldProcessor.process(subField)

                    isFirst = false
                }
            })
            .with({ internalName: 'enum_field' }, (field) => {
                this.fileContent.write(`${field.key} = ${field.index};`)
            })
            .exhaustive()
    }
}
