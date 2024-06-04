import React from 'react';
import ContentOverlay from "../../ContentOverlay/ContentOverlay";
import {MdOutlineBarChart} from "react-icons/md";
import TransactionOverviewScreen from "./TransactionOverviewScreen";

const TransactionOverviewOverlay = () => {
    return (
        <ContentOverlay
            title="Transaction Overview"
            titleIcon={<MdOutlineBarChart />}
            actions={[]}
        >
            <TransactionOverviewScreen />
        </ContentOverlay>
    );
};

export default TransactionOverviewOverlay;