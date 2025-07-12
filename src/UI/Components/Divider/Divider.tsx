import React from 'react';
import "./Divider.scss";

const Divider = ({
    useOutlineColor = false,
}: {
    useOutlineColor?: boolean;
}) => {
    return (
        <div className={"divider" + (useOutlineColor ? " outlineColor" : "")} />
    );
};

export default Divider;