// ./app/magic-email.tsx
import { Platform, StatusBar, Text, View } from "react-native";

import useAuthRedirect from "../hooks/useAuthRedirect";
import { useThemeContext } from "../contexts/ThemeContext";
import { useGlobalStyles } from "../styles/stylesheets/globalStyles";
import FormMagicEmailMobile from "../components/forms/FormMagicEmailMobile";

const MagicEmail = () => {
  const authRedirect = useAuthRedirect();
  const { theme } = useThemeContext();
  const { globalStyles } = useGlobalStyles();

  if (authRedirect) {
    return authRedirect;
  }

  return (
    <>
      <StatusBar
        barStyle={
          Platform.OS === "ios"
            ? "light-content"
            : theme === "light"
            ? "dark-content"
            : "light-content"
        }
        key={theme}
      />
      <FormMagicEmailMobile />
    </>
  );
};

export default MagicEmail;
