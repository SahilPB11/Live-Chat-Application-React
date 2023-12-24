import "./App.css";
import Register from "./Registration/Register";
import axios from "axios";
export default function App() {
  axios.defaults.baseURL = import.meta.env.VITE_APP_SERVER_URL;
  axios.defaults.withCredentials = true;
  return (
    <>
      <Register />
    </>
  );
}
