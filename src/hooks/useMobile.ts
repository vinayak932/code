"use client"

import { useEffect, useState } from "react"
import { Capacitor } from "@capacitor/core"
import { StatusBar, Style } from "@capacitor/status-bar"
import { SplashScreen } from "@capacitor/splash-screen"

export function useMobile() {
  const [isNative, setIsNative] = useState(false)
  const [platform, setPlatform] = useState<string>("")

  useEffect(() => {
    const checkPlatform = async () => {
      const native = Capacitor.isNativePlatform()
      const platformName = Capacitor.getPlatform()

      setIsNative(native)
      setPlatform(platformName)

      if (native) {
        // Configure status bar for mobile
        await StatusBar.setStyle({ style: Style.Light })
        await StatusBar.setBackgroundColor({ color: "#3b82f6" })

        // Hide splash screen after app loads
        setTimeout(async () => {
          await SplashScreen.hide()
        }, 2000)
      }
    }

    checkPlatform()
  }, [])

  return { isNative, platform }
}
