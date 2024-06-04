import React from 'react';
import TransactionOverviewCard from "./TransactionOverviewCard/TransactionOverviewCard";
import {MdTrendingUp} from "react-icons/md";

const TransactionOverviewScreen = () => {
    return (
        <div>
            <TransactionOverviewCard
                icon={<MdTrendingUp />}
                title="Chart"
            />
        </div>
    );
};

export default TransactionOverviewScreen;