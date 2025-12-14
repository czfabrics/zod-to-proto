import { TypeDebuggingError } from '#core/types/type_debugging_error'
import z, {
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
import { $ZodType, $ZodTypeDef } from 'zod/v4/core'

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
type Test2 = $ZodType[]

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

type PassthroughZodTypeCategory2_5<
    TZodTypeValue extends $ZodTypeDef['type'],
    TChildrenArray extends Test2,
> = TZodTypeValue extends ZodDiscriminatedUnion['_zod']['def']['type']
    ? ZodDiscriminatedUnion<TChildrenArray>
    : TZodTypeValue extends ZodUnion['_zod']['def']['type']
      ? ZodUnion<TChildrenArray>
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

type PassthroughZodType<
    TZodTypeValue extends $ZodTypeDef['type'],
    TChild1 extends $ZodType,
    TChild2 extends $ZodType,
    TChildrenRecord extends Test,
    TChildrenArray extends Test2,
> =
    PassthroughZodTypeCategory1<TZodTypeValue, TChildrenRecord> extends infer T
        ? T
        : PassthroughZodTypeCategory2<TZodTypeValue, TChild1, TChild2> extends infer T
          ? T
          : PassthroughZodTypeCategory2_5<TZodTypeValue, TChildrenArray> extends infer T
            ? T
            : PassthroughZodTypeCategory3<TZodTypeValue, TChild1> extends infer T
              ? T
              : never

type GetZodTypeValue<TZodType extends $ZodType = $ZodType> =
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

type ContinueRecursiveArray<TChildrenArray extends Test2> = {
    [TKey in keyof TChildrenArray]: CheckZodSchema<TChildrenArray[TKey]>
}

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

export type CheckZodSchema<TZodType extends $ZodType> =
    TZodType extends NotNestedAnyZodCliItem
        ? TZodType
        : TZodType extends PassthroughZodType<
                GetZodTypeValue<TZodType>,
                infer TChild1,
                $ZodType,
                Test,
                Test2
            >
          ? TChild1 extends ContinueRecursiveSingle<TChild1>
              ? TZodType
              : number // TODO
          : TZodType extends PassthroughZodType<
                  GetZodTypeValue<TZodType>,
                  infer TChild1,
                  infer TChild2,
                  Test,
                  Test2
              >
            ? TChild1 extends ContinueRecursiveSingle<TChild1>
                ? TChild2 extends ContinueRecursiveSingle<TChild2>
                    ? TZodType
                    : number
                : number
            : TZodType extends PassthroughZodType<
                    GetZodTypeValue<TZodType>,
                    $ZodType,
                    $ZodType,
                    infer ChildrenRecord,
                    Test2
                >
              ? ChildrenRecord extends ContinueRecursiveRecord<ChildrenRecord>
                  ? TZodType
                  : number
              : TZodType extends PassthroughZodType<
                      GetZodTypeValue<TZodType>,
                      $ZodType,
                      $ZodType,
                      Test,
                      infer ChildrenArray
                  >
                ? ChildrenArray extends ContinueRecursiveArray<ChildrenArray>
                    ? TZodType
                    : number
                : TypeDebuggingError<`This Zod type '${GetZodTypeValue<TZodType>}' is not supported`>

export type CheckZodSchemaTestForCatch<TZodType extends $ZodType> =
    TZodType extends NotNestedAnyZodCliItem
        ? TZodType
        : TZodType extends PassthroughZodType<
                GetZodTypeValue<TZodType>,
                infer TChild1,
                $ZodType,
                Test,
                Test2
            >
          ? TChild1 extends ContinueRecursiveSingle<TChild1>
              ? TZodType
              : number // TODO
          : TypeDebuggingError<`This Zod type '${GetZodTypeValue<TZodType>}' is not supported`>

export function cliArgument<const TInner extends $ZodType>(
    innerType: CheckZodSchemaTestForCatch<TInner>
): void {}

// type Hehe =
//     { test: ZodString } extends ContinueRecursive2<ZodObject, { test: ZodString }>
//         ? true
//         : false
type test = PassthroughZodTypeCategory3<GetZodTypeValue<ZodCatch<ZodString>>, ZodString>

cliArgument(
    z.object({
        test: z.string(), //.catch(''),
        // test2: z.unknown(),
    })
)

cliArgument(z.string().catch(''))
