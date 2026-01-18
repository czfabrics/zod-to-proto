import {
    Proto3BoolType,
    Proto3DoubleType,
    Proto3FloatType,
    Proto3Int32Type,
    Proto3Int64Type,
    Proto3StringType,
    Proto3UInt32Type,
    Proto3UInt64Type,
} from '#proto3_definition/types/primitif_standalone'
import type { Proto3PrimitifType } from '#proto3_definition/types/primitifs'
import { assertsZodFormat } from '#zod_converter/asserts/zod_format'
import { zodTypePattern } from '#zod_converter/helpers/zod_type_pattern'
import {
    WithMaybeZodPassthrough,
    ZodPassthroughType,
} from '#zod_converter/types/passthroughs'
import type { ZodPrimitifType } from '#zod_converter/types/primitifs'
import { match } from 'ts-pattern'

export class ZodPrimitifConverter {
    public convert(
        rootSchema: WithMaybeZodPassthrough<ZodPrimitifType>
    ): Proto3PrimitifType {
        const deepSchema = ZodPassthroughType.pass(rootSchema)

        return match(deepSchema)
            .returnType<Proto3PrimitifType>()
            .with(zodTypePattern('string'), () => Proto3StringType.new(rootSchema))
            .with(zodTypePattern('number'), (schema) => {
                if (schema.format === null) {
                    //// Handles `z.number()`
                    return Proto3DoubleType.new(rootSchema)
                }

                assertsZodFormat(
                    ['safeint', 'float32', 'float64', 'int32', 'uint32'],
                    schema
                )

                return match(schema)
                    .with({ format: 'safeint' }, () => {
                        //// int64 because int can be int32 or int64
                        return Proto3Int64Type.new(rootSchema)
                    })
                    .with({ format: 'int32' }, () => Proto3Int32Type.new(rootSchema))
                    .with({ format: 'float32' }, () => Proto3FloatType.new(rootSchema))
                    .with({ format: 'float64' }, () => Proto3DoubleType.new(rootSchema))
                    .with({ format: 'uint32' }, () => Proto3UInt32Type.new(rootSchema))
                    .exhaustive()
            })
            .with(zodTypePattern('bigint'), (schema) => {
                assertsZodFormat(['int64', 'uint64'], schema)

                return match(schema)
                    .with({ format: 'int64' }, () => Proto3Int64Type.new(rootSchema))
                    .with({ format: 'uint64' }, () => Proto3UInt64Type.new(rootSchema))
                    .exhaustive()
            })
            .with(zodTypePattern('boolean'), () => Proto3BoolType.new(rootSchema))
            .with(zodTypePattern('literal'), () => Proto3StringType.new(rootSchema))
            .with(zodTypePattern('template_literal'), () =>
                Proto3StringType.new(rootSchema)
            )
            .exhaustive()
    }
}
