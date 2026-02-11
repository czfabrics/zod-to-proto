import type { FileContentMatter } from '#file/types/content_matter'
import type { ReadOnlyProto3ImportedType } from '#proto3_definition/types/types'

export class Proto3ImportProcessor {
    public constructor(private readonly content: FileContentMatter) {}

    public process(importedTypes: readonly ReadOnlyProto3ImportedType[]): void {
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
