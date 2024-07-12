import React, {ReactNode} from 'react';
import Divider from "../../../Components/Divider/Divider";
import './ValueCard.scss';
import {isStringObject} from "node:util/types";

const ValueCard = ({
    icon,
    title,
    value,
}: {
    icon?: React.ReactNode;
    title: string;
    value: string | ReactNode;
}) => {
    return (
        <div className="card">
            <div className="card-title-container">
                {icon ? icon : <div></div>}
                <span>{title}</span>
            </div>
            <Divider useOutlineColor={true}/>
            { typeof value === 'string' ? <span className="value-card-value">{value}</span> : value }
        </div>
    );
};

export default ValueCard;