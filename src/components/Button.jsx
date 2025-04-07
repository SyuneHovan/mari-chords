import React from "react";
export const Button = ({ onClick, children, className }) => (
    <button className={`p-2 bg-blue-500 text-white rounded ${className}`} onClick={onClick}>
        {children}
    </button>
);