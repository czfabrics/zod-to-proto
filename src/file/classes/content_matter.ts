import type { DeepReadOnly } from '#core/types/read_only'
import type { FileContentMatter } from '#file/types/content_matter'

export class $FileContentMatter {
    readonly #settings = {
        lineTabLevel: 0,
        blockLevel: 0,
        listLevel: 0,
    }
    readonly #sources: string[] = ['']

    public get settings(): DeepReadOnly<{
        lineTabLevel: number
        blockLevel: number
        listLevel: number
    }> {
        return this.#settings
    }

    public get ['~sources'](): DeepReadOnly<string[]> {
        return this.#sources
    }

    public constructor(
        private readonly config: DeepReadOnly<{
            lineTabCharacter: string
            openingBlockCharacter: string
            closingBlockCharacter: string
            openingListCharacter: string
            closingListCharacter: string
            listSeparatorCharacter: string
            recordKeyValueSeparatorCharacter: string
            recordEntrySeparatorCharacter: string
        }>
    ) {}

    private safeDecreaseLineTabLevel(): void {
        if (this.#settings.lineTabLevel > 0) {
            this.#settings.lineTabLevel -= 1
        }
    }

    private safeDecreaseBlockLevel(): void {
        if (this.#settings.blockLevel > 0) {
            this.#settings.blockLevel -= 1
        }
    }

    private safeDecreaseListLevel(): void {
        if (this.#settings.listLevel > 0) {
            this.#settings.listLevel -= 1
        }
    }

    public indent(): FileContentMatter {
        this.#settings.lineTabLevel += 1

        return this
    }

    public outdent(): FileContentMatter {
        if (this.#settings.lineTabLevel === 0) {
            throw new Error('You should indent before calling the outdent method')
        }

        this.safeDecreaseLineTabLevel()

        return this
    }

    public openBlock(): FileContentMatter {
        this.write(this.config.openingBlockCharacter)

        this.#settings.lineTabLevel += 1
        this.#settings.blockLevel += 1

        this.endLine()

        return this
    }

    public closeBlock(): FileContentMatter {
        if (this.#settings.blockLevel === 0) {
            throw new Error('You should open a block before calling the close method')
        }

        this.safeDecreaseLineTabLevel()
        this.safeDecreaseBlockLevel()

        this.endLine()

        this.write(this.config.closingBlockCharacter)

        return this
    }

    public openList(): FileContentMatter {
        this.write(this.config.openingListCharacter)

        this.#settings.lineTabLevel += 1
        this.#settings.listLevel += 1

        this.endLine()

        return this
    }

    public closeList(): FileContentMatter {
        if (this.#settings.listLevel === 0) {
            throw new Error('You should open an array before calling the close method')
        }

        this.safeDecreaseLineTabLevel()
        this.safeDecreaseListLevel()

        this.endLine()

        this.write(this.config.closingListCharacter)

        return this
    }

    private popLastSource(): string {
        const lastSource = this.#sources.pop()

        if (lastSource === undefined) {
            throw new Error('The source should never be empty')
        }

        return lastSource
    }

    public write(data: string | FileContentMatter): FileContentMatter {
        if (typeof data === 'string') {
            let lastSource = this.popLastSource()

            const updatedSource = `${lastSource}${data}`

            this.#sources.push(updatedSource)
        } else {
            let isFirst = true

            for (const source of data['~sources']) {
                if (!isFirst) {
                    this.endLine()
                }

                this.write(source)

                isFirst = false
            }
        }

        return this
    }

    public writeIf(
        condition: boolean,
        data: string | FileContentMatter
    ): FileContentMatter {
        if (condition) {
            return this.write(data)
        }

        return this
    }

    public endLine(): FileContentMatter {
        let newLine = ''

        for (
            let currentLevel = 0;
            currentLevel < this.#settings.lineTabLevel;
            currentLevel++
        ) {
            newLine += this.config.lineTabCharacter
        }

        this.#sources.push(newLine)

        return this
    }

    public writeBlock(content: FileContentMatter): FileContentMatter {
        if (content.isEmpty()) {
            this.write(this.config.openingBlockCharacter).write(
                this.config.closingBlockCharacter
            )

            return this
        }

        this.openBlock()

        let isFirst = true

        for (const source of content['~sources']) {
            if (!isFirst) {
                this.endLine()
            }

            this.write(source)

            isFirst = false
        }

        this.closeBlock()

        return this
    }

    public writeList(...contents: FileContentMatter[]): FileContentMatter {
        if (contents.length === 0) {
            this.write(this.config.openingListCharacter).write(
                this.config.closingListCharacter
            )

            return this
        }

        this.openList()

        let isFirstContent = true

        for (const content of contents) {
            if (!isFirstContent) {
                this.write(this.config.listSeparatorCharacter).endLine()
            }

            let isFirstSource = true

            for (const source of content['~sources']) {
                if (!isFirstSource) {
                    this.endLine()
                }

                this.write(source)

                isFirstSource = false
            }

            isFirstContent = false
        }

        this.closeList()

        return this
    }

    public writeRecord(
        ...entries: { key: string; content: FileContentMatter }[]
    ): FileContentMatter {
        if (entries.length === 0) {
            this.write(this.config.openingBlockCharacter).write(
                this.config.closingBlockCharacter
            )

            return this
        }

        this.openBlock()

        let isFirstContent = true

        for (const entry of entries) {
            if (!isFirstContent) {
                this.write(this.config.listSeparatorCharacter).endLine()
            }

            this.write(`${entry.key}${this.config.recordKeyValueSeparatorCharacter}`)

            let isFirstSource = true

            for (const source of entry.content['~sources']) {
                if (!isFirstSource) {
                    this.endLine()
                }

                this.write(source)

                isFirstSource = false
            }

            isFirstContent = false
        }

        this.closeBlock()

        return this
    }

    public isEmpty(): boolean {
        if (this.#sources.length === 0) {
            return true
        }

        if (this.#sources.length === 1) {
            return this.#sources[0] === ''
        }

        return false
    }
}

export const fileContentMatter = function (): FileContentMatter {
    return new $FileContentMatter({
        lineTabCharacter: '  ',
        openingBlockCharacter: '{',
        closingBlockCharacter: '}',
        openingListCharacter: '[',
        closingListCharacter: ']',
        listSeparatorCharacter: ',',
        recordKeyValueSeparatorCharacter: ': ',
        recordEntrySeparatorCharacter: ',',
    })
}
