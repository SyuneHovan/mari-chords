import React from "react";
export const Button = ({ onClick, children }) => (
    <button className="p-2 bg-blue-500 text-white rounded" onClick={onClick}>
        {children}
    </button>
);