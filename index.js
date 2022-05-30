require('dotenv').config()
const config = require('./config.json')
const runSiteParsing = require('./src/services/parserBot/index.js')
const TelegramBot = require('./src/services/telegramBot/index.js')

const BACKUP_FOLDER = './data'

if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.USER_ID) {
    throw new Error('Missed required ENVs')
}

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const USER_ID = +process.env.USER_ID

const MyTelegramBot = new TelegramBot(TELEGRAM_BOT_TOKEN, USER_ID)

let round = 0

const main = async () => {
    console.log('round: ', round++)
    const data = await runSiteParsing(BACKUP_FOLDER)
    MyTelegramBot.setState(data)
    await MyTelegramBot.run()
    console.log(`done, next round is in ${config.rerunTime} ms`)
    setTimeout(main, config.rerunTime)
}

main()
