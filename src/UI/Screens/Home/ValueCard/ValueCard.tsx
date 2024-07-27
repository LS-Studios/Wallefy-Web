import React, {ReactNode} from 'react';
import Divider from "../../../Components/Divider/Divider";
import './ValueCard.scss';
import Spinner from "../../../Components/Spinner/Spinner";
import {SpinnerType} from "../../../../Data/EnumTypes/SpinnerType";

const ValueCard = ({
    icon,
    title,
    value,
}: {
    icon?: React.ReactNode;
    title: string;
    value: string | ReactNode | null;
}) => {
    return (
        <div className="card">
            <div className="card-title-container">
                {icon ? icon : <div></div>}
                <span>{title}</span>
            </div>
            <Divider useOutlineColor={true}/>
            { value ? (typeof value === 'string' ? <span className="value-card-value">{value}</span> : value) : <Spinner type={SpinnerType.DOTS} style={{padding:8}} /> }
        </div>
    );
};

export default ValueCard;