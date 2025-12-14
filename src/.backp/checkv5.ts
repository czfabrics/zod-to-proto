import { GetFirstInUnion, TuplifyUnion } from '#core/types/tuplify_union'
import { TypeDebuggingError } from '#core/types/type_debugging_error'
import z, {
    ZodArray,
    ZodBigInt,
    ZodBigIntFormat,
    ZodBoolean,
    ZodCatch,
    ZodCodec,
    ZodDate,
    ZodDefault,
    ZodDiscriminatedUnion,
    ZodEnum,
    ZodFile,
    ZodIntersection,
    ZodLazy,
    ZodLiteral,
    ZodNonOptional,
    ZodNullable,
    ZodNumber,
    ZodNumberFormat,
    ZodObject,
    ZodOptional,
    ZodPipe,
    ZodPrefault,
    ZodReadonly,
    ZodRecord,
    ZodSet,
    ZodString,
    ZodStringFormat,
    ZodTemplateLiteral,
    ZodUnion,
} from 'zod'
import { $ZodRecordKey, $ZodType, $ZodTypeDef, SomeType } from 'zod/v4/core'

// TODO: faudra checker qu'ils sont dans la liste
// complique de faire la liste
export type CompatibleZodType =
    | NotNestedAnyZodCliItem['_zod']['def']['type']
    | ZodTypeCategory2_5['_zod']['def']['type']

export type CompatibleZodTypeTuple = TuplifyUnion<CompatibleZodType>

export const CompatibleZodType = {
    is: <TSchema extends SomeType>(
        schema: TSchema
    ): schema is TSchema & { _zod: { def: CompatibleZodType } } => {
        const zodTypes: CompatibleZodTypeTuple = [
            'string',
            'number',
            'bigint',
            'boolean',
            'literal',
            'template_literal',
            'enum',
            'date',
            'file',
            'union',
        ]

        return (zodTypes as string[]).includes(schema._zod.def.type)
    },
} as const

type NotNestedAnyZodCliItem =
    | ZodString
    | ZodStringFormat
    | ZodLiteral
    | ZodTemplateLiteral
    | ZodEnum
    | ZodNumber
    | ZodNumberFormat
    | ZodBigInt
    | ZodBigIntFormat
    | ZodBoolean
    | ZodDate
    | ZodFile

type ChildRecord = {
    [key: string]: $ZodType
}

/**
 * **WARNING:** `$ZodType[]` instead of `readonly SomeType[]` DIDN'T WORK, IT NEEDS THE TRUE TYPE USED BY ZOD
 */
type ChildArray = readonly SomeType[]

// TODO: certain nommage sont à chié
type PassthroughZodTypeCategory1<
    TZodTypeValue extends $ZodTypeDef['type'],
    TChildRecord extends ChildRecord,
> = TZodTypeValue extends ZodObject['_zod']['def']['type']
    ? ZodObject<TChildRecord>
    : never

type PassthroughZodTypeCategory2<
    TZodTypeValue extends $ZodTypeDef['type'],
    TChild1 extends $ZodType,
    TChild2 extends $ZodType,
> = TZodTypeValue extends ZodPipe['_zod']['def']['type']
    ? ZodPipe<TChild1, TChild2>
    : TZodTypeValue extends ZodCodec['_zod']['def']['type']
      ? ZodCodec<TChild1, TChild2>
      : TZodTypeValue extends ZodDefault['_zod']['def']['type']
        ? ZodDefault<TChild1>
        : TZodTypeValue extends ZodPrefault['_zod']['def']['type']
          ? ZodPrefault<TChild1>
          : TZodTypeValue extends ZodLazy['_zod']['def']['type']
            ? ZodLazy<TChild1>
            : TZodTypeValue extends ZodIntersection['_zod']['def']['type']
              ? ZodIntersection<TChild1, TChild2>
              : TZodTypeValue extends ZodRecord['_zod']['def']['type']
                ? TChild1 extends $ZodRecordKey
                    ? ZodRecord<TChild1, TChild2>
                    : never
                : never

type ZodTypeCategory2_5<TChildArray extends ChildArray = ChildArray> =
    | ZodDiscriminatedUnion<TChildArray>
    | ZodUnion<TChildArray>

type PassthroughZodTypeCategory2_5<
    TZodType extends SomeType,
    TChildArray extends ChildArray,
> = TZodType extends ZodTypeCategory2_5<TChildArray> ? TZodType : never

// TODO: v1 ici
// type PassthroughZodTypeCategory2_5<
//     TZodType extends SomeType,
//     TChildArray extends ChildArray,
// > =
//     // TODOD: faire pareil pour les autres ?
//     TZodType extends ZodDiscriminatedUnion<TChildArray>
//         ? TZodType
//         : TZodType extends ZodUnion<TChildArray>
//           ? TZodType
//           : never

type PassthroughZodTypeCategory3<
    TZodTypeValue extends $ZodTypeDef['type'],
    TChild extends $ZodType,
> = TZodTypeValue extends ZodCatch['_zod']['def']['type']
    ? ZodCatch<TChild>
    : TZodTypeValue extends ZodOptional['_zod']['def']['type']
      ? ZodOptional<TChild>
      : TZodTypeValue extends ZodNonOptional['_zod']['def']['type']
        ? ZodNonOptional<TChild>
        : TZodTypeValue extends ZodNullable['_zod']['def']['type']
          ? ZodNullable<TChild>
          : TZodTypeValue extends ZodReadonly['_zod']['def']['type']
            ? ZodReadonly<TChild>
            : TZodTypeValue extends ZodSet['_zod']['def']['type']
              ? ZodSet<TChild>
              : TZodTypeValue extends ZodArray['_zod']['def']['type']
                ? ZodArray<TChild>
                : never

// TODO: à voir pour le remettre...
// type PassthroughZodType<
//     TZodTypeValue extends $ZodTypeDef['type'],
//     TChild1 extends $ZodType,
//     TChild2 extends $ZodType,
//     TChildRecord extends Test,
//     TChildArray extends Test2,
// > =
//     PassthroughZodTypeCategory1<TZodTypeValue, TChildRecord> extends infer T
//         ? T
//         : PassthroughZodTypeCategory2<TZodTypeValue, TChild1, TChild2> extends infer T
//           ? T
//           : PassthroughZodTypeCategory2_5<TZodTypeValue, TChildArray> extends infer T
//             ? T
//             : PassthroughZodTypeCategory3<TZodTypeValue, TChild1> extends infer T
//               ? T
//               : never

type GetZodTypeValue<TZodType extends SomeType> = TZodType['_zod']['def']['type']

type ContinueRecursiveRecord<TChildRecord extends ChildRecord> = {
    [TKey in keyof TChildRecord]: CheckZodSchemaCompatibility<TChildRecord[TKey]>
}

type ContinueRecursiveRecordDebug<TChildRecord extends ChildRecord> = GetFirstInUnion<
    {
        [TKey in keyof TChildRecord]: TChildRecord[TKey] extends CheckZodSchemaCompatibility<
            TChildRecord[TKey]
        >
            ? never
            : CheckZodSchemaCompatibility<TChildRecord[TKey]>
    }[keyof TChildRecord]
>

type ContinueRecursiveArray<TChildArray extends ChildArray> = {
    [TKey in keyof TChildArray]: CheckZodSchemaCompatibility<TChildArray[TKey]>
}

type ContinueRecursiveArrayDebug<TChildArray extends ChildArray> = GetFirstInUnion<
    {
        [TKey in keyof TChildArray]: TChildArray[TKey] extends CheckZodSchemaCompatibility<
            TChildArray[TKey]
        >
            ? never
            : CheckZodSchemaCompatibility<TChildArray[TKey]>
    }[number]
>

type ContinueRecursiveSingle<TChild extends $ZodType> =
    TChild extends CheckZodSchemaCompatibility<TChild> ? TChild : never

type ContinueRecursiveSingleDebug<TChild extends $ZodType> =
    TChild extends CheckZodSchemaCompatibility<TChild>
        ? never
        : CheckZodSchemaCompatibility<TChild>

export type CheckZodSchemaCompatibility<TZodType extends SomeType> =
    TZodType extends NotNestedAnyZodCliItem
        ? TZodType
        : TZodType extends PassthroughZodTypeCategory1<
                GetZodTypeValue<TZodType>,
                infer TChildRecord
            >
          ? TChildRecord extends ContinueRecursiveRecord<TChildRecord>
              ? TZodType
              : ContinueRecursiveRecordDebug<TChildRecord>
          : TZodType extends PassthroughZodTypeCategory2<
                  GetZodTypeValue<TZodType>,
                  infer TChild1,
                  infer TChild2
              >
            ? TChild1 extends ContinueRecursiveSingle<TChild1>
                ? TChild2 extends ContinueRecursiveSingle<TChild2>
                    ? TZodType
                    : ContinueRecursiveSingleDebug<TChild2>
                : ContinueRecursiveSingleDebug<TChild1>
            : TZodType extends PassthroughZodTypeCategory2_5<TZodType, infer TChildArray>
              ? TChildArray extends ContinueRecursiveArray<TChildArray>
                  ? TZodType
                  : ContinueRecursiveArrayDebug<TChildArray>
              : TZodType extends PassthroughZodTypeCategory3<
                      GetZodTypeValue<TZodType>,
                      infer TChild
                  >
                ? TChild extends ContinueRecursiveSingle<TChild>
                    ? TZodType
                    : ContinueRecursiveSingleDebug<TChild>
                : TypeDebuggingError<`This Zod type '${GetZodTypeValue<TZodType>}' is not supported`>

export function cliArgument<const TInner extends $ZodType>(
    innerType: CheckZodSchemaCompatibility<TInner>
): void {}

cliArgument(
    z.object({
        test: z.string(), //.catch(''),
        // test2: z.unknown(),
        // test3: z.any(),
    })
)

cliArgument(z.intersection(z.string(), z.boolean()))
cliArgument(z.union([z.string(), z.boolean()]))
cliArgument(z.union([z.string().optional(), z.string()]))
cliArgument(
    z.object({
        test: z.union([z.string().optional()]),
        test3: z.number(),
    })
)
cliArgument(z.string().catch(''))
cliArgument(z.record(z.string(), z.boolean()))
cliArgument(
    z.object({
        test: z.union([z.string().optional()]),
        test3: z.record(z.string(), z.boolean()),
    })
)
cliArgument(z.set(z.string()))
cliArgument(z.array(z.string()))

cliArgument(
    z.object({
        test: z.set(z.string()),
        test3: z.array(z.string()),
        // test4: z.array(z.any()),
    })
)
