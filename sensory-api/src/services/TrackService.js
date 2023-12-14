const Tracker = require("../models/Tracker")
const mongoose = require("mongoose")
const fs = require("fs").promises
const cron = require("node-cron")
const crypto = require("crypto")
const axios = require("axios")
const puppeteer = require("puppeteer")
const path = require("path")

// Go up two directories from current file's location, then into the 'textfiles' directory
const hashFile = path.join(__dirname, "..", "textfiles", "hash.txt")
const contentFile = path.join(__dirname, "..", "textfiles", "html.txt")

// const url = "https://ryamada1015.github.io/"

let statusCode,
  isUp,
  responseTime,
  contentHash,
  networkActivity,
  cookies,
  loadTime

let url

async function computeHash(content) {
  return crypto.createHash("sha256").update(content).digest("hex")
}

async function storeHashAndContent(hash, content) {
  await fs.writeFile(hashFile, hash)
  await fs.writeFile(contentFile, content)
}

async function fetchWebsiteContent(url) {
  try {
    const response = await axios.get(url)
    const newHash = await computeHash(response.data)
    return [newHash, response.data]
  } catch (error) {
    console.error("Error fetching the website: ", error)
    return null
  }
}

async function updateDatabaseAndNotify(url, newData) {
  try {
    console.log(`URL type: ${typeof url}, URL value: ${url}`)

    let urlString = typeof url === "string" ? url : String(url)

    // Always create a new tracker record
    let tracker = new Tracker({
      url: urlString,
      ...newData,
      timestamp: new Date(),
    })
    console.log(`Creating new tracker record for URL: ${urlString}`)

    await tracker.save()
    console.log(`New database record created for URL: ${urlString}`)

    // check for changes
    const lastRecord = await Tracker.findOne({ url: urlString }).sort({
      timestamp: -1,
    })
    console.log(lastRecord)

    let message = ""
    let changeDetected = true
    if (lastRecord) {
      if (lastRecord.statusCode != newData.statusCode)
        message += "Status code has changed.\n"
      if (lastRecord.isUp != newData.isUp) message += "Uptime has changed.\n"
      if (lastRecord.contentHash != newData.contentHash)
        message += "Content has changed.\n"
      if (lastRecord.networkActivity != newData.networkActivity)
        message += "Network activity has changed.\n"
      if (lastRecord.cookies != newData.cookies)
        message += "Cookies has changed.\n"
      if (lastRecord.responseTime != newData.responseTime)
        message += "Response time has changed.\n"
      if (lastRecord.loadTime != newData.loadtTime)
        message += "Load time has changed.\n"
    } else {
      message = "No changes detected."
      changeDetected = false
    }
    console.log(message)

    // send a notification
    // const twilio = require("twilio")
    // const client = twilio("My_Twilio_Account_SID", "My_Twilio_Auth_Token")

    // if (changeDetected) {
    //   client.messages
    //     .create({
    //       body: "A change was detected on the website.",
    //       from: "Your_Twilio_Phone_Number",
    //       to: "Recipient_Phone_Number",
    //     })
    //     .then((message) => console.log("Notification sent:", message.sid))
    //     .catch((error) => console.error("Error sending notification:", error))
    // }
  } catch (error) {
    console.error(`Error updating database for URL ${url}: ${error.message}`)
  }
}

class TrackService {
  static async checkUptime() {
    console.log(`Checking uptime for URL: ${url} (Type: ${typeof url})`)
    try {
      await axios.get(url)
      isUp = true
    } catch (error) {
      isUp = false // The site is down or unreachable
    }
  }

  static async checkResponseTime() {
    const start = new Date()
    console.log(`Checking response time for URL: ${url} (Type: ${typeof url})`)
    try {
      const end = new Date()
      responseTime = end - start // Response time in milliseconds
      console.log(
        `${new Date().toISOString()} - Response time for ${url}: ${responseTime} ms`
      )
    } catch (error) {
      console.error(`Error checking response time for ${url}`)
    }
  }

  static async checkLoadTime() {
    console.log(`Checking load time for URL: ${url} (Type: ${typeof url})`)

    const browser = await puppeteer.launch()
    const page = await browser.newPage()

    const start = new Date()
    await page.goto(url, { waitUntil: "load" })
    const end = new Date()

    loadTime = end - start // Load time in milliseconds
    console.log(
      `${new Date().toISOString()} - Load time for ${url}: ${loadTime} ms`
    )
    await browser.close()
  }

  static async checkNetworkActivity() {
    console.log(
      `Checking network activity for URL: ${url} (Type: ${typeof url})`
    )

    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    let requests = []
    let responses = []
    let statuses = []
    networkActivity = []

    // Capture all network requests and responses
    page.on("request", (request) => {
      console.log(`Request: ${request.url()}`)
      requests.push(request.url())
    })

    page.on("response", (response) => {
      responses.push(response.url())
      statuses.push(response.status())
      console.log(`Response: ${response.url()} - Status: ${response.status()}`)
    })

    await page.goto(url, { waitUntil: "networkidle2" })

    networkActivity.push(requests, responses, statuses)

    await browser.close()
  }

  static async getCookies() {
    console.log(`Checking cookies for URL: ${url} (Type: ${typeof url})`)

    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto(url)
    cookies = await page.cookies()
    console.log(`Cookies for ${url}:`, cookies)

    await browser.close()
  }

  static async checkContentChanges() {
    console.log(
      `Detecting content changes for URL: ${url} (Type: ${typeof url})`
    )
    try {
      const storedHash = await fs.readFile(hashFile, "utf8")
      const storedContent = await fs.readFile(contentFile, "utf8")

      const [newHash, newContent] = await fetchWebsiteContent(url)

      await storeHashAndContent(newHash, newContent)

      contentHash = newHash

      if (storedHash && newHash !== storedHash) {
        console.log("Content has changed.")

        const oldLines = storedContent.split("\n")
        const newLines = newContent.split("\n")

        oldLines.forEach((line, index) => {
          const trimmedOldLine = line.trim()
          const trimmedNewLine = newLines[index].trim()

          if (trimmedOldLine !== trimmedNewLine) {
            console.log(`Line ${index + 1} changed:`)
            console.log(`- Old: ${trimmedOldLine}`)
            console.log(`+ New: ${trimmedNewLine}`)
            console.log(
              `- Old char codes: ${trimmedOldLine
                .split("")
                .map((c) => c.charCodeAt(0))}`
            )
            console.log(
              `+ New char codes: ${trimmedNewLine
                .split("")
                .map((c) => c.charCodeAt(0))}`
            )
          }
        })
      } else {
        console.log("No changes detected.")
      }
    } catch (error) {
      console.error("Error during check:", error)
    }
  }

  static async deleteTracker(req, res) {
    const { id } = req.params

    // if id not valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "No such entry" })
    }

    const tracker = await Tracker.findOneAndDelete({ _id: id })
    console.log(`Deleted an entry with id: ${id}`)

    if (!tracker) {
      return res.status(400).json({ error: "No such entry" })
    }

    res.status(200).json(tracker)
  }

  static async deleteAllTrackers(req, res) {
    try {
      const result = await Tracker.deleteMany({})

      // If no documents were deleted, result.deletedCount will be 0
      if (result.deletedCount === 0) {
        return res.status(404).json({ message: "No trackers to delete." })
      }

      console.log(`Deleted ${result.deletedCount} entries.`)
      res
        .status(200)
        .json({ message: `Deleted ${result.deletedCount} entries.` })
    } catch (error) {
      console.error("Error deleting trackers:", error)
      res
        .status(500)
        .json({ error: "An error occurred while deleting trackers" })
    }
  }
}

async function monitor(req, res) {
  try {
    url = req.params.url
    console.log(`Started monitoring ${url}`)
    res.status(200).json({ message: `Started monitoring ${url}` })
  } catch (error) {
    return res.status(400).json({ error: "URL not found." })
  }

  cron.schedule("* * * * *", async () => {
    await TrackService.checkContentChanges()
    await TrackService.checkUptime()
    await TrackService.checkResponseTime()
    await TrackService.checkNetworkActivity()
    await TrackService.getCookies()
    await TrackService.checkLoadTime()
    await updateDatabaseAndNotify(url, {
      statusCode: statusCode,
      isUp: isUp,
      responseTime: responseTime,
      contentHash: contentHash,
      networkActivity: networkActivity,
      cookies: cookies,
      loadTime: loadTime,
    })
  })
}

module.exports = { TrackService, monitor }
