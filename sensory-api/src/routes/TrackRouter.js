const router = require("express").Router()
const { TrackService, monitor } = require("../services/TrackService")

router.post("/monitor/:url", monitor)
router.post("/up-time", TrackService.checkUptime)
router.post("/response-time", TrackService.checkResponseTime)
router.post("/load-time", TrackService.checkLoadTime)
router.post("/network-activity", TrackService.checkNetworkActivity)
router.post("/cookies", TrackService.getCookies)
router.post("/check-for-changes", TrackService.checkContentChanges)

// router.delete
router.delete("/:id", TrackService.deleteTracker)
router.delete("/", TrackService.deleteAllTrackers)

module.exports = router
