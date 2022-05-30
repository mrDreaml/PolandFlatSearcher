const helper = page => ({
    typeInput: async (selectorPath, value) => {
      await page.$eval(selectorPath, (el, value) => el.value = value, value)
    },
    wait: (t = 5000) => new Promise((res) => setTimeout(res, t)),
    click: async (selector, { timeout = 3000 } = {}) => {
      await page.waitForSelector(selector, { timeout })
      await page.click(selector)
    },
    scrollIntoView: selector => page.$eval(selector, el => el.scrollIntoView()),
  })

module.exports = helper
