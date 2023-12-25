import { useContext } from "react";
import RegisterAndLoginForm from "../component/Registration/RegisterAndLoginForm";
import { UserContext } from "../context/UserContext";
import Chat from "../component/Chat";

export default function Routes() {
  const { userName, id } = useContext(UserContext);
  if (userName) {
    return <Chat />;
  }
  return <RegisterAndLoginForm />;
}
