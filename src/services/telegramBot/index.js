const config = require('../../../config.json')
const { Telegraf } = require('telegraf')

const formatTextForMarkdownV2 = text => text.replace(/\_/g, '\\_')
    .replace(/\*/g, '\\*')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/\~/g, '\\~')
    .replace(/\`/g, '\\`')
    .replace(/\>/g, '\\>')
    .replace(/\#/g, '\\#')
    .replace(/\+/g, '\\+')
    .replace(/\-/g, '\\-')
    .replace(/\=/g, '\\=')
    .replace(/\|/g, '\\|')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/\./g, '\\.')
    .replace(/\!/g, '\\!')


// ctx.replyWithHTML(`
// <b>Total Result</b>
// 📈 profit: ${formatNumber(result.totalProfit)}$
// 📉 spend: ${formatNumber(result.totalSpend)}$
// 💵 balance: ${formatNumber(result.totalBalance)}$
// ${errorsLine}
//             `)

const idGenerator = () => {
    let id = 0
    return () => id++
}
const getId = idGenerator()

class TelegramBot {
    constructor(token, userId) {
        this.bot = new Telegraf(token)
        this.bot.launch()
        this.userId = userId
        this.state = {}
        this.initListeners()
    }

    withAuthCheck(callback) {
        return (ctx) => {
            if (this.userId !== ctx.update.message.from.id) {
                return undefined
            }

            return callback(ctx)
        }
    }

    initListeners() {
        // this.bot.on('message', this.withAuthCheck(async (ctx) => {
        //     console.log('sticker', ctx.update.message.sticker);
        // }))
        // this.bot.command('pausetrade', this.withAuthCheck(async (ctx) => {
        //     this.pauseTrade()
        //     ctx.reply('paused')
        // }))
        this.bot.command('stat', this.withAuthCheck((ctx) => {
            ctx.reply('Stat')
            // if (Object.keys(this.state).length === 0) {
            //     ctx.reply('no statistic yet')
            //     return
            // }
        }))
    }

    async run() {
        if (this.state.length === 0) {
            console.log('No updates')
            return
        }
        console.log('sending updates to telegram...')

        for (const { link, hostData, price, address, description, publishingDateInfo } of this.state) {
            const priceStr = price ? `*price*: ${formatTextForMarkdownV2(price)}` : ''
            const hostPhoneStr = hostData?.phone ? `*phone*: \\+48 ${formatTextForMarkdownV2(hostData.phone)}` : ''
            const hostNameStr = hostData?.name ? `*owner*: ${formatTextForMarkdownV2(hostData.name)}` : ''
            const addressStr = address ? `🏠 *${formatTextForMarkdownV2(address)}*` : ''
            const publishingDateInfoStr = publishingDateInfo ? formatTextForMarkdownV2(publishingDateInfo) : ''
            await this.bot.telegram.sendMessage(this.userId, `${addressStr}
\\_
${priceStr}
${hostPhoneStr}
${hostNameStr}
${publishingDateInfoStr}
`, { parse_mode: "MarkdownV2" })

            await this.bot.telegram.sendMessage(this.userId, config.templateMsg.replace('${link}', link))
        }
    }

    setState(newState = []) {
        this.state = newState.map((item) => ({ ...item, id: getId() }))
    }
}

module.exports = TelegramBot
