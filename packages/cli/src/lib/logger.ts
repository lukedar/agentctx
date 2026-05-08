import pc from 'picocolors'

export type LogLevel = 'info' | 'success' | 'warn' | 'error'

const symbol = (level: LogLevel): string => {
  switch (level) {
    case 'success':
      return pc.green('✔')
    case 'warn':
      return pc.yellow('⚠')
    case 'error':
      return pc.red('✖')
    default:
      return pc.cyan('ℹ')
  }
}

export const log = (level: LogLevel, message: string): void => {
  // Keep output short and stable.
  // eslint-disable-next-line no-console
  console.log(`${symbol(level)} ${message}`)
}
