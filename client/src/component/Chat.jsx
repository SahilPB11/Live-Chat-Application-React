import React, { useContext, useEffect, useState } from "react";
import Logo from "./Logo";
import { UserContext } from "../context/UserContext";
import _ from "lodash";
import { useRef } from "react";
import axios from "axios";
import Contact from "./Contact";

const Chat = () => {
  const [ws, setWs] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState({});
  const [offlinePeople, setOfflinePeople] = useState({});
  const [selectedUserId, setSelectedUserId] = useState(null);
  const { username, id } = useContext(UserContext);
  const [newMessageText, setNewMessageText] = useState("");
  const [messages, setMessages] = useState([]);
  const divUnderMessage = useRef();
  const url = import.meta.env.VITE_APP_WS_SERVER_URL;
  useEffect(() => {
    connectToWS();
  }, []);

  function connectToWS() {
    const ws = new WebSocket(`ws://${url}`);
    setWs(ws);
    ws.addEventListener("message", handleMessage);
    ws.addEventListener("close", () => {
      setTimeout(() => {
        console.log("Disconnected, Trying to reconnect");
        connectToWS();
      }, 1200);
    });
  }

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
        _id: Date.now(),
        text: newMessageText,
        sender: id,
        recipient: selectedUserId,
      },
    ]);
    setNewMessageText("");
  }

  // this useEffect when we send a message or recieve a message it will scroll down automatically on chat section
  useEffect(() => {
    const div = divUnderMessage.current;
    if (div) {
      div.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

  // this eefect i am using to get all offline users also
  useEffect(() => {
    axios.get("/people").then((res) => {
      const OfflinePeopleArr = res.data
        .filter((p) => p._id !== id)
        .filter((p) => !Object.keys(onlinePeople).includes(p._id));
      // setOfflinePeople(allOfflinePeople);
      const OfflinePeopleObj = {};
      OfflinePeopleArr.forEach((p) => {
        OfflinePeopleObj[p._id] = p;
      });
      setOfflinePeople(OfflinePeopleObj);
    });
  }, [onlinePeople]);

  // this useEffect will work whenever i will select a user and it will fetch all the chat between us to show in chat section
  useEffect(() => {
    if (selectedUserId) {
      axios.get(`/messages/${selectedUserId}`).then((res) => {
        setMessages(res.data);
      });
    }
  }, [selectedUserId]);



  // removing ourself from usersList
  const onlinePeopleExclOurUser = { ...onlinePeople };
  delete onlinePeopleExclOurUser[id];

  // remove duplicate messages we are getting same message two times because of mounted
  const messageWithoutDupes = _.uniqBy(messages, "_id");

  // messageWithoutDupes.map((message) => console.log(message));

  return (
    <div className="flex h-screen">
      <div className=" bg-white w-2/6  pt-4">
        <Logo />
        {Object.keys(onlinePeopleExclOurUser)?.map((userId) => (
          <Contact
            key={userId}
            id={userId}
            username={onlinePeopleExclOurUser[userId]}
            onClick={() => setSelectedUserId(userId)}
            selected={userId === selectedUserId}
          />
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
