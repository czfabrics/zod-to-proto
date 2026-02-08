import { getRandomId } from '#core/helpers/get_random_id'
import {
    getProtoConversionId,
    setProtoConversionId,
} from '#zod_converter/helpers/registry'
import { AnyZodMessage } from '#zod_converter/types/messages'
import type { ConversionReuseStrategy } from '#zod_converter/types/reuse_strategy'

export class DefaultConversionStore<
    TSchema extends AnyZodMessage,
    TProtoDef,
> implements ConversionReuseStrategy<TSchema, TProtoDef> {
    private readonly store: Record<string, TProtoDef> = {}

    reuseConversion(schema: TSchema): TProtoDef | undefined {
        const conversionId: string | undefined = getProtoConversionId(schema)

        if (conversionId === undefined) {
            return undefined
        }

        return this.store[conversionId]
    }

    storeConversion(schema: TSchema, protoMessage: TProtoDef): void {
        const conversionId: string = getProtoConversionId(schema) ?? getRandomId()

        if (this.store[conversionId]) {
            return
        }

        setProtoConversionId(schema, conversionId)

        this.store[conversionId] = protoMessage
    }
}
