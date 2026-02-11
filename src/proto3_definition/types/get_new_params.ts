import { DeepReadOnly } from '#proto3_definition/types/deep_read_only'

export type GetNewParams<T> =
    | Omit<
          T,
          | 'id'
          | 'internalName'
          | 'clone'
          | 'updateDeepInnerType'
          | 'addPrefix'
          | 'propagateTypePrefix'
          | 'computeNewIndexForFields'
          | 'getDeepMessages'
          | 'getDeepImportedTypes'
          | 'getDeepInnerType'
          | 'getNextIndex'
      >
    | DeepReadOnly<
          Omit<
              T,
              | 'id'
              | 'internalName'
              | 'clone'
              | 'updateDeepInnerType'
              | 'addPrefix'
              | 'propagateTypePrefix'
              | 'computeNewIndexForFields'
              | 'getDeepMessages'
              | 'getDeepImportedTypes'
              | 'getDeepInnerType'
              | 'getNextIndex'
          >
      >

export type GetOverrideParams<T> =
    | Omit<
          T,
          | 'internalName'
          | 'clone'
          | 'updateDeepInnerType'
          | 'addPrefix'
          | 'propagateTypePrefix'
          | 'computeNewIndexForFields'
          | 'getDeepMessages'
          | 'getDeepImportedTypes'
          | 'getDeepInnerType'
          | 'getNextIndex'
      >
    | DeepReadOnly<
          Omit<
              T,
              | 'internalName'
              | 'clone'
              | 'updateDeepInnerType'
              | 'addPrefix'
              | 'propagateTypePrefix'
              | 'computeNewIndexForFields'
              | 'getDeepMessages'
              | 'getDeepImportedTypes'
              | 'getDeepInnerType'
              | 'getNextIndex'
          >
      >

export type GetAnyNewParams<T> = Omit<
    T,
    | 'id'
    | 'clone'
    | 'updateDeepInnerType'
    | 'addPrefix'
    | 'propagateTypePrefix'
    | 'computeNewIndexForFields'
    | 'getDeepMessages'
    | 'getDeepImportedTypes'
    | 'getDeepInnerType'
    | 'getNextIndex'
>
