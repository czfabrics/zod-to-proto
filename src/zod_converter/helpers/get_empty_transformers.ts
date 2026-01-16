import { ZodConversionTransformers } from '#zod_converter/types/transformers'

export const getEmptyTranformers = function (): ZodConversionTransformers {
    return {
        message: [],
        messageField: [],
        messageOneOfField: [],
        enum: [],
    }
}
