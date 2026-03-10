import { ReadOnly } from '#core/types/read_only'
import type { TransformationReuseStrategy } from '#zod_converter/types/reuse_strategy'

export class DefaultTransformationStore<
    TProtoDef,
> implements TransformationReuseStrategy<TProtoDef> {
    private readonly store: Record<string, ReadOnly<TProtoDef>> = {}

    reuseTransformation(id: string): ReadOnly<TProtoDef> | undefined {
        return this.store[id]
    }

    storeTransformation(id: string, protoMessage: ReadOnly<TProtoDef>): void {
        if (this.store[id]) {
            return
        }

        this.store[id] = protoMessage
    }
}
