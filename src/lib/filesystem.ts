export type FileType = "file" | "folder"

export interface FSItem {
  id: string
  name: string
  type: FileType
  content?: string
}
