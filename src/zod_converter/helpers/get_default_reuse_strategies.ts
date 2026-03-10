import { DefaultConversionStore } from '#zod_converter/classes/default_conversion_store'
import { DefaultTransformationStore } from '#zod_converter/classes/default_transformation_store'
import type {
    ConversionReuseStrategies,
    TransformationReuseStrategies,
} from '#zod_converter/types/reuse_strategy'

export const getDefaultConversionReuseStrategies =
    function (): ConversionReuseStrategies {
        return {
            message: new DefaultConversionStore(),
            enum: new DefaultConversionStore(),
        }
    }

export const getDefaultTransformationReuseStrategies =
    function (): TransformationReuseStrategies {
        return {
            message: new DefaultTransformationStore(),
            enum: new DefaultTransformationStore(),
        }
    }
