import type { DeepReadOnly } from '#core/types/deep_read_only'
import type {
    AnyFileContentMatter,
    FileContentMatter,
    FreshFileContentMatter,
    NestedFileContentMatter,
} from '#file/types/content_matter'
import type { DynamicSettings } from '#file/types/settings'

export class $FileContentMatter {
    readonly #settings: DynamicSettings = {
        lineTabLevel: 0,
        blockLevel: 0,
    }
    readonly #sources: string[] = ['']

    public get settings(): DeepReadOnly<DynamicSettings> {
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

    public indent(): FileContentMatter<DynamicSettings> {
        this.#settings.lineTabLevel += 1

        return this
    }

    public outdent(): FileContentMatter<DynamicSettings> {
        if (this.#settings.lineTabLevel === 0) {
            throw new Error('You should indent before calling the outdent method')
        }

        this.safeDecreaseLineTabLevel()

        return this
    }

    public openBlock(): FileContentMatter<DynamicSettings> {
        this.write(this.config.openingBlockCharacter)

        this.#settings.lineTabLevel += 1
        this.#settings.blockLevel += 1

        this.endLine()

        return this
    }

    public closeBlock(): FileContentMatter<DynamicSettings> {
        if (this.#settings.blockLevel === 0) {
            throw new Error('You should open a block before calling the clone method')
        }

        this.safeDecreaseLineTabLevel()
        this.safeDecreaseBlockLevel()

        this.endLine()

        this.write(this.config.closingBlockCharacter)

        return this
    }

    private popLastSource(): string {
        const lastSource = this.#sources.pop()

        if (lastSource === undefined) {
            throw new Error('The source should never be empty')
        }

        return lastSource
    }

    public write(
        data: string | AnyFileContentMatter
    ): FileContentMatter<DynamicSettings> {
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

    public endLine(): FileContentMatter<DynamicSettings> {
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

    public singleNest(): NestedFileContentMatter {
        return this
    }

    public writeBlock(content: AnyFileContentMatter): FileContentMatter<DynamicSettings> {
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

export const fileContentMatter = function (): FreshFileContentMatter {
    return new $FileContentMatter({
        lineTabCharacter: '  ',
        openingBlockCharacter: '{',
        closingBlockCharacter: '}',
    }) as FreshFileContentMatter
}
