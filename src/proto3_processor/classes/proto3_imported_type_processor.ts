import type { FreshFileContentMatter } from '#file/types/content_matter'
import { Proto3ImportedType } from '#proto3_definition/types/imported_type'

export class Proto3ImportedTypeProcessor {
    public constructor(private readonly content: FreshFileContentMatter) {}

    public process(imported: Proto3ImportedType): void {
        this.content.write(`import "${imported.importPath}";`)
    }
}
