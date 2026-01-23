import { CommandHandler } from "../types/Terminal"

const commands: Record<string, CommandHandler> = {
  help: () => ({
    output: `
Available commands:
help       show this help
clear      clear screen
echo       print text
date       show date
whoami    current user
`
  }),

  clear: () => ({ output: "", clear: true }),

  echo: args => ({
    output: args.join(" ")
  }),

  date: () => ({
    output: new Date().toString()
  }),

  whoami: () => ({
    output: "nova-user"
  })
}

export function runCommand(input: string) {
  const [cmd, ...args] = input.trim().split(" ")
  const handler = commands[cmd]

  if (!handler) {
    return { output: `command not found: ${cmd}` }
  }

  return handler(args)
}
