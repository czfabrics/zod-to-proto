import { fileContentMatter } from '#file/classes/content_matter'
import type { FreshFileContentMatter } from '#file/types/content_matter'
import { Proto3RpcService } from '#proto3_definition/types/service'
import { Proto3FunctionProcessor } from '#proto3_processor/classes/proto3_function_processor'

export class Proto3ServiceProcessor {
    public constructor(private readonly content: FreshFileContentMatter) {}

    public process(service: Proto3RpcService): FreshFileContentMatter {
        const serviceContent = fileContentMatter()

        let isFirst = true

        for (const rpcFunction of service.functions) {
            if (!isFirst) {
                serviceContent.endLine()
            }

            const functionProcessor = new Proto3FunctionProcessor(serviceContent)

            functionProcessor.process(rpcFunction)

            isFirst = false
        }

        return this.content.write(`service ${service.name} `).writeBlock(serviceContent)
    }
}
