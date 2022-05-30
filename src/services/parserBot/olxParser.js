const helper = require('./puppeteerHelper.js')

const config = require('../../../config.json')

const LOGIN_URL = 'https://www.olx.pl/d/mojolx/#login'
const MAIN_URL = config.olxUrlWithFilters
const CLOSE_POPUP_BUTTON_SELECTOR = '#onetrust-accept-btn-handler'
const MAIN_LIST_SELECTOR = '[data-testid="listing-grid"]'
const LIST_ITEMS_SELECTOR = '[data-testid="listing-grid"] div:not([id])'
const TITLE_SELECTOR = '[data-cy="ad_title"]'
const CHAT_WRAPPER_SELECTOR = '[data-testid="chat-wrapper"]'
const PRICE_SELECTOR = '[data-testid=ad-price-container]'
const PUBLISHING_DATE_INFO_SELECTOR = '[data-cy="ad-posted-at"]'
const NAME_SELECTOR = '[data-testid="chat-wrapper"] div div div div div:nth-child(2) h4' // TODO: unstable!
const SHOW_NUMBER_BUTTON = '[data-testid="show-phone"]'
const PHONE_NUMBER_SELECTOR = '[data-testid="contact-phone"]'

const LOGIN_EMAIL_SELECTOR = '#userEmail'
const LOGIN_PASSWORD_SELECTOR = '#userPass'
const LOGIN_SUBMIT_BUTTON_SELECTOR = '#se_userLogin'

/**
 * @param page puppeteer page
 * @param savedData - { links: {} }
 * @returns {Promise<{ link, hostData, price, address, description, publishingDateInfo }[]>}
 */
const run = async (page, savedData) => {
    const { wait, click, scrollIntoView, typeInput } = helper(page)

    // await page.goto(LOGIN_URL)
    // await click(CLOSE_POPUP_BUTTON_SELECTOR)
    // await typeInput(LOGIN_EMAIL_SELECTOR, '')
    // await typeInput(LOGIN_PASSWORD_SELECTOR, '')
    // await wait(1000)
    // await click(LOGIN_SUBMIT_BUTTON_SELECTOR)
    // await page.waitForNavigation()

    await page.goto(MAIN_URL)
    await scrollIntoView(MAIN_LIST_SELECTOR)


    const links = (await page.evaluate(
        s => [...document.querySelectorAll(s)].map(node => node.childNodes[0]?.href).filter(v => v)
        , LIST_ITEMS_SELECTOR
    )).slice(0, config.olxPagesLim).filter(link => !savedData?.links?.[link])

    const res = []
    for (const link of links) {
        await page.goto(link)

        await wait(1000)
        await scrollIntoView(TITLE_SELECTOR).catch(e => e)
        const address = await page.$eval(TITLE_SELECTOR, el => el.textContent).catch(_e => console.error(`Can't get address for ${link}`))
        const price = await page.$eval(PRICE_SELECTOR, el => el.textContent).catch(_e => console.error(`Can't get price for ${link}`))
        const publishingDateInfo = await page.$eval(PUBLISHING_DATE_INFO_SELECTOR, el => el.textContent).catch(_e => console.error(`Can't get publishingDateInfo for ${link}`))
        const hasError = await scrollIntoView(CHAT_WRAPPER_SELECTOR).catch(_e => true)
        if (hasError) {
            continue
        }
        const name = await page.$eval(NAME_SELECTOR, el => el.textContent).catch(_e => console.error(`Can't get name for ${link}`))
        // await wait(1500)
        // await click(SHOW_NUMBER_BUTTON).catch(_e => console.error(`Can't get phone number for ${link}`))
        // await wait(1500)
        // const phone = await page.$eval(PHONE_NUMBER_SELECTOR, el => el.textContent).catch(_e => console.error(`Can't get phone for ${link}`))
        res.push({ link, hostData: { name, phone: 'not parsed' }, price, address, publishingDateInfo })
    }

    return res
}

module.exports = run