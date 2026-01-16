import type { SomeType } from 'zod/v4/core'

export type SomeZodType<TZodTypeValue extends SomeType['_zod']['def']['type']> =
    SomeType & {
        _zod: {
            def: {
                type: TZodTypeValue
            }
        }
    }

type SomeZodShape = Readonly<{ [k: string]: SomeType }>

export type SomeZodObject<TShape extends SomeZodShape = SomeZodShape> =
    SomeZodType<'object'> & {
        _zod: {
            def: {
                shape: TShape
            }
        }
    }
