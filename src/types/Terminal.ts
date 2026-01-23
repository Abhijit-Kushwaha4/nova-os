export interface CommandResult {
  output: string
  clear?: boolean
}

export type CommandHandler = (args: string[]) => CommandResult
