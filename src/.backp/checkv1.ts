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
    TChildren extends Test,
> = TZodTypeValue extends ZodObject['_zod']['def']['type'] ? ZodObject<TChildren> : never

type PassthroughZodTypeCategory2<
    TZodTypeValue extends $ZodTypeDef['type'],
    TChildren extends Test,
    TChildren2 extends Test2,
> = TZodTypeValue extends ZodPipe['_zod']['def']['type']
    ? ZodPipe<TChildren2[0], TChildren2[1]>
    : TZodTypeValue extends ZodCodec['_zod']['def']['type']
      ? ZodCodec<TChildren2[0], TChildren2[1]>
      : TZodTypeValue extends ZodDefault['_zod']['def']['type']
        ? ZodDefault<TChildren2[0]>
        : TZodTypeValue extends ZodPrefault['_zod']['def']['type']
          ? ZodPrefault<TChildren2[0]>
          : TZodTypeValue extends ZodLazy['_zod']['def']['type']
            ? ZodLazy<TChildren2[0]>
            : TZodTypeValue extends ZodDiscriminatedUnion['_zod']['def']['type']
              ? ZodDiscriminatedUnion<TChildren2>
              : TZodTypeValue extends ZodUnion['_zod']['def']['type']
                ? ZodUnion<TChildren2>
                : TZodTypeValue extends ZodIntersection['_zod']['def']['type']
                  ? ZodIntersection<TChildren2[0], TChildren2[1]>
                  : never

type PassthroughZodTypeCategory3<
    TZodTypeValue extends $ZodTypeDef['type'],
    TChildren extends Test,
    TChildren2 extends Test2,
> = TZodTypeValue extends ZodCatch['_zod']['def']['type']
    ? ZodCatch<TChildren2[0]>
    : TZodTypeValue extends ZodOptional['_zod']['def']['type']
      ? ZodOptional<TChildren2[0]>
      : TZodTypeValue extends ZodNonOptional['_zod']['def']['type']
        ? ZodNonOptional<TChildren2[0]>
        : TZodTypeValue extends ZodNullable['_zod']['def']['type']
          ? ZodNullable<TChildren2[0]>
          : TZodTypeValue extends ZodReadonly['_zod']['def']['type']
            ? ZodReadonly<TChildren2[0]>
            : never

type PassthroughZodType<
    TZodTypeValue extends $ZodTypeDef['type'],
    TChildren extends Test,
    TChildren2 extends Test2,
> =
    PassthroughZodTypeCategory1<TZodTypeValue, TChildren> extends infer T
        ? T
        : PassthroughZodTypeCategory2<
                TZodTypeValue,
                TChildren,
                TChildren2
            > extends infer T
          ? T
          : PassthroughZodTypeCategory3<
                  TZodTypeValue,
                  TChildren,
                  TChildren2
              > extends infer T
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

type ContinueRecursive2<TZodType extends $ZodType, TChildren extends Test> = {
    [TKey in keyof TChildren]: CheckZodSchema<TChildren[TKey]>
}

type ContinueRecursive3<TZodType extends $ZodType, TChildren2 extends Test2> = {
    [TKey in keyof TChildren2]: CheckZodSchema<TChildren2[TKey]>
}

// type ContinueRecursive<TZodType extends $ZodType, TChildren extends Test> =
//     ContinueRecursive2<TZodType, TChildren> extends infer T ? TZodType : never

// TODO: ici pas bon le TChild, car dans le cas
// du pipe ça ne fonctionne pas ?
// CheckZodSchema<TChild> extends infer T
//     ? T extends $ZodType
//         ? CheckZodSchema<TChild2> extends infer T2
//             ? T2 extends $ZodType
//                 ? PassthroughZodType<GetZodTypeValue<TZodType>, TChildren>
//                 : never
//             : never
//         : never
//     : never

// export type CheckZodSchema<TZodType extends $ZodType> = TZodType extends ZodUnknown
//     ? TZodType
//     : TZodType extends PassthroughZodType<GetZodTypeValue<TZodType>, infer TChildren>
//       ? ContinueRecursive<TZodType, TChildren>
//       : TypeDebuggingError<`This Zod type '${GetZodTypeValue<TZodType>}' is not supported`>

export type CheckZodSchema<TZodType extends $ZodType> =
    TZodType extends NotNestedAnyZodCliItem
        ? TZodType
        : TZodType extends PassthroughZodType<
                GetZodTypeValue<TZodType>,
                infer TChildren,
                infer TChildren2
            >
          ? TChildren2 extends ContinueRecursive3<TZodType, TChildren2>
              ? TZodType
              : never
          : TypeDebuggingError<`This Zod type '${GetZodTypeValue<TZodType>}' is not supported`>

export function cliArgument<const TInner extends $ZodType>(
    innerType: CheckZodSchema<TInner>
): void {}

type Hehe =
    { test: ZodString } extends ContinueRecursive2<ZodObject, { test: ZodString }>
        ? true
        : false

cliArgument(
    z.object({
        test: z.string(), //.catch(''),
        // test2: z.unknown(),
    })
)

cliArgument(z.string().catch(''))
