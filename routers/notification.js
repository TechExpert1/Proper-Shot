const {
    notifications,
    deletenotifications,
    deletenotificationsbyuser
}=require("../controllers/notificationcontroller")

const router=require("express").Router()
router.get("/getnotification/:userId",notifications)
router.delete("/deletenotification/:notificationId",deletenotifications)
router.delete("/clearnotification/:userId",deletenotificationsbyuser)

module.exports=router