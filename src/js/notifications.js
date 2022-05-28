function askNotificationPermission() {
    return Notification.requestPermission()
}

function sendNotification({
    title, body, image
}) {
    return new Notification(title, { body, image })
}

export { sendNotification, askNotificationPermission }