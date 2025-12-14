import {
    Proto3MapType,
    Proto3RepeatedType,
} from '#proto3_definition/types/primitif_standalone'
import type { Proto3ComplexPrimitifType } from '#proto3_definition/types/primitifs'
import { assertsZodMapValueType } from '#zod_converter/asserts/zod_map_value'
import { assertsZodPrimitifType } from '#zod_converter/asserts/zod_primitif_type'
import { assertsZodRepeatedInnerType } from '#zod_converter/asserts/zod_repeated_inner_type'
import { ZodMessageFieldTypeConverter } from '#zod_converter/classes/zod_message_field_type_converter'
import { zodTypePattern } from '#zod_converter/helpers/zod_type_pattern'
import type { ZodComplexPrimitifType } from '#zod_converter/types/complex_primitifs'
import { ZodPassthroughType } from '#zod_converter/types/passthroughs'
import { match } from 'ts-pattern'

export class ZodComplexPrimitifConverter {
    public convert(
        key: string,
        rootSchema: ZodComplexPrimitifType | ZodPassthroughType
    ): Proto3ComplexPrimitifType {
        const deepSchema = ZodPassthroughType.pass(rootSchema)

        return match(deepSchema)
            .returnType<Proto3ComplexPrimitifType>()
            .with(zodTypePattern('array'), (schema) => {
                const converter = new ZodMessageFieldTypeConverter()

                // TODO: c'est dans le typage ? le fait qu'un array ne peut pas prendre un record?
                assertsZodRepeatedInnerType(schema._zod.def.element)

                const inner = converter.convert(key, schema._zod.def.element)

                return Proto3RepeatedType.new({
                    inner,
                    schema: rootSchema,
                })
            })
            .with(zodTypePattern('set'), (schema) => {
                const converter = new ZodMessageFieldTypeConverter()

                // TODO: c'est dans le typage ? le fait qu'un array ne peut pas prendre un record?
                assertsZodRepeatedInnerType(schema._zod.def.valueType)

                const inner = converter.convert(key, schema._zod.def.valueType)

                return Proto3RepeatedType.new({
                    inner,
                    schema: rootSchema,
                })
            })
            .with(zodTypePattern('record'), (schema) => {
                const converter = new ZodMessageFieldTypeConverter()

                // TODO: ajouter le typage le $ZodRecordKey sans SYMBOL
                // TODO: ajouter au typage key map
                // TODO: ajouter au typage value map

                assertsZodPrimitifType(schema._zod.def.keyType)

                schema._zod.def.keyType._zod.def.type

                const keyType = converter.convert(key, schema._zod.def.keyType)

                assertsZodMapValueType(schema._zod.def.valueType)

                const valueType = converter.convert(key, schema._zod.def.valueType)

                return Proto3MapType.new({
                    key: keyType,
                    value: valueType,
                    schema: rootSchema,
                })
            })
            .exhaustive()
    }
}
