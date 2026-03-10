import { FileBuilder } from '#file/classes/file_builder'
import { Proto3Empty } from '#plugin/types/google_protobuf'
import { Proto3FileProcessor } from '#proto3_processor/classes/proto3_file_processor'
import { getFullTransformers } from '#usage/helpers/get_full_transformers'
import { Proto3RawFile } from '#usage/types/file'
import type { UsageSettings } from '#usage/types/settings'
import {
    getDefaultConversionReuseStrategies,
    getDefaultTransformationReuseStrategies,
} from '#zod_converter/helpers/get_default_reuse_strategies'

export const zodToProto = function (
    raw: Proto3RawFile,
    settings?: Partial<UsageSettings>
): string {
    const fullSettings: UsageSettings = {
        conversionReuseStrategies:
            settings?.conversionReuseStrategies ?? getDefaultConversionReuseStrategies(),
        transformers: settings?.transformers ?? getFullTransformers(),
        transformationReuseStrategies:
            settings?.transformationReuseStrategies ??
            getDefaultTransformationReuseStrategies(),
        protoVoidType: settings?.protoVoidType ?? Proto3Empty.useType(),
    }

    const file = Proto3RawFile.into(raw, fullSettings)

    const processor = new Proto3FileProcessor()
    const fileContent = processor.process(file)
    const fileBuilder = new FileBuilder(fileContent)

    return fileBuilder.compute()
}
