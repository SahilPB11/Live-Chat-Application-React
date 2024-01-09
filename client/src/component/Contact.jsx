import React from "react";
import Avatar from "./Avatar";

const Contact = ({ id, onClick, selected, username }) => {
  // for apitalize the first letter of user
  function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  return (
    <div
      className={`border-b border-gray-100  flex items-center gap-2 cursor-pointer ${
        selected === id ? "bg-blue-50" : ""
      }`}
      key={id}
      onClick={() => onClick(id)}
    >
      {selected && <div className="w-1 bg-blue-500 h-12 rounded-r-md"></div>}

      <div className="flex gap-2 py-2 pl-4 items-center">
        <Avatar online={true} userId={id} username={username} />
        <span className="text-gray-800">
          {" "}
          {capitalizeFirstLetter(username)}
        </span>
      </div>
    </div>
  );
};

export default Contact;
