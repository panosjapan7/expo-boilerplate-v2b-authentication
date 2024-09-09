export default {
  expo: {
    name: "expo-boilerplate-v2b-authentication",
    slug: "expo-boilerplate-v2b-authentication",
    scheme: "expo-boilerplate-firebase.firebaseapp.com",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.expo.authentication",
      googleServicesFile:
        process.env.GOOGLE_SERVICES_INFOPLIST ?? "./GoogleService-Info.plist",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      package: "com.expo.authentication",
      googleServicesFile:
        process.env.GOOGLE_SERVICES_JSON ?? "./google-services.json",
      intentFilters: [
        {
          action: "VIEW",
          data: [
            {
              scheme: "https",
              // This matches my Firebase project's "authDomain"
              host: "expo-boilerplate-firebase.firebaseapp.com",
              pathPrefix: "/magic-email",
            },
          ],
          category: ["BROWSABLE", "DEFAULT"],
        },
      ],
    },
    web: {
      favicon: "./assets/favicon.png",
      bundler: "metro",
    },
    plugins: [
      "expo-router",
      "expo-font",
      "@react-native-firebase/app",
      "@react-native-firebase/auth",
      "@react-native-google-signin/google-signin",
      [
        "expo-build-properties",
        {
          ios: {
            useFrameworks: "static",
          },
        },
      ],
    ],
    extra: {
      router: {
        origin: false,
      },
      eas: {
        projectId: "53e1846d-2926-4fdf-8fae-d30d66ec8a06",
      },
    },
  },
};
