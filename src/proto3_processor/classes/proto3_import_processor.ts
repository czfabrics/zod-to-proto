import type { FreshFileContentMatter } from '#file/types/content_matter'
import { Proto3ImportedType } from '#proto3_definition/types/imported_type'

export class Proto3ImportProcessor {
    public constructor(private readonly content: FreshFileContentMatter) {}

    public process(importedTypes: Proto3ImportedType[]): void {
        let isFirst = true

        const importPaths = importedTypes.map((importedType) => importedType.importPath)
        const uniqueImportPaths = new Set(importPaths)

        for (const importPath of uniqueImportPaths) {
            if (!isFirst) {
                this.content.endLine()
            }

            this.content.write(`import "${importPath}";`)

            isFirst = false
        }
    }
}
