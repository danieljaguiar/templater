import Logger from 'electron-log'

export enum Level {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

export enum Source {
  UPDATER = 'updater',
  LIFECYCLE = 'lifecycle',
  DIRECTORY = 'dir_manager'
}

export class AppLogger {
  private source: Source

  constructor(source: Source) {
    this.source = source
  }

  private log(level: Level, message: string, source?: Source): void {
    const sourceToUse = source || this.source
    const formattedMessage = `[${sourceToUse}] ${message}`

    switch (level) {
      case Level.INFO:
        Logger.info(formattedMessage)
        break
      case Level.WARN:
        Logger.warn(formattedMessage)
        break
      case Level.ERROR:
        Logger.error(formattedMessage)
        break
      default:
        Logger.info(formattedMessage)
    }
  }

  info(message: string, source?: Source): void {
    this.log(Level.INFO, message, source)
  }

  warn(message: string, source?: Source): void {
    this.log(Level.WARN, message, source)
  }

  error(message: string, source?: Source): void {
    this.log(Level.ERROR, message, source)
  }
}
