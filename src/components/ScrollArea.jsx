import React from "react";

export const ScrollArea = ({ children }) => (
    <div className="overflow-auto h-96 border p-2 rounded">
        {children}
    </div>
);