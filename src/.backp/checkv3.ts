import { TypeDebuggingError } from '#core/types/type_debugging_error'
import z, {
    core,
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
    ZodString,
    ZodStringFormat,
    ZodTemplateLiteral,
    ZodUnion,
} from 'zod'
import { $ZodType, $ZodTypeDef, SomeType } from 'zod/v4/core'

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

type Test = {
    [key: string]: $ZodType
}
// type Test2 = $ZodType[]
/**
 * **WARNING:** `$ZodType[]` instead of `readonly SomeType[]` DIDN'T WORK, IT NEEDS THE TRUE TYPE USED BY ZOD
 */
type Test2 = readonly SomeType[]

type PassthroughZodTypeCategory1<
    TZodTypeValue extends $ZodTypeDef['type'],
    TChildrenRecord extends Test,
> = TZodTypeValue extends ZodObject['_zod']['def']['type']
    ? ZodObject<TChildrenRecord>
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
              : never

// type PassthroughZodTypeCategory2_5<
//     TZodTypeValue extends $ZodTypeDef['type'],
//     TChildrenArray extends Test2,
// > = TZodTypeValue extends ZodDiscriminatedUnion['_zod']['def']['type']
//     ? ZodDiscriminatedUnion<TChildrenArray>
//     : TZodTypeValue extends ZodUnion['_zod']['def']['type']
//       ? ZodUnion<TChildrenArray>
//       : never

type PassthroughZodTypeCategory2_5<
    TZodType extends SomeType,
    TChildrenArray extends Test2,
> =
    TZodType extends ZodDiscriminatedUnion<TChildrenArray>
        ? TZodType
        : TZodType extends ZodUnion<TChildrenArray>
          ? TZodType
          : never

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
            : never

// TODO: à voir pour le remettre...
// type PassthroughZodType<
//     TZodTypeValue extends $ZodTypeDef['type'],
//     TChild1 extends $ZodType,
//     TChild2 extends $ZodType,
//     TChildrenRecord extends Test,
//     TChildrenArray extends Test2,
// > =
//     PassthroughZodTypeCategory1<TZodTypeValue, TChildrenRecord> extends infer T
//         ? T
//         : PassthroughZodTypeCategory2<TZodTypeValue, TChild1, TChild2> extends infer T
//           ? T
//           : PassthroughZodTypeCategory2_5<TZodTypeValue, TChildrenArray> extends infer T
//             ? T
//             : PassthroughZodTypeCategory3<TZodTypeValue, TChild1> extends infer T
//               ? T
//               : never

type GetZodTypeValue<TZodType extends core.SomeType = $ZodType> =
    TZodType['_zod']['def']['type']

// type ContinueRecursive<TZodType extends $ZodType, TChildren extends $ZodType[]> =
//     // TODO: ici pas bon le TChild, car dans le cas
//     // du pipe ça ne fonctionne pas ?
//     CheckZodSchema<TChild> extends infer T
//         ? T extends $ZodType
//             ? CheckZodSchema<TChild2> extends infer T2
//                 ? T2 extends $ZodType
//                     ? PassthroughZodType<GetZodTypeValue<TZodType>, TChildren>
//                     : never
//                 : never
//             : never
//         : never

type ContinueRecursiveRecord<TChildrenRecord extends Test> = {
    [TKey in keyof TChildrenRecord]: CheckZodSchema<TChildrenRecord[TKey]>
}

type ContinueRecursiveRecordDebug<TChildrenRecord extends Test> = {
    [TKey in keyof TChildrenRecord]: TChildrenRecord[TKey] extends CheckZodSchema<
        TChildrenRecord[TKey]
    >
        ? never
        : TChildrenRecord[TKey]
}[keyof TChildrenRecord]

type ContinueRecursiveArray<TChildrenArray extends Test2> = {
    [TKey in keyof TChildrenArray]: CheckZodSchema<TChildrenArray[TKey]>
}

type ContinueRecursiveArrayDebug<TChildrenArray extends Test2> = {
    [TKey in keyof TChildrenArray]: TChildrenArray[TKey] extends CheckZodSchema<
        TChildrenArray[TKey]
    >
        ? never
        : TChildrenArray[TKey]
}[keyof TChildrenArray]

type ContinueRecursiveSingle<TChild extends $ZodType> =
    TChild extends CheckZodSchema<TChild> ? TChild : never

// export type CheckZodSchema<TZodType extends $ZodType> =
//     TZodType extends NotNestedAnyZodCliItem
//         ? TZodType
//         : TZodType extends PassthroughZodType<
//                 GetZodTypeValue<TZodType>,
//                 infer TChild1,
//                 infer TChild2,
//                 infer TChildrenRecord,
//                 infer TChildrenArray
//             >
//           ? TChild2 extends ContinueRecursiveSingle<TChild2>
//               ? TChild1 extends ContinueRecursiveSingle<TChild1>
//                   ? TZodType
//                   : never
//               : TChild1 extends ContinueRecursiveSingle<TChild1>
//                 ? TZodType
//                 : TChildrenRecord extends ContinueRecursiveRecord<TChildrenRecord>
//                   ? TZodType
//                   : TChildrenArray extends ContinueRecursiveArray<TChildrenArray>
//                     ? TZodType
//                     : never
//           : TypeDebuggingError<`This Zod type '${GetZodTypeValue<TZodType>}' is not supported`>

export type CheckZodSchema<TZodType extends SomeType> =
    TZodType extends NotNestedAnyZodCliItem
        ? TZodType
        : TZodType extends PassthroughZodTypeCategory1<
                GetZodTypeValue<TZodType>,
                infer TChildrenRecord
            >
          ? TChildrenRecord extends ContinueRecursiveRecord<TChildrenRecord>
              ? TZodType
              : TypeDebuggingError<`This Zod type '${GetZodTypeValue<ContinueRecursiveRecordDebug<TChildrenRecord>>}' is not supported`> // TODO
          : TZodType extends PassthroughZodTypeCategory2<
                  GetZodTypeValue<TZodType>,
                  infer TChild1,
                  infer TChild2
              >
            ? TChild1 extends ContinueRecursiveSingle<TChild1>
                ? TChild2 extends ContinueRecursiveSingle<TChild2>
                    ? TZodType
                    : TypeDebuggingError<`This Zod type '${GetZodTypeValue<TChild2>}' is not supported`> // TODO
                : TypeDebuggingError<`This Zod type '${GetZodTypeValue<TChild1>}' is not supported`> // TODO
            : TZodType extends PassthroughZodTypeCategory2_5<
                    TZodType,
                    infer TChildrenArray
                >
              ? TChildrenArray extends ContinueRecursiveArray<TChildrenArray>
                  ? TZodType
                  : TypeDebuggingError<`This Zod type '${GetZodTypeValue<ContinueRecursiveArrayDebug<TChildrenArray>>}' is not supported`> // TODO
              : TZodType extends PassthroughZodTypeCategory3<
                      GetZodTypeValue<TZodType>,
                      infer TChild
                  >
                ? TChild extends ContinueRecursiveSingle<TChild>
                    ? TZodType
                    : TypeDebuggingError<`This Zod type '${GetZodTypeValue<TChild>}' is not supported`> // TODO
                : TypeDebuggingError<`TODO--- This Zod type '${GetZodTypeValue<TZodType>}' is not supported`>

// export type CheckZodSchemaForArray<TZodType extends $ZodType> =
//     TZodType extends NotNestedAnyZodCliItem
//         ? TZodType
//         : TZodType extends PassthroughZodTypeCategory2_5<TZodType, infer TChildrenArray>
//           ? TChildrenArray extends ContinueRecursiveArray<TChildrenArray>
//               ? TZodType
//               : TypeDebuggingError<`This Zod type '${GetZodTypeValue<TChildrenArray[number]>}' is not supported`> // TODO
//           : TypeDebuggingError<`TODO---2 This Zod type '${GetZodTypeValue<TZodType>}' is not supported`>

// export type CheckZodSchemaForArray<TZodType extends $ZodType> =
//     TZodType extends NotNestedAnyZodCliItem
//         ? TZodType
//         : TZodType extends ZodUnion<infer TChildrenArray>
//           ? TChildrenArray extends ContinueRecursiveArray<TChildrenArray>
//               ? TZodType
//               : TypeDebuggingError<`This Zod type '${GetZodTypeValue<TChildrenArray[number]>}' is not supported`> // TODO
//           : TypeDebuggingError<`TODO---2 This Zod type '${GetZodTypeValue<TZodType>}' is not supported`>

// export type CheckZodSchemaForArray<TZodType extends $ZodType> =
//     TZodType extends NotNestedAnyZodCliItem
//         ? TZodType
//         : getChildren<TZodType> extends infer U
//           ? U
//           : TypeDebuggingError<`TODO---2 This Zod type '${GetZodTypeValue<TZodType>}' is not supported`>

export function cliArgument<const TInner extends $ZodType>(
    innerType: CheckZodSchema<TInner>
): void {}

// type Hehe =
//     { test: ZodString } extends ContinueRecursive2<ZodObject, { test: ZodString }>
//         ? true
//         : false
// type test<T extends $ZodType, TC extends Test2> =
//     T extends PassthroughZodTypeCategory2_5<T, TC> ? T : never
// type getChildren<T extends $ZodType> = T extends test<T, infer TC> ? T : never
// // type getChildren2<T> = T extends ZodUnion<infer TC> ? TC : never
// type test3 = getChildren<ZodUnion<[ZodString]>>

// cliArgument(
//     z.object({
//         test: z.string(), //.catch(''),
//         // test2: z.unknown(),
//         // test3: z.any(),
//     })
// )

// cliArgument(z.intersection(z.string(), z.boolean()))
cliArgument(z.union([z.string(), z.boolean()]))
cliArgument(z.union([z.string(), z.any()]))
// cliArgument(z.string().catch(''))
