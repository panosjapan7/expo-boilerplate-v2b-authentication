// ./components/forms/FormMagicEmailWeb.tsx
import { useContext, useEffect, useState } from "react";
import { router } from "expo-router";
import { User as FirebaseUserWeb } from "firebase/auth";

import { webAuth } from "../../firebase/firebaseConfig";
import { AuthContext } from "../../contexts/AuthContext";
import { StatusType } from "../../types/types";
import { useDebouncedValidation, validateEmail } from "../../hooks/validations";
import { useGlobalStyles } from "../../styles/stylesheets/globalStyles";
import { Colors } from "../../styles/colors";
import "../../styles/css/form.css";
import InputFormWeb from "../inputs/InputFormWeb";
import ButtonSubmitFormWeb from "../buttons/ButtonSubmitFormWeb";
import LoadingIndicator from "../indicators/LoadingIndicator";

const FormMagicEmailWeb = () => {
  const { themeHeaderTextColor, themeTextColor } = useGlobalStyles();
  const { setUser } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [emailErrorMessage, setEmailErrorMessage] = useState("");
  const [emailSentMessage, setEmailSentMessage] = useState("");
  const [error, setError] = useState("");
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [status, setStatus] = useState<StatusType>("idle");

  useEffect(() => {
    // Check if the link is for sign-in
    if (webAuth.isSignInWithEmailLink(window.location.href)) {
      const storedEmail = window.localStorage.getItem("emailForSignIn");
      if (storedEmail) {
        // If email is found in local storage, complete sign-in
        webAuth
          .signInWithEmailLink(storedEmail, window.location.href)
          .then((result) => {
            console.log("Successfully signed in!", result);
            const user = result.user as FirebaseUserWeb;
            setUser(user);

            // Remove the email from local storage as it's no longer needed
            window.localStorage.removeItem("emailForSignIn");
          })
          .catch((error) => {
            console.error("Error signing in: ", error);
            setError("Failed to sign in. Please try again.");
          });
      } else {
        console.error("No email found for sign-in.");
        setError("No email found for sign-in.");
      }
    }
  }, []);

  const sendMagicLink = async () => {
    setError(""); // Clear any existing errors
    setStatus("loading");

    if (!email) {
      setError("Please enter a valid email.");
      setStatus("idle");
      return;
    }
    const actionCodeSettings = {
      // This is the URL that we will redirect back to after clickin the link in the magic email
      url: "http://localhost:8081/magic-email",
      handleCodeInApp: true,
    };

    try {
      await webAuth.sendSignInLinkToEmail(email, actionCodeSettings);
      window.localStorage.setItem("emailForSignIn", email);
      setEmailSentMessage(
        `We have sent you an email at ${email} with the sign-in link!`
      );
      console.log("Magic link sent to email!");
    } catch (error) {
      console.error("Error sending magic link: ", error);
      setError("Error sending email. Please try again.");
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

  useEffect(() => {
    setIsButtonDisabled(!validateEmail(email));
  }, [email]);

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
            Passwordless Sign-in (web)
          </p>
          {emailSentMessage && (
            <p className="emailSentMessage">{emailSentMessage}</p>
          )}
          <InputFormWeb
            label="Email"
            value={email}
            type="email"
            setValue={setEmail}
            errorMessage={emailErrorMessage}
          />
          <ButtonSubmitFormWeb
            onClick={sendMagicLink}
            isDisabled={isButtonDisabled}
            caption="Send Magic Link"
          />
          {error && <p>{error}</p>}

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
              Back to Login
            </a>
          </div>
        </div>
      )}
    </>
  );
};
export default FormMagicEmailWeb;
