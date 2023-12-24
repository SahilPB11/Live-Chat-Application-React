import { useContext } from "react";
import Register from "../Registration/Register";
import { UserContext } from "../context/UserContext";

export default function Routes() {
  const { userName, id } = useContext(UserContext);
  if (userName) {
    return "Logged in";
  }
  return <Register />;
}
