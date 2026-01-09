import type { DeepReadOnly } from '#core/types/deep_read_only'
import type {
    DecreaseCounter,
    DynamicSettings,
    IncreaseCounter,
} from '#file/types/settings'

export type FileContentMatterLineTabFn<TSettings extends DynamicSettings> =
    TSettings['lineTabLevel'] extends 0
        ? {
              indent: () => FileContentMatter<
                  IncreaseCounter<TSettings, ['lineTabLevel']>
              >
          }
        : {
              indent: () => FileContentMatter<
                  IncreaseCounter<TSettings, ['lineTabLevel']>
              >
              outdent: () => FileContentMatter<
                  DecreaseCounter<TSettings, ['lineTabLevel']>
              >
          }

export type FileContentMatterBlockFn<TSettings extends DynamicSettings> =
    TSettings['blockLevel'] extends 0
        ? {
              openBlock: () => FileContentMatter<
                  IncreaseCounter<TSettings, ['lineTabLevel', 'blockLevel']>
              >
          }
        : {
              openBlock: () => FileContentMatter<
                  IncreaseCounter<TSettings, ['lineTabLevel', 'blockLevel']>
              >
              closeBlock: () => FileContentMatter<
                  DecreaseCounter<TSettings, ['lineTabLevel', 'blockLevel']>
              >
          }

export type BaseFileContentMatter<TSettings extends DynamicSettings, TExtend> = {
    /**
     * @deprecated internal api (not deprecated)
     */
    ['~sources']: DeepReadOnly<string[]>
    settings: DeepReadOnly<TSettings>
    write: (
        content:
            | string
            | BaseFileContentMatter<{ lineTabLevel: any; blockLevel: any }, {}>
    ) => BaseFileContentMatter<TSettings, TExtend>
    endLine: () => BaseFileContentMatter<TSettings, TExtend>
    singleNest(): NestedFileContentMatter
    writeBlock: (
        content: BaseFileContentMatter<{ lineTabLevel: any; blockLevel: any }, {}>
    ) => BaseFileContentMatter<TSettings, TExtend>
    isEmpty: () => boolean
} & TExtend

export type FileContentMatter<TSettings extends DynamicSettings> = BaseFileContentMatter<
    TSettings,
    FileContentMatterLineTabFn<TSettings> & FileContentMatterBlockFn<TSettings>
>

export type FreshFileContentMatter = FileContentMatter<{
    lineTabLevel: 0
    blockLevel: 0
}>

export type AnyFileContentMatter = BaseFileContentMatter<
    { lineTabLevel: any; blockLevel: any },
    {}
>

export type NestedFileContentMatter = BaseFileContentMatter<
    { lineTabLevel: number; blockLevel: number },
    {}
>
