import React from "react";

export default function MessageBox({ message }) {
  if (!message) return null;
  return (
    <div className="fixed top-4 right-4 z-50 p-4 rounded-lg bg-yellow-500 text-white shadow-xl">
      {message}
    </div>
  );
}
