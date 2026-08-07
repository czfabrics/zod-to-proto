import { Proto3RuntimeResolver } from '#proto3_runtime/classes/proto3_runtime_resolver'
import type { Proto3RuntimeDefinition } from '#proto3_runtime/types/runtime'
import { getFullUsageSettings } from '#usage/helpers/get_full_usage_settings'
import { Proto3RawFile } from '#usage/types/file'
import type { UsageSettings } from '#usage/types/settings'

export const zodToRuntime = function (
    raw: Proto3RawFile,
    settings?: Partial<UsageSettings>
): Proto3RuntimeDefinition {
    const file = Proto3RawFile.into(raw, getFullUsageSettings(settings))

    const resolver = new Proto3RuntimeResolver()

    return resolver.resolveType(file)
}
