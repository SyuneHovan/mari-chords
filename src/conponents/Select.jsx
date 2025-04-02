import React from "react";
export const Select = ({ options, onChange }) => (
    <select className="p-2 border rounded w-full" onChange={onChange}>
        {options.map((option, index) => (
            <option key={index} value={option.value}>{option.label}</option>
        ))}
    </select>
);