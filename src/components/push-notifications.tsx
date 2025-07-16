"use client"

import { useEffect } from "react"
import { PushNotifications } from "@capacitor/push-notifications"
import { Toast } from "@capacitor/toast"
import { useMobile } from "@/hooks/useMobile"

export function PushNotificationHandler() {
  const { isNative } = useMobile()

  useEffect(() => {
    if (!isNative) return

    const initializePushNotifications = async () => {
      // Request permission
      const permission = await PushNotifications.requestPermissions()

      if (permission.receive === "granted") {
        // Register for push notifications
        await PushNotifications.register()

        // Listen for registration
        PushNotifications.addListener("registration", (token) => {
          console.log("Push registration success, token: " + token.value)
          // Send token to your server
        })

        // Listen for registration errors
        PushNotifications.addListener("registrationError", (error) => {
          console.error("Error on registration: " + JSON.stringify(error))
        })

        // Listen for push notifications
        PushNotifications.addListener("pushNotificationReceived", (notification) => {
          console.log("Push received: " + JSON.stringify(notification))

          // Show toast notification
          Toast.show({
            text: notification.body || "New notification",
            duration: "short",
          })
        })

        // Handle notification tap
        PushNotifications.addListener("pushNotificationActionPerformed", (notification) => {
          console.log("Push action performed: " + JSON.stringify(notification))
          // Navigate to specific screen based on notification data
        })
      }
    }

    initializePushNotifications()

    return () => {
      PushNotifications.removeAllListeners()
    }
  }, [isNative])

  return null
}
