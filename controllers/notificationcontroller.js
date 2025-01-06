  const Notification= require ("../models/Notification")
const  mongoose=require ('mongoose');

const notifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { createdAt: -1 },
      populate: { path: 'sender', select: 'name image' },
    };
    const result = await Notification.paginate({ recipient: userId }, options);
    const responseData = result.docs.map(notification => ({
      _id: notification._id,
      recipient: notification.recipient,
      heading: notification.heading,
      message: notification.message,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
      requestId: notification.requestId,
      params: notification.params,
      sender: notification.sender
        ? {
            _id: notification.sender._id,
            name: notification.sender.name,
            image: notification.sender.image,
          }
        : null,
    }));

    res.status(200).json({
      status: 'success',
      totalDocs: result.totalDocs,
      totalPages: result.totalPages,
      currentPage: result.page,
      limit: result.limit,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      data: responseData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
};


//   api for delete the notification

const deletenotifications = async (req, res) => {
    try {   
      const { notificationId } = req.params;
      const deletedNotification = await Notification.findByIdAndDelete(notificationId);
      if (!mongoose.Types.ObjectId.isValid(notificationId)) {
        return res.status(400).json({ message: 'Invalid notification ID' });
      }
      if (!deletedNotification) {
        return res.status(404).json({ message: 'Notification not found' });
      }
  
      res.status(200).json({
        status: 'success',
        message: 'Notification deleted successfully'
      });
    } catch (error) {
        console.log(error);
      res.status(500).json({ message: 'Failed to delete notification' });
    }
  };
// controller for delete all the notification on the base of usrId
const deletenotificationsbyuser = async (req, res) => {
  try {
    const { userId } = req.params;
    const deletedNotifications = await Notification.deleteMany({ recipient: userId });
    res.status(200).json({
      status:'success',
      message: `${deletedNotifications.deletedCount} notifications deleted successfully`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete notifications' });
  }
}

module.exports = {
    notifications,
    deletenotifications,
    deletenotificationsbyuser
  }