import React from "react";
import LoaderIcon from "../../public/svgs/loader";
export const Loader = () => (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <LoaderIcon style={{ width: "50px", height: "50px" }} />
    </div>
);