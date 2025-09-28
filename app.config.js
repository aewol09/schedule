export default {
  expo: {
    name: "일정 관리",
    slug: "realscheduleapp",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.yourcompany.realscheduleapp",
      buildNumber: "1",
      infoPlist: {
        UIBackgroundModes: ["background-processing", "background-fetch"]
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#FFFFFF"
      },
      package: "com.yourcompany.scheduleapp",
      versionCode: 1,
      permissions: [
        "android.permission.RECEIVE_BOOT_COMPLETED",
        "android.permission.VIBRATE",
        "android.permission.WAKE_LOCK",
        "android.permission.SCHEDULE_EXACT_ALARM",
        "android.permission.USE_EXACT_ALARM",
        "android.permission.POST_NOTIFICATIONS",
        "com.android.alarm.permission.SET_ALARM"
      ]
    },
    web: {
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      [
        "expo-notifications",
        {
          // icon: "./assets/images/notification-icon.png",
          color: "#ffffff",
          mode: "production"
        }
      ],
    ],
    extra: {
      eas: {
        projectId: "dffdc4a3-72be-4b52-8291-efc75eaed0e8"
      }
    },
    notification: {
      // icon: "./assets/images/notification-icon.png",
      color: "#ffffff",
      androidMode: "default",
      androidCollapsedTitle: "일정 관리 알림"
    }
  }
  
};
