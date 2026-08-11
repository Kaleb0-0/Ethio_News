const VAPID_PUBLIC_KEY = "BNOKfLGIdHadHPrwXSHwfJ-s7qCVmmODLY9Gl9TU1Nw64bi1qbwvJ-wsvEcU1Hsg7tPtGlYSWU7OtZniP9ckEYo"; // paste your public key

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return new Uint8Array([...rawData].map((char) => char.charCodeAt(0)));
}

export const subscribeToPush = async (): Promise<boolean> => {
  try {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      console.log("Push not supported");
      return false;
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") return false;

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    const sub = subscription.toJSON() as any;

    await fetch("http://localhost:3000/api/auth/push-subscription", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        endpoint: sub.endpoint,
        p256dh: sub.keys.p256dh,
        auth: sub.keys.auth,
      }),
    });

    return true;
  } catch (err) {
    console.error("Push subscription failed:", err);
    return false;
  }
};

export const unsubscribeFromPush = async (): Promise<void> => {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (subscription) {
    await subscription.unsubscribe();
  }
};
