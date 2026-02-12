import type { DeepReadOnly } from '#core/types/read_only'

export type FileContentMatter = {
    /**
     * @deprecated internal api (not deprecated)
     */
    ['~sources']: DeepReadOnly<string[]>
    settings: DeepReadOnly<{
        lineTabLevel: number
        blockLevel: number
        listLevel: number
    }>
    write: (content: string | FileContentMatter) => FileContentMatter
    writeIf: (
        condition: boolean,
        content: string | FileContentMatter
    ) => FileContentMatter
    endLine: () => FileContentMatter
    writeBlock: (content: FileContentMatter) => FileContentMatter
    writeList: (...contents: FileContentMatter[]) => FileContentMatter
    writeRecord: (
        ...entries: {
            key: string
            content: FileContentMatter
        }[]
    ) => FileContentMatter
    isEmpty: () => boolean
}
