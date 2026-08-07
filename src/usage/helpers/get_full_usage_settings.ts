import { Proto3Empty } from '#plugin/types/google_protobuf'
import { getFullTransformers } from '#usage/helpers/get_full_transformers'
import type { UsageSettings } from '#usage/types/settings'
import {
    getDefaultConversionReuseStrategies,
    getDefaultTransformationReuseStrategies,
} from '#zod_converter/helpers/get_default_reuse_strategies'

export const getFullUsageSettings = function (
    settings?: Partial<UsageSettings>
): UsageSettings {
    return {
        conversionReuseStrategies:
            settings?.conversionReuseStrategies ?? getDefaultConversionReuseStrategies(),
        transformers: settings?.transformers ?? getFullTransformers(),
        transformationReuseStrategies:
            settings?.transformationReuseStrategies ??
            getDefaultTransformationReuseStrategies(),
        protoVoidType: settings?.protoVoidType ?? Proto3Empty.useType(),
    }
}
