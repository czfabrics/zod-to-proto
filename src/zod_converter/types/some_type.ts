import { GetZodTypeValue } from '#zod_converter/types/zod_type_value'
import type { SomeType } from 'zod/v4/core'

export type SomeZodType<
    TZodTypeValue extends GetZodTypeValue<SomeType>,
    TInput = unknown,
    TOutput = unknown,
> = SomeType & {
    _zod: {
        def: {
            type: TZodTypeValue
        }
        /** @internal The inferred output type */
        input: TInput
        /** @internal The inferred output type */
        output: TOutput
    }
}

export type ExcludeZodType<
    TZodType extends SomeType,
    TExcludedZodTypeValue extends GetZodTypeValue<SomeType>,
> = Exclude<TZodType, SomeZodType<TExcludedZodTypeValue>>

export type IntoSomeZodType<TZodType extends SomeType> = SomeZodType<
    GetZodTypeValue<TZodType>
>

export type SomeZodShape = Readonly<{ [k: string]: SomeType }>

export type SomeZodObject<TShape extends SomeZodShape = SomeZodShape> =
    SomeZodType<'object'> & {
        _zod: {
            def: {
                shape: TShape
            }
        }
    }

export type SomeZodUnion<TOptions extends readonly SomeType[] = readonly SomeType[]> =
    SomeZodType<'union'> & {
        _zod: {
            def: {
                options: TOptions
            }
        }
    }

export type SomeZodArray<TElement extends SomeType = SomeType> = SomeZodType<'array'> & {
    _zod: {
        def: {
            element: TElement
        }
    }
}

export type SomeZodSet<TValueType extends SomeType = SomeType> = SomeZodType<'set'> & {
    _zod: {
        def: {
            element: TValueType
        }
    }
}

export type ExtractZodTypeValue<TZodTypeValue extends GetZodTypeValue<SomeType>> =
    Extract<GetZodTypeValue<SomeType>, TZodTypeValue>

export type SomeZodPassthrough<TInnerType extends SomeType = SomeType> =
    | (SomeZodType<
          ExtractZodTypeValue<
              'catch' | 'optional' | 'nonoptional' | 'readonly' | 'default' | 'prefault'
          >
      > & {
          _zod: {
              def: {
                  element: TInnerType
              }
          }
      })
    | (SomeZodType<'pipe'> & {
          _zod: {
              def: {
                  in: TInnerType
              }
          }
      })

export type SomeZodRecord<
    TKeyType extends SomeType = SomeType,
    TValueType extends SomeType = SomeType,
> = SomeZodType<'record'> & {
    _zod: {
        def: {
            keyType: TKeyType
            valueType: TValueType
        }
    }
}

export type SomeZodIntersection<
    TLeft extends SomeType = SomeType,
    TRight extends SomeType = SomeType,
> = SomeZodType<'intersection'> & {
    _zod: {
        def: {
            left: TLeft
            right: TRight
        }
    }
}
