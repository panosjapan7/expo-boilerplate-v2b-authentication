// ./app/magic-email.web.tsx
import useAuthRedirect from "../hooks/useAuthRedirect";
import { useGlobalStyles } from "../styles/stylesheets/globalStyles";
import "../styles/css/magic-email.css";
import FormMagicEmailWeb from "../components/forms/FormMagicEmailWeb";

const MagicEmail = () => {
  const authRedirect = useAuthRedirect();
  const { themeBackgroundColor } = useGlobalStyles();

  if (authRedirect) {
    return authRedirect;
  }
  return (
    <div
      className="magicEmail-wrapper"
      style={{ backgroundColor: themeBackgroundColor }}
    >
      <div className="contents-container">
        <FormMagicEmailWeb />
      </div>
    </div>
  );
};

export default MagicEmail;
