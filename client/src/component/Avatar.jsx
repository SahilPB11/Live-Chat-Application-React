import React from "react";

const Avatar = ({ userId, username }) => {
  const colors = [
    " bg-purple-200",
    "bg-green-200",
    "bg-orange-200",
    "bg-blue-200",
    "bg-gray-200",
    "bg-red-200",
    "bg-pink-200",
    "bg-fuchsia-200",
    "bg-teal-200",
  ];
  const userIdBase10 = parseInt(userId, 16);
  const colorIndex = userIdBase10 % colors.length;
  const color = colors[colorIndex];
  return (
    <div className={`w-10 h-10 ${color} rounded-full flex items-center`}>
      <div className="text-center w-full opacity-55 text-xl">{username[0]}</div>
    </div>
  );
};

export default Avatar;
