// ./components/forms/FormLoginWeb.tsx
import { MouseEvent, useContext, useEffect, useState } from "react";
import { router } from "expo-router";
import {
  sendEmailVerification,
  signInWithEmailAndPassword,
  User,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

import { webAuth } from "../../firebase/firebaseConfig";
import { AuthContext } from "../../contexts/AuthContext";
import { useGlobalStyles } from "../../styles/stylesheets/globalStyles";
import { Colors } from "../../styles/colors";
import "../../styles/css/form.css";
import {
  useDebouncedValidation,
  validateEmail,
  validatePassword,
} from "../../hooks/validations";
import { StatusType } from "../../types/types";
import InputFormWeb from "../inputs/InputFormWeb";
import ButtonSubmitFormWeb from "../buttons/ButtonSubmitFormWeb";
import ButtonGoogleSignIn from "../buttons/ButtonGoogleSignIn";
import LoadingIndicator from "../indicators/LoadingIndicator";
import Spacer from "../utils/Spacer";

const FormLoginWeb = () => {
  const { user, setUser } = useContext(AuthContext) as {
    user: User | null;
    setUser: (user: User | null) => void;
  };
  const { themeHeaderTextColor, themeTextColor } = useGlobalStyles();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailErrorMessage, setEmailErrorMessage] = useState("");
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [hidePassword, setHidePassword] = useState(true);
  const [status, setStatus] = useState<StatusType>("idle");

  const handleLogin = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const userCredential = await signInWithEmailAndPassword(
        webAuth,
        email,
        password
      );
      const user = userCredential.user;
      if (!user.emailVerified) {
        window.alert(
          "Email not verified. Please verify your email before logging in."
        );
        console.log(
          "Email not verified. Please verify your email before logging in."
        );
        return;
      }
      setUser(user);
      console.log("User logged in successfully!");
      router.replace("/(drawer)/(tabs)/feed");
    } catch (error: any) {
      console.log("Error", error.message);
    } finally {
      setStatus("idle");
    }
  };

  const handleResendVerification = async () => {
    setStatus("loading");
    if (user) {
      try {
        await sendEmailVerification(user);
        window.alert(`Verification email sent to ${user.email}`);
        console.log(`Verification email sent to ${user.email}`);
      } catch (error: any) {
        if (error.code === "auth/too-many-requests") {
          window.alert(
            "Too many requests!\nWe've already sent you a verification email.\n \nLook into your SPAM folder in case it went there.\n \nIf you can't find it, try again in 10 minutes to receive another verification email."
          );
          return;
        }
      } finally {
        setStatus("idle");
      }
    }
  };

  const signInWithGoogle = async () => {
    setStatus("loading");
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(webAuth, provider);
      const user = result.user;
      setUser(user);
      console.log("User logged in successfully");
    } catch (error: any) {
      window.alert("Error: " + error.message);
      console.log("Error: ", error.message);
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

  useEffect(() => {
    setIsButtonDisabled(!(validateEmail(email) && validatePassword(password)));
  }, [email, password]);

  return (
    <>
      {status === "loading" ? (
        <LoadingIndicator />
      ) : (
        <div
          className="form-container"
          style={{
            borderColor: Colors.gray300,
            borderWidth: 1,
            borderStyle: "solid",
          }}
        >
          <p
            className="form-header"
            style={{
              color: themeTextColor,
            }}
          >
            Login Screen (web)
          </p>
          {user && !user.emailVerified ? (
            <div className="verifyEmailMessage-container">
              <p
                className="verifyEmailMessage"
                style={{ color: themeTextColor }}
              >
                Email address {user?.email} is not verified
              </p>
              <a
                className="verifyEmailMessage-link textBold"
                onClick={handleResendVerification}
                style={{
                  color: themeHeaderTextColor,
                  textDecorationColor: themeHeaderTextColor,
                }}
              >
                Resend Verification Email
              </a>
            </div>
          ) : null}

          <InputFormWeb
            label="Email"
            value={email}
            type="email"
            setValue={setEmail}
            errorMessage={emailErrorMessage}
          />
          <InputFormWeb
            label="Password"
            value={password}
            type="password"
            setValue={setPassword}
            errorMessage={passwordErrorMessage}
            hidePassword={hidePassword}
            setHidePassword={setHidePassword}
          />

          <ButtonSubmitFormWeb
            onClick={handleLogin}
            isDisabled={isButtonDisabled}
            caption="Log in"
          />
          <Spacer marginTop={14} />
          <ButtonGoogleSignIn
            onClick={signInWithGoogle}
            caption="Sign in with Google"
          />

          <div className="bottomLinksContainer">
            <a
              href="/reset-password"
              onClick={(e) => {
                e.preventDefault();
                router.push("/reset-password");
              }}
              style={{
                color: themeHeaderTextColor,
                textDecorationColor: themeHeaderTextColor,
              }}
            >
              Forgot Password?
            </a>
            <a
              href="/register"
              onClick={(e) => {
                e.preventDefault();
                router.push("/register");
              }}
              style={{
                color: themeHeaderTextColor,
                textDecorationColor: themeHeaderTextColor,
              }}
            >
              Don't have an account?{" "}
              <span className="bottomLink-bold">Register here</span>
            </a>
            <a
              href="/magic-email"
              onClick={(e) => {
                e.preventDefault();
                router.push("/magic-email");
              }}
              style={{
                color: themeHeaderTextColor,
                textDecorationColor: themeHeaderTextColor,
              }}
            >
              Passwordless Sign in with Magic Email
            </a>
          </div>
        </div>
      )}
    </>
  );
};
export default FormLoginWeb;
