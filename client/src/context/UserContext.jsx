import axios from "axios";
import { createContext, useEffect, useState } from "react";

export const UserContext = createContext();

export function UserContextProvider({ children }) {
  const [userName, setUsername] = useState(null);
  const [id, setId] = useState(null);
  useEffect(() => {
    axios.get("/profile").then((response) => {
    });
  });
  return (
    <UserContext.Provider value={{ userName, setUsername, id, setId }}>
      {children}
    </UserContext.Provider>
  );
}
