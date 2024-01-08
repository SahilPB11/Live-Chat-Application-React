import React, { useContext, useEffect, useState } from "react";
import Avatar from "./Avatar";
import Logo from "./Logo";
import { UserContext } from "../context/UserContext";
import _ from "lodash";
import { useRef } from "react";

const Chat = () => {
  const [ws, setWs] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState({});
  const [selectedUserId, setSelectedUserId] = useState(null);
  const { username, id } = useContext(UserContext);
  const [newMessageText, setNewMessageText] = useState("");
  const [messages, setMessages] = useState([]);
  const divUnderMessage = useRef();
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
    } else if ("text" in messageData) {
      setMessages((prev) => [
        ...prev,
        {
          ...messageData,
        },
      ]);
    }
  }

  // function for send message
  function sendMessage(e) {
    e.preventDefault();
    ws.send(
      JSON.stringify({
        recipient: selectedUserId,
        text: newMessageText,
      })
    );
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: newMessageText,
        sender: id,
        recipient: selectedUserId,
      },
    ]);
    setNewMessageText("");
  }

  useEffect(() => {
    const div = divUnderMessage.current;
    if (div) {
      div.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

  // for apitalize the first letter of user
  function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // removing ourself from usersList
  const onlinePeopleExclOurUser = { ...onlinePeople };
  delete onlinePeopleExclOurUser[id];

  // remove duplicate messages we are getting same message two times because of mounted
  const messageWithoutDupes = _.uniqBy(messages, "id");

  // messageWithoutDupes.map((message) => console.log(message));

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
            <div className="flex h-screen items-center justify-center">
              <div className="text-gray-300 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-8 h-6"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-4.28 9.22a.75.75 0 0 0 0 1.06l3 3a.75.75 0 1 0 1.06-1.06l-1.72-1.72h5.69a.75.75 0 0 0 0-1.5h-5.69l1.72-1.72a.75.75 0 0 0-1.06-1.06l-3 3Z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Select a person from sidebar</span>
              </div>
            </div>
          )}

          {!!selectedUserId && (
            <div className="relative h-full">
              <div className="overflow-y-scroll scroll-smooth absolute inset-0">
                {messageWithoutDupes?.map((message, index) => (
                  <div
                    key={index}
                    className={message?.sender === id ? "text-right" : ""}
                  >
                    <div
                      className={
                        "text-left m-2 text-sm rounded-xl inline-block p-2 " +
                        (message?.sender === id
                          ? "bg-blue-500 text-white"
                          : "bg-white text-gray-500")
                      }
                    >
                      <p>{message.sender}</p>
                      <p>{id}</p>
                      <p> {message?.text}</p>
                    </div>
                  </div>
                ))}
                <div ref={divUnderMessage}></div>
              </div>
            </div>
          )}
        </div>
        {!!selectedUserId && (
          <form className="flex gap-1 typebar" onSubmit={sendMessage}>
            <input
              type="text"
              value={newMessageText}
              onChange={(e) => setNewMessageText(e.target.value)}
              className="bg-white border  p-2 flex-grow rounded-xl "
              placeholder="Type here"
            />
            <button
              className="bg-blue-500 p-2 text-white rounded-xl"
              type="submit"
            >
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
          </form>
        )}
      </div>
    </div>
  );
};

export default Chat;
