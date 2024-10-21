const Notification= require ("../Model/Notification")
const  mongoose=require ('mongoose');

const notifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .populate('sender', 'username image');
    const responseData = notifications.map(notification => ({
      _id: notification._id,
      recipient: notification.recipient,
      heading: notification.heading,
      message: notification.message,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
      requestId: notification.requestId,
      params: notification.params,
      sender: notification.sender ? {
        _id: notification.sender._id,
        username: notification.sender.username,
        image: notification.sender.image
      } : null
    }));

    res.status(200).json({
      status: 'success',
      data: responseData
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

module.exports = {
    notifications,
    deletenotifications
  }