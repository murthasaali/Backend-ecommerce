const Notification = require("../models/notificationSchema");

exports.getNotification = async (req, res) => {
    try {
        let notifications = await Notification.find({ receiverId: req.userId }).populate({
            path: 'messages.userId',
            model: 'User',
            select: ' image'
        });
        console.log("notifications",notifications)

        // Extract messages from notifications
        let messages = [];
        notifications.forEach(notification => {
            messages = messages.concat(notification.messages);
        });

        res.status(200).json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};
