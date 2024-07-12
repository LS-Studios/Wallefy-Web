import React from 'react';
import ContentOverlay from "../../ContentOverlay/ContentOverlay";
import {MdHome} from "react-icons/md";
import HomeScreen from "./HomeScreen";
import {useTranslation} from "../../../CustomHooks/useTranslation";

const HomeOverlay = () => {
    const translate = useTranslation()

    return (
        <ContentOverlay
            title={translate("home")}
            titleIcon={<MdHome />}
            actions={[]}
        >
            <HomeScreen />
        </ContentOverlay>
    );
};

export default HomeOverlay;