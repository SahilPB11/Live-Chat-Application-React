import "./App.css";
import axios from "axios";
import Routes from "./routes/Routes";
export default function App() {
  axios.defaults.baseURL = import.meta.env.VITE_APP_SERVER_URL;
  axios.defaults.withCredentials = true;
  return (
    <>
      <Routes />
    </>
  );
}
