import type { AnyFileContentMatter } from '#file/types/content_matter'

export class FileBuilder {
    public constructor(public readonly content: AnyFileContentMatter) {}

    public compute(): string {
        const computedSources = this.content['~sources'].join('\n')

        return computedSources
    }
}
