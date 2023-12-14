"use strict"
const cors = require("cors")
const express = require("express")
const cookieParser = require("cookie-parser")
const mongoose = require("mongoose")

require("dotenv").config()

const port = process.env.PORT || 80

const app = express()

app.use(
  cors({
    origin: "*",
    credentials: true,
    strict: true,
  })
)

app.use(express.json())
app.use(cookieParser())

app.use("/api/tracker/", require("./src/routes/TrackRouter.js"))

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    // listen to requests
    app.listen(port, () => {
      console.log("connected to db & listening on port ", port)
    })
  })
  .catch((e) => {
    console.log(e)
  })
