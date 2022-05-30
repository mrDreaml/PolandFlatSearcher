const puppeteer = require('puppeteer')
const fs = require('node:fs')
const path = require('node:path')

const runOtodomParser = require('./otodomParser.js')
const runOlxParser = require('./olxParser.js')

const config = require('../../../config.json')

const init = async () => {
  const browser = await puppeteer.launch({ headless: config.puppeteerHeadless })
  const page = await browser.newPage()
  await page.setViewport({ width: 1366, height: 768 })
  return { page, browser }
}

const getSavedData = (dataPath) => {
  const rootFolder = process.cwd()
  const filePath = path.resolve(rootFolder, dataPath, 'usedLinksData.json')
  return JSON.parse(fs.readFileSync(filePath, { encoding: 'utf-8' }))
}

const getNewData = (dataPath, savedData, data) => {
  const newData = data.filter(item => !savedData.links[item.link])
  const newBackup = {
    links: {
      ...savedData.links,
      ...newData.reduce((acc, item) => {
        acc[item.link] = true
        return acc
      }, {})
    },
  }
  const rootFolder = process.cwd()
  const filePath = path.resolve(rootFolder, dataPath, 'usedLinksData.json')
  fs.writeFileSync(filePath, JSON.stringify(newBackup, undefined, 2))
  console.log('Backup was saved successfully')
  return newData
}

/**
 * @param dataPath
 * @returns {Promise<{ link, hostData, price, address, description, publishingDateInfo }[]>}
 */
const main = async (dataPath) => {
  let parsedData
  const { page, browser } = await init()
  const savedData = getSavedData(dataPath)
  try {
    const parsedOtodomData = await runOtodomParser(page, savedData)
    const parsedOlxData = await runOlxParser(page, savedData)
    parsedData = [...parsedOtodomData, ...parsedOlxData]
  } catch (e) {
    console.error(e)
    console.info('Something went wrong during parsing')
  }
  await browser.close()
  return parsedData && getNewData(dataPath, savedData, parsedData)
}

module.exports = main
