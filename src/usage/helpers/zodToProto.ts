import { FileBuilder } from '#file/classes/file_builder'
import { getFullTransformers } from '#plugin/helpers/get_full_transformers'
import { Proto3Empty } from '#plugin/types/google_protobuf'
import { Proto3FileProcessor } from '#proto3_processor/classes/proto3_file_processor'
import { Proto3RawFile } from '#usage/types/file'
import type { UsageSettings } from '#usage/types/settings'
import { getDefaultReuseStrategies } from '#zod_converter/helpers/get_default_reuse_strategies'

export const zodToProto = function (
    raw: Proto3RawFile,
    settings?: Partial<UsageSettings>
): string {
    const fullSettings: UsageSettings = {
        reuseStrategies: settings?.reuseStrategies ?? getDefaultReuseStrategies(),
        transformers: settings?.transformers ?? getFullTransformers(),
        protoVoidType: settings?.protoVoidType ?? Proto3Empty.useType(),
    }

    const file = Proto3RawFile.into(raw, fullSettings)

    const processor = new Proto3FileProcessor()
    const fileContent = processor.process(file)
    const fileBuilder = new FileBuilder(fileContent)

    return fileBuilder.compute()
}
