import { fileContentMatter } from '#file/classes/content_matter'
import type { FreshFileContentMatter } from '#file/types/content_matter'
import type { AnyProto3Message } from '#proto3_definition/types/messages'
import { Proto3FieldProcessor } from '#proto3_processor/classes/proto3_field_processor'
import { match } from 'ts-pattern'

export class Proto3MessageProcessor {
    public constructor(private readonly content: FreshFileContentMatter) {}

    public process(anyMessage: AnyProto3Message): FreshFileContentMatter {
        return match(anyMessage)
            .with({ internalName: 'message' }, (message) => {
                const messageContent = fileContentMatter().singleNest()

                let isFirst = true

                for (const field of message.fields) {
                    if (!isFirst) {
                        messageContent.endLine()
                    }

                    if (field.internalName === 'message_one_of_field') {
                        const oneOfFieldContent = fileContentMatter().singleNest()

                        const fieldProcessor = new Proto3FieldProcessor(oneOfFieldContent)

                        fieldProcessor.process(field)

                        messageContent
                            .write(`oneof ${field.key} `)
                            .writeBlock(oneOfFieldContent)
                    } else {
                        const fieldProcessor = new Proto3FieldProcessor(messageContent)

                        fieldProcessor.process(field)
                    }

                    isFirst = false
                }

                return this.content
                    .write(`message ${message.name} `)
                    .writeBlock(messageContent)
            })
            .with({ internalName: 'enum' }, (messageEnum) => {
                const enumContent = fileContentMatter().singleNest()

                let isFirst = true

                for (const field of messageEnum.fields) {
                    if (!isFirst) {
                        enumContent.endLine()
                    }

                    const fieldProcessor = new Proto3FieldProcessor(enumContent)

                    fieldProcessor.process(field)

                    isFirst = false
                }

                return this.content
                    .write(`enum ${messageEnum.name} `)
                    .writeBlock(enumContent)
            })
            .exhaustive()
    }
}
