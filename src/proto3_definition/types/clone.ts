import { DeepReadOnly } from '#proto3_definition/types/deep_read_only'
import { GetNewParams } from '#proto3_definition/types/get_new_params'

export type CloneParams<T> =
    | Partial<GetNewParams<T>>
    | Partial<GetNewParams<DeepReadOnly<T>>>

export type CloneOutput<T, TParams> = DeepReadOnly<Omit<T, keyof TParams> & TParams>

// TODOD:
// type test = CloneParams<Proto3MessageOneOfFieldSubField>['type']
// let truc: test = Proto3Message.new({
//     comments: [],
//     extensions: [],
//     fields: [],
//     name: 'truc',
// })
