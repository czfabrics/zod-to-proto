import { FileBuilder } from '#file/classes/file_builder'
import { Proto3FileProcessor } from '#proto3_processor/classes/proto3_file_processor'
import { getFullUsageSettings } from '#usage/helpers/get_full_usage_settings'
import { Proto3RawFile } from '#usage/types/file'
import type { UsageSettings } from '#usage/types/settings'

export const zodToProto = function (
    raw: Proto3RawFile,
    settings?: Partial<UsageSettings>
): string {
    const file = Proto3RawFile.into(raw, getFullUsageSettings(settings))

    const processor = new Proto3FileProcessor()
    const fileContent = processor.process(file)
    const fileBuilder = new FileBuilder(fileContent)

    return fileBuilder.compute()
}
