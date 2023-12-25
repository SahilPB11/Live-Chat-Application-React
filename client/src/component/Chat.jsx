import React, { useContext, useEffect, useState } from "react";
import Avatar from "./Avatar";
import Logo from "./Logo";
import { UserContext } from "../context/UserContext";

const Chat = () => {
  const [ws, setWs] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState({});
  const [selectedUserId, setSelectedUserId] = useState(null);
  const { username, id } = useContext(UserContext);
  const url = import.meta.env.VITE_APP_WS_SERVER_URL;
  useEffect(() => {
    const ws = new WebSocket(`ws://${url}`);
    setWs(ws);
    ws.addEventListener("message", handleMessage);
  }, []);

  function showOnlinePeople(peopleArray) {
    const people = {};
    peopleArray.forEach(({ userId, username }) => {
      people[userId] = username;
    });
    setOnlinePeople(people);
  }
  function handleMessage(ev) {
    const messageData = JSON.parse(ev.data);
    if ("online" in messageData) {
      showOnlinePeople(messageData?.online);
    }
  }
  // for apitalize the first letter of user
  function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // removing ourself from usersList
  const onlinePeopleExclOurUser = { ...onlinePeople };
  delete onlinePeopleExclOurUser[id];

  return (
    <div className="flex h-screen">
      <div className=" bg-white w-2/6  pt-4">
        <Logo />
        {Object.keys(onlinePeopleExclOurUser)?.map((userId) => (
          <div
            className={`border-b border-gray-100  flex items-center gap-2 cursor-pointer ${
              selectedUserId === userId ? "bg-blue-50" : ""
            }`}
            key={userId}
            onClick={() => setSelectedUserId(userId)}
          >
            {userId === selectedUserId && (
              <div className="w-1 bg-blue-500 h-12 rounded-r-md"></div>
            )}

            <div className="flex gap-2 py-2 pl-4 items-center">
              <Avatar userId={userId} username={onlinePeople[userId]} />
              <span className="text-gray-800">
                {" "}
                {capitalizeFirstLetter(onlinePeople[userId])}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col bg-blue-100 w-5/6 p-1">
        <div className="flex-grow">
          {!selectedUserId && (
            <div className="flex h-full items-center justify-center">
              <div className="text-gray-300">
                &larr;Select a person from sidebar
              </div>
            </div>
          )}{" "}
        </div>
        <div className="flex gap-1">
          <input
            type="text"
            className="bg-white border p-2 flex-grow rounded-xl"
            placeholder="Type here"
          />
          <button className="bg-blue-500 p-2 text-white rounded-xl">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
