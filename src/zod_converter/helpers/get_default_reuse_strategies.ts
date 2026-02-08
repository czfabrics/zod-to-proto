import { DefaultConversionStore } from '#zod_converter/classes/default_conversion_store'
import type { ConversionReuseStrategies } from '#zod_converter/types/reuse_strategy'

export const getDefaultReuseStrategies = function (): ConversionReuseStrategies {
    return {
        message: new DefaultConversionStore(),
        enum: new DefaultConversionStore(),
    }
}
