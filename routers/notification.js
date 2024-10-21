const {
    notifications,
    deletenotifications
}=require("../controller/notificationcontroller")

const router=require("express").Router()
router.get("/getnotification/:userId",notifications)
router.delete("/deletenotification/:notificationId",deletenotifications)

module.exports=router