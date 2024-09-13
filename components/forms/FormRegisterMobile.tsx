// ./components/forms/FormRegisterMobile.tsx
import { useContext, useEffect, useRef, useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { router } from "expo-router";
import auth from "@react-native-firebase/auth";

import { AuthContext } from "../../contexts/AuthContext";
import { StatusType } from "../../types/types";
import {
  useDebouncedValidation,
  validateEmail,
  validatePassword,
  validateRepeatPassword,
} from "../../hooks/validations";
import { useGlobalStyles } from "../../styles/stylesheets/globalStyles";
import InputEmailMobile from "../inputs/InputEmailMobile";
import InputLabelMobile from "../inputs/InputLabelMobile";
import InputPasswordMobile from "../inputs/InputPasswordMobile";
import ButtonSubmitFormMobile from "../buttons/ButtonSubmitFormMobile";
import LoadingIndicator from "../indicators/LoadingIndicator";

const FormRegisterMobile = () => {
  const { setUser } = useContext(AuthContext);
  const { globalStyles } = useGlobalStyles();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [emailErrorMessage, setEmailErrorMessage] = useState("");
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
  const [repeatPasswordErrorMessage, setRepeatPasswordErrorMessage] =
    useState("");
  const [hidePassword, setHidePassword] = useState(true);
  const [hideRepeatPassword, setHideRepeatPassword] = useState(true);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [status, setStatus] = useState<StatusType>("idle");

  const passwordInputRef = useRef<TextInput>(null);
  const repeatPasswordInputRef = useRef<TextInput>(null);

  const handleRegister = async () => {
    setStatus("loading");
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(
        email,
        password
      );
      const user = userCredential.user;
      await user.sendEmailVerification();
      setUser(user);
      Alert.alert(
        "Registration successful!",
        `We have sent a verification email to ${user?.email}.`
      );
      console.log(
        `Registration successful! We have sent a verification email to ${user?.email}.`
      );
      setEmail("");
      setPassword("");
      setRepeatPassword("");
      router.replace("/login");
    } catch (error: any) {
      // Check if the email is already in use
      if (error.code === "auth/email-already-in-use") {
        // Prompt user to sign in with Google to link accounts
        console.log(
          "Email already in use. This email is already associated with a Google account."
        );
        Alert.alert(
          "Email already in use",
          "This email is already associated with a Google account."
        );
      }
      console.error("Registration error:", error.message);
      Alert.alert("Registration Error", error.message);
    } finally {
      setStatus("idle");
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

  useDebouncedValidation(
    repeatPassword,
    (value) => validateRepeatPassword(password, value),
    setRepeatPasswordErrorMessage,
    "and Password do not match"
  );

  useEffect(() => {
    setIsButtonDisabled(
      !(
        validateEmail(email) &&
        validatePassword(password) &&
        validateRepeatPassword(password, repeatPassword)
      )
    );
  }, [email, password, repeatPassword]);

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

            <View style={{ marginVertical: 1 }}></View>

            {/* Password */}
            <InputLabelMobile
              caption="Password "
              errorMessage={passwordErrorMessage}
            />
            <InputPasswordMobile
              value={password}
              setValue={setPassword}
              ref={passwordInputRef}
              goToRef={repeatPasswordInputRef}
              hidePassword={hidePassword}
              setHidePassword={setHidePassword}
              returnKeyType="next"
            />

            <View style={{ marginVertical: 6 }}></View>

            {/* Repeat Password */}
            <InputLabelMobile
              caption="Repeat Password "
              errorMessage={repeatPasswordErrorMessage}
            />
            <InputPasswordMobile
              value={repeatPassword}
              setValue={setRepeatPassword}
              ref={repeatPasswordInputRef}
              hidePassword={hideRepeatPassword}
              setHidePassword={setHideRepeatPassword}
              returnKeyType="done"
            />

            <View style={{ marginVertical: 7 }}></View>

            <ButtonSubmitFormMobile
              onPress={handleRegister}
              isDisabled={isButtonDisabled}
              buttonText="Register"
            />
          </View>
        </TouchableWithoutFeedback>
      )}
    </KeyboardAvoidingView>
  );
};
export default FormRegisterMobile;
