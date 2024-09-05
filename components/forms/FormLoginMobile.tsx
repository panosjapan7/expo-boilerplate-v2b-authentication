// ./components/forms/FormLoginMobile.tsx
import { useContext, useEffect, useRef, useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Link, router } from "expo-router";
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import {
  GoogleSignin,
  GoogleSigninButton,
} from "@react-native-google-signin/google-signin";

import { AuthContext } from "../../contexts/AuthContext";
import {
  useDebouncedValidation,
  validateEmail,
  validatePassword,
} from "../../hooks/validations";
import { StatusType } from "../../types/types";
import { useGlobalStyles } from "../../styles/stylesheets/globalStyles";
import InputEmailMobile from "../inputs/InputEmailMobile";
import InputPasswordMobile from "../inputs/InputPasswordMobile";
import InputLabelMobile from "../inputs/InputLabelMobile";
import ButtonSubmitFormMobile from "../buttons/ButtonSubmitFormMobile";
import LoadingIndicator from "../indicators/LoadingIndicator";
import Spacer from "../utils/Spacer";

const FormLoginMobile = () => {
  const { user, setUser } = useContext(AuthContext) as {
    user: FirebaseAuthTypes.User | null;
    setUser: (user: FirebaseAuthTypes.User | null) => void;
  };
  const { globalStyles } = useGlobalStyles();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailErrorMessage, setEmailErrorMessage] = useState("");
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
  const [hidePassword, setHidePassword] = useState(true);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [status, setStatus] = useState<StatusType>("idle");

  const passwordInputRef = useRef<TextInput>(null);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_SIGN_IN_WEB_CLIENT_ID,
    });
  }, []);

  const signInWithGoogle = async () => {
    setStatus("loading");
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken;

      if (!idToken) {
        throw new Error("No idToken found");
      }

      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const userCredential = await auth().signInWithCredential(
        googleCredential
      );
      const user = userCredential.user;
      setUser(user);
      Alert.alert("Success!", "User logged in successfully");
      console.log("User logged in successfully");
    } catch (error: any) {
      Alert.alert("Error!", error.message);
      console.log("Error: ", error.message);
    } finally {
      setStatus("idle");
    }
  };

  const handleLogin = async () => {
    setStatus("loading");
    try {
      const userCredential = await auth().signInWithEmailAndPassword(
        email,
        password
      );
      const user = userCredential.user;
      if (!user.emailVerified) {
        Alert.alert(
          "Email not verified",
          "Please verify your email before logging in."
        );
        console.log(
          "Email not verified. Please verify your email before logging in."
        );
        return;
      }
      setUser(user);
      Alert.alert("Success!", "User logged in successfully");
      console.log("User logged in successfully");
      setEmail("");
      setPassword("");
      router.replace("/(drawer)/feed");
    } catch (error: any) {
      Alert.alert("Error", error.message);
      console.log(error.message);
    } finally {
      setStatus("idle");
    }
  };

  const handleResendVerification = async () => {
    setStatus("loading");
    if (user) {
      try {
        await user.sendEmailVerification();
        Alert.alert(`Verification email sent to ${user.email}`);
        console.log(`Verification email sent to ${user.email}`);
      } catch (error: any) {
        if (error.code === "auth/too-many-requests") {
          Alert.alert(
            "Too many requests!",
            "We've already sent you a verification email.\n \nLook into your SPAM folder in case it went there.\n \nIf you can't find it, try again in 10 minutes to receive another verification email."
          );
          return;
        }
      } finally {
        setStatus("idle");
      }
    }
  };

  useDebouncedValidation(
    email,
    validateEmail,
    setEmailErrorMessage,
    "is invalid"
  );

  useDebouncedValidation(
    password,
    validatePassword,
    setPasswordErrorMessage,
    "must be at least 6 characters"
  );

  useEffect(() => {
    setIsButtonDisabled(!(validateEmail(email) && validatePassword(password)));
  }, [email, password]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        {status === "loading" ? (
          <LoadingIndicator />
        ) : (
          <View style={globalStyles.container}>
            {user && !user?.emailVerified ? (
              <View style={{ alignItems: "center" }}>
                <Text
                  style={[
                    globalStyles.textRegular,
                    { textAlign: "center", lineHeight: 22 },
                  ]}
                >
                  Email address {user?.email} is not verified
                </Text>
                <Spacer marginTop={10} />
                <Pressable onPress={handleResendVerification}>
                  <Text style={[styles.link, globalStyles.textRegular]}>
                    Resend Verification Email
                  </Text>
                </Pressable>
                <Spacer marginVertical={20} />
              </View>
            ) : null}
            {/* Email */}
            <InputLabelMobile
              caption="Email "
              errorMessage={emailErrorMessage}
            />
            <InputEmailMobile
              value={email}
              setValue={setEmail}
              goToRef={passwordInputRef}
            />

            <View style={{ marginVertical: 2 }}></View>

            {/* Password */}
            <InputLabelMobile
              caption="Password "
              errorMessage={passwordErrorMessage}
            />
            <InputPasswordMobile
              value={password}
              setValue={setPassword}
              ref={passwordInputRef}
              hidePassword={hidePassword}
              setHidePassword={setHidePassword}
              returnKeyType="done"
            />

            <View style={{ marginVertical: 4 }}></View>

            <ButtonSubmitFormMobile
              onPress={handleLogin}
              isDisabled={isButtonDisabled}
              buttonText="Log in"
            />
            <Spacer marginTop={20} />
            <GoogleSigninButton
              size={GoogleSigninButton.Size.Wide}
              color={GoogleSigninButton.Color.Dark}
              onPress={signInWithGoogle}
            />
            <Spacer marginTop={30} />
            <View>
              <Link href="/reset-password" style={styles.link}>
                <Text style={globalStyles.textRegular}>Forgot Password?</Text>
              </Link>
            </View>
            <Spacer marginTop={10} />
            <View>
              <Link href="/magic-email" style={styles.link}>
                <Text style={globalStyles.textRegular}>
                  Passwordless Sign in with Magic Email
                </Text>
              </Link>
            </View>
          </View>
        )}
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};
export default FormLoginMobile;

const styles = StyleSheet.create({
  link: {
    fontSize: 16,
    letterSpacing: 0.5,
    textDecorationLine: "underline",
  },
});
