// ./components/forms/FormMagicEmailMobile.tsx
import { useContext, useEffect, useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Link, router } from "expo-router";
import auth from "@react-native-firebase/auth";
import * as Linking from "expo-linking";

import { StatusType } from "../../types/types";
import { useDebouncedValidation, validateEmail } from "../../hooks/validations";
import { useGlobalStyles } from "../../styles/stylesheets/globalStyles";
import InputEmailMobile from "../inputs/InputEmailMobile";
import InputLabelMobile from "../inputs/InputLabelMobile";
import ButtonSubmitFormMobile from "../buttons/ButtonSubmitFormMobile";
import LoadingIndicator from "../indicators/LoadingIndicator";
import { AuthContext } from "../../contexts/AuthContext";

const FormMagicEmailMobile = () => {
  const { setUser } = useContext(AuthContext);
  const { globalStyles, themeHeaderTextColor } = useGlobalStyles();
  const [email, setEmail] = useState("");
  const [emailErrorMessage, setEmailErrorMessage] = useState("");
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [status, setStatus] = useState<StatusType>("idle");

  useDebouncedValidation(
    email,
    validateEmail,
    setEmailErrorMessage,
    "is invalid"
  );

  useEffect(() => {
    setIsButtonDisabled(!validateEmail(email));
  }, [email]);

  useEffect(() => {
    const handleDeepLink = async (event: { url: string }) => {
      const url = event.url;
      console.log("Incoming URL:", url);

      if (auth().isSignInWithEmailLink(url)) {
        const storedEmail = email || ""; // Use the email from the state or prompt user
        try {
          const result = await auth().signInWithEmailLink(storedEmail, url);
          setUser(result.user);
          Alert.alert("Success", "Successfully signed in!");
        } catch (error: any) {
          console.error("Error signing in with magic link: ", error);
          Alert.alert("Error", error.message);
        }
      }
    };

    // Listen for incoming deep links
    const subscription = Linking.addEventListener("url", handleDeepLink);

    // Also handle the case where the app is opened by the link initially
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => {
      // Clean up the event listener when the component unmounts
      subscription.remove();
    };
  }, [email, setUser]);

  const sendMagicLink = async () => {
    setStatus("loading");

    if (!email) {
      Alert.alert("Error", "Please enter a valid email.");
      setStatus("idle");
      return;
    }

    const actionCodeSettings = {
      url: "https://expo-boilerplate-firebase.firebaseapp.com/magic-email",
      // url: "expo-boilerplate-firebase.firebaseapp.com://magic-email",
      handleCodeInApp: true,
      iOS: {
        bundleId: "com.expo.authentication",
      },
      android: {
        packageName: "com.expo.authentication",
        installApp: true,
      },
    };

    try {
      await auth().sendSignInLinkToEmail(email, actionCodeSettings);
      Alert.alert("Success", `A sign-in link has been sent to ${email}.`);
      console.log("Magic link sent to email!");
    } catch (error: any) {
      console.error("Error sending magic link: ", error);
      Alert.alert("Error", "Failed to send magic link. Please try again.");
    } finally {
      setStatus("idle");
    }
  };

  // Handle incoming links for sign-in
  const handleIncomingLink = async (url: string) => {
    if (auth().isSignInWithEmailLink(url)) {
      const storedEmail = email || ""; // Use the email from the state
      try {
        const result = await auth().signInWithEmailLink(storedEmail, url);
        setUser(result.user); // Save user in context
        Alert.alert("Success", "Successfully signed in!");
      } catch (error: any) {
        console.error("Error signing in with magic link: ", error);
        Alert.alert("Error", "Failed to sign in. Please try again.");
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      {status === "loading" ? (
        <LoadingIndicator />
      ) : (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={globalStyles.container}>
            <InputLabelMobile
              caption="Email "
              errorMessage={emailErrorMessage}
            />

            <InputEmailMobile
              value={email}
              setValue={setEmail}
              returnKeyType="done"
            />

            <ButtonSubmitFormMobile
              onPress={sendMagicLink}
              isDisabled={isButtonDisabled}
              buttonText="Send Magic Link"
            />
          </View>
        </TouchableWithoutFeedback>
      )}
    </KeyboardAvoidingView>
  );
};
export default FormMagicEmailMobile;
