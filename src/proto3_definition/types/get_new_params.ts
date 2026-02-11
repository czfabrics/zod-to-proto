import { DeepReadOnly } from '#proto3_definition/types/deep_read_only'

export type GetNewParams<T> =
    | Omit<
          T,
          | 'id'
          | 'internalName'
          | 'clone'
          | 'addPrefix'
          | 'propagateTypePrefix'
          | 'computeNewIndexForFields'
          | 'getDeepMessages'
          | 'getDeepImportedTypes'
          | 'getNextIndex'
      >
    | DeepReadOnly<
          Omit<
              T,
              | 'id'
              | 'internalName'
              | 'clone'
              | 'addPrefix'
              | 'propagateTypePrefix'
              | 'computeNewIndexForFields'
              | 'getDeepMessages'
              | 'getDeepImportedTypes'
              | 'getNextIndex'
          >
      >

export type GetOverrideParams<T> =
    | Omit<
          T,
          | 'internalName'
          | 'clone'
          | 'addPrefix'
          | 'propagateTypePrefix'
          | 'computeNewIndexForFields'
          | 'getDeepMessages'
          | 'getDeepImportedTypes'
          | 'getNextIndex'
      >
    | DeepReadOnly<
          Omit<
              T,
              | 'internalName'
              | 'clone'
              | 'addPrefix'
              | 'propagateTypePrefix'
              | 'computeNewIndexForFields'
              | 'getDeepMessages'
              | 'getDeepImportedTypes'
              | 'getNextIndex'
          >
      >

export type GetAnyNewParams<T> = Omit<
    T,
    | 'id'
    | 'clone'
    | 'addPrefix'
    | 'propagateTypePrefix'
    | 'computeNewIndexForFields'
    | 'getDeepMessages'
    | 'getDeepImportedTypes'
    | 'getNextIndex'
>
