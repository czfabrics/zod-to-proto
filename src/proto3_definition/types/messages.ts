import type { CheckTuple } from '#core/types/check_tuple'
import type {
    AnyProto3MessageField,
    Proto3EnumField,
} from '#proto3_definition/types/fields'
import type { GetNewParams } from '#proto3_definition/types/get_new_params'
import type { ZodType } from 'zod'

export type Proto3Message = {
    internalName: 'message'
    getDeepMessages(): AnyProto3Message[]
    getNextIndex(): number
    name: string
    schema: ZodType
    fields: AnyProto3MessageField[]
}

export const Proto3Message = {
    new: (params: GetNewParams<Proto3Message>): Proto3Message => {
        return {
            internalName: 'message',
            getDeepMessages() {
                const deepMessages = this.fields
                    .map((field) => field.getDeepMessages())
                    .flat()

                return [this, ...deepMessages]
            },
            getNextIndex() {
                return this.fields.length
            },
            ...params,
        }
    },
} as const

export type Proto3Enum = {
    internalName: 'enum'
    name: string
    schema: ZodType
    fields: Proto3EnumField[]
    getDeepMessages(): AnyProto3Message[]
}

export const Proto3Enum = {
    new: (params: GetNewParams<Proto3Enum>): Proto3Enum => {
        return {
            internalName: 'enum',
            getDeepMessages() {
                return [this]
            },
            ...params,
        }
    },
} as const

type MessageInternalNameTuple = AnyProto3Message['internalName'][]

const MessageInternalNameTuple = {
    new: function <const TValues extends string[]>(
        values: CheckTuple<AnyProto3Message['internalName'], TValues>
    ): MessageInternalNameTuple {
        return values as MessageInternalNameTuple
    },
} as const

export const AnyProto3Message = {
    is: <TObject extends { internalName: string }>(
        object: TObject
    ): object is TObject & { internalName: AnyProto3Message['internalName'] } => {
        const internalNames: MessageInternalNameTuple = MessageInternalNameTuple.new([
            'message',
            'enum',
        ])

        return (internalNames as string[]).includes(object.internalName)
    },
} as const

export type AnyProto3Message = Proto3Message | Proto3Enum
