export async function requestNotificationPermission() {
  if ("Notification" in window && Notification.permission !== "granted") {
    await Notification.requestPermission();
  }
}

export function showNotification(title: string, body: string) {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, { body });
  }
}
