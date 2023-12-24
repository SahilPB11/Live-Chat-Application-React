import axios from "axios";
import React, { useContext, useState } from "react";
import { UserContext } from "../context/UserContext.jsx";

const Register = () => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const { setUsername: setLoggedInUsername, setId } = useContext(UserContext);

  async function register(e) {
    e.preventDefault();
    const { data } = await axios.post("/register", {
      username: userName,
      password,
    });
    setLoggedInUsername(userName);
    setId(data._id);
  }
  return (
    <div className="bg-blue-50 h-screen flex items-center">
      <form className="w-64 mx-auto mb-12" onSubmit={register}>
        <input
          type="text"
          placeholder="username"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          className="block w-full rounded-sm p-2 mb-2 border"
        />
        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="block w-full rounded-sm p-2 mb-2 border"
        />
        <button className="bg-blue-500 text-white block w-full rounded-sm p-2">
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;
