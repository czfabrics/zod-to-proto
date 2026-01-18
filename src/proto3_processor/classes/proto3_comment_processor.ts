import type { FileContentMatter } from '#file/types/content_matter'

export class Proto3CommentProcessor {
    public constructor(private readonly content: FileContentMatter) {}

    public process(comments: string[]): void {
        let isFirst = true

        for (const comment of comments) {
            if (!isFirst) {
                this.content.endLine()
            }

            this.content.write(`// ${comment}`)

            isFirst = false
        }

        if (!this.content.isEmpty()) {
            this.content.endLine()
        }
    }
}
