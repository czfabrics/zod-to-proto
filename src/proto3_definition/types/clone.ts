import { DeepReadOnly } from '#proto3_definition/types/deep_read_only'
import { GetNewParams } from '#proto3_definition/types/get_new_params'

export type CloneParams<T> =
    | Partial<GetNewParams<T>>
    | Partial<GetNewParams<DeepReadOnly<T>>>
