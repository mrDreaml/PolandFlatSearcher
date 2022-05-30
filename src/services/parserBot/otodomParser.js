const helper = require('./puppeteerHelper.js')

const config = require('../../../config.json')

const MAIN_URL = config.otodomUrlWithFilters
const CLOSE_POPUP_BUTTON_SELECTOR = '#onetrust-accept-btn-handler'
const MAIN_LIST_SELECTOR = '[data-cy="search.listing"]:nth-child(2)'
const LIST_ITEMS_SELECTOR = '[data-cy="search.listing"]:nth-child(2) ul'
const HOST_DATA_BLOCK_SELECTOR = '#__next > main > div.css-1r3hfb4.e1t9fvcw6 > aside > div > div.css-ilnx5o.e1lftxah0 > div'
const SHOW_NUMBER_BUTTON = '[data-cy="phone-number.show-full-number-button"]'
const PRICE_SELECTOR = '[data-cy="adPageHeaderPrice"]'
const ADDRESS_SELECTOR = '[aria-label="Adres"]'
const DESCRIPTION_SELECTOR = '[data-cy="adPageAdDescription"]'
const PUBLISHING_DATE_INFO_SELECTOR = '#__next > main > div.css-1r3hfb4.e1t9fvcw6 > div.css-1sxg93g.e1t9fvcw3 > div.css-1u2dm6e.euuef475' // TODO: unstable!

/**
 * @param page puppeteer page
 * @param savedData - { links: {} }
 * @returns {Promise<{ link, hostData, price, address, description, publishingDateInfo }[]>}
 */
const run = async (page, savedData) => {
    const { wait, click, scrollIntoView } = helper(page)

    await page.goto(MAIN_URL)
    await click(CLOSE_POPUP_BUTTON_SELECTOR)
    await scrollIntoView(MAIN_LIST_SELECTOR)


    const links = (await page.$eval(LIST_ITEMS_SELECTOR, el => [...el.childNodes]
        .map(nodeList => nodeList.childNodes[0].href)
        .filter(l => l)
    )).slice(0, config.otodomPagesLim).filter(link => !savedData?.links?.[link])

    const res = []
    for (const link of links) {
        await page.goto(link)

        await wait(700)
        await click(SHOW_NUMBER_BUTTON).catch(_e => console.error(`Can't get phone number for ${link}`))
        const hostData = await page.$eval(HOST_DATA_BLOCK_SELECTOR, el => {
            const { childNodes } = el
            return { name: childNodes[1].textContent, phone: childNodes[3].textContent }
        })
        const price = await page.$eval(PRICE_SELECTOR, el => el.textContent).catch(_e => console.error(`Can't get price for ${link}`))
        const address = await page.$eval(ADDRESS_SELECTOR, el => el.textContent).catch(_e => console.error(`Can't get address for ${link}`))
        const description = await page.$eval(DESCRIPTION_SELECTOR, el => el.textContent).catch(_e => console.error(`Can't get description for ${link}`))
        const publishingDateInfo = await page.$eval(PUBLISHING_DATE_INFO_SELECTOR, el => [...el.childNodes].slice(2).map(el => el.textContent).join())
            .catch(_e => console.error(`Can't get date info for ${link}`))
        res.push({ link, hostData, price, address, description, publishingDateInfo })
    }

    return res
}

module.exports = run