// ./components/forms/FormRegisterWeb.tsx
import { MouseEvent, useContext, useEffect, useState } from "react";
import { router } from "expo-router";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";

import { webAuth } from "../../firebase/firebaseConfig";
import { AuthContext } from "../../contexts/AuthContext";
import { StatusType } from "../../types/types";
import { useGlobalStyles } from "../../styles/stylesheets/globalStyles";
import { Colors } from "../../styles/colors";
import "../../styles/css/form.css";
import {
  useDebouncedValidation,
  validateEmail,
  validatePassword,
  validateRepeatPassword,
} from "../../hooks/validations";
import InputFormWeb from "../inputs/InputFormWeb";
import ButtonSubmitFormWeb from "../buttons/ButtonSubmitFormWeb";
import LoadingIndicator from "../indicators/LoadingIndicator";

const FormRegisterWeb = () => {
  const { setUser } = useContext(AuthContext);
  const { themeHeaderTextColor, themeTextColor } = useGlobalStyles();
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

  const handleRegister = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const userCredential = await createUserWithEmailAndPassword(
        webAuth,
        email,
        password
      );
      const user = userCredential.user;
      await sendEmailVerification(user);
      setUser(user);
      console.log(
        `Registration successful! We have sent a verification email to ${user?.email}.`
      );
      router.replace({
        pathname: "/login",
        params: {
          message: `Please verify your email before logging in. Verification email sent to ${email}`,
          emailToBeVerified: email,
        },
      });
    } catch (error: any) {
      // Check if the email is already in use
      if (error.code === "auth/email-already-in-use") {
        window.alert("This email is already associated with a Google account.");
        console.log("This email is already associated with a Google account.");
      }
      window.alert(`Registration error: ${error.message}`);
      console.error("Registration error:", error.message);
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
    "does not match Password"
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
            Register Screen (web)
          </p>
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

          <InputFormWeb
            label="Repeat Password"
            value={repeatPassword}
            type="password"
            setValue={setRepeatPassword}
            errorMessage={repeatPasswordErrorMessage}
            hidePassword={hideRepeatPassword}
            setHidePassword={setHideRepeatPassword}
          />

          <ButtonSubmitFormWeb
            onClick={handleRegister}
            isDisabled={isButtonDisabled}
            caption="Register"
          />

          <div className="bottomLinksContainer">
            <a
              href="/login"
              onClick={(e) => {
                e.preventDefault();
                router.push("/login");
              }}
              style={{
                color: themeHeaderTextColor,
                textDecorationColor: themeHeaderTextColor,
              }}
            >
              Have an account? <span>Log in here</span>
            </a>
          </div>
        </div>
      )}
    </>
  );
};
export default FormRegisterWeb;
