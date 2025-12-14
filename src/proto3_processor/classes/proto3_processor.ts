import { fileContentMatter } from '#file/classes/content_matter'
import type { AnyFileContentMatter } from '#file/types/content_matter'
import type { AnyProto3Message } from '#proto3_definition/types/messages'
import { Proto3MessageProcessor } from '#proto3_processor/classes/proto3_message_processor'

export class Proto3Processor {
    public process(rootMessage: AnyProto3Message): AnyFileContentMatter {
        let content = fileContentMatter()

        const messageProcessor = new Proto3MessageProcessor(content)
        const messages = rootMessage.getDeepMessages()

        let isFirst = true

        for (const message of messages) {
            if (!isFirst) {
                content.endLine().endLine()
            }

            content = messageProcessor.process(message)

            isFirst = false
        }

        return content
    }
}
