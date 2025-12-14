import type { TuplifyUnion } from '#core/types/tuplify_union'
import type { SomeType } from 'zod/v4/core'

export type GetZodTypeValue<TZodType extends SomeType> = TZodType['_zod']['def']['type']

export type CastZodTypeFromTypeValue<
    TZodTypeInner extends SomeType,
    TZodTypeOuter extends SomeType,
    TSchemaUnionTuple extends TuplifyUnion<TZodTypeInner> = TuplifyUnion<TZodTypeInner>,
> = {
    [TKey in keyof TSchemaUnionTuple]: TSchemaUnionTuple[TKey] extends SomeType
        ? GetZodTypeValue<TSchemaUnionTuple[TKey]> extends GetZodTypeValue<TZodTypeOuter>
            ? TSchemaUnionTuple[TKey]
            : never
        : never
}[keyof TSchemaUnionTuple]
