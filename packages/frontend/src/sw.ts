export declare let self: ServiceWorkerGlobalScope;

import { cleanupOutdatedCaches } from "workbox-precaching";

import { clientsClaim } from "workbox-core";
import { IWebPushEvent } from "@aula-anclademia/backend/src/web-push/web-push.types";

self.skipWaiting();
clientsClaim();

cleanupOutdatedCaches();

self.addEventListener("push", async (event: PushEvent) => {
  const { title, body, data, type } = JSON.parse(
    event.data ? event.data.text() : "{}"
  ) as IWebPushEvent;

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      data: {
        ...data,
        type,
      },
    })
  );
});

self.addEventListener("notificationclick", (event: NotificationEvent) => {
  event.notification.close();

  // open web app

  event.waitUntil(
    self.clients
      .matchAll({
        type: "window",
      })
      .then((clientList) => {
        const client = clientList[0];
        if (client) {
          client.focus();
        } else {
          if (event.notification.data.type === "chat")
            self.clients.openWindow(
              "/#/chat?id=" + event.notification.data.chatId
            );
          else if (event.notification.data.type === "calendar")
            self.clients.openWindow(
              "/#/calendar?id=" + event.notification.data.calendarId
            );
          else self.clients.openWindow("/");
        }
      })
  );
});

console.log("👷 Service worker loaded");

self.addEventListener("install", () => {
  console.log("👷 Service worker installed");
  self.skipWaiting();
});
