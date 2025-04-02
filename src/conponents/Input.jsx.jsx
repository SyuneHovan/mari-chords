import React from "react";
export const Input = ({ placeholder, onChange }) => (
    <input className="p-2 border rounded w-full" placeholder={placeholder} onChange={onChange} />
);