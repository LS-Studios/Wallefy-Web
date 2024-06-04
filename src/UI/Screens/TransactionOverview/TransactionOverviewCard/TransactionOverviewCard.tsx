import React from 'react';
import Divider from "../../../Components/Divider/Divider";
import './TransactionOverviewCard.scss';

const TransactionOverviewCard = ({
    icon,
    title,
}: {
    icon: React.ReactNode;
    title: string;
}) => {
    return (
        <div className="transaction-overview-card">
            <div className="transaction-overview-card-title-container">
                { icon }
                <span>{ title }</span>
            </div>
            <Divider useOutlineColor={true} />

            <Divider useOutlineColor={true} />
            <div className="transaction-overview-card-value-container">
                <span>Selected</span>
                <span>Donnerstag, der 01.01.2001</span>
            </div>
            <Divider useOutlineColor={true} />
            <div className="transaction-overview-card-value-container">
                <span>Value</span>
                <span>200 $</span>
            </div>
        </div>
    );
};

export default TransactionOverviewCard;