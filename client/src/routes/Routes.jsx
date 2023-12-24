import { useContext } from "react";
import RegisterAndLoginForm from "../Registration/RegisterAndLoginForm";
import { UserContext } from "../context/UserContext";

export default function Routes() {
  const { userName, id } = useContext(UserContext);
  if (userName) {
    return "Logged in " + userName;
  }
  return <RegisterAndLoginForm />;
}
