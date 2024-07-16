import React, {PropsWithChildren, useEffect, useRef} from 'react';
import './ContentOverlay.scss';
import {MdAddCircleOutline, MdCreate, MdOutlineHome, MdPowerSettingsNew, MdSearch} from "react-icons/md";
import {ContentAction} from "../../Data/ContentAction/ContentAction";
import {ContentActionInterface} from "../../Data/ContentAction/ContentActionInterface";
import {ContentActionType} from "../../Data/EnumTypes/ContentActionType";
import {ContentSearchAction} from "../../Data/ContentAction/ContentSearchAction";
import {AccountModel} from "../../Data/DatabaseModels/AccountModel";
import {getDBItemOnChange, getDBItemsOnChange, getDBObject, setDBObject} from "../../Helper/AceBaseHelper";
import {DatabaseRoutes} from "../../Helper/DatabaseRoutes";
import {SettingsModel} from "../../Data/DataModels/SettingsModel";
import {useNavigate} from "react-router-dom";
import {useTranslation} from "../../CustomHooks/useTranslation";
import {useCurrentAccount} from "../../Providers/AccountProvider";
import Menu from "../Menu/Menu";

const ContentOverlay = ({
    title,
    titleIcon,
    actions,
    children
}: PropsWithChildren<{
    title: string;
    titleIcon: React.ReactNode;
    actions: ContentActionInterface[];
}>) => {
    const translate = useTranslation()
    const navigate = useNavigate()

    const { currentAccount } = useCurrentAccount();

    const searchInputRef = useRef<HTMLInputElement>(null)

    return <>
        <Menu />
        <div className="content-overlay">
            <div className="content-overlay-header">
                <div className="content-overlay-navigation">
                    <div className="content-overlay-header-navigation-account" onClick={() => navigate("/accounts")}>
                        {currentAccount?.name}
                    </div>
                    <div className="content-overlay-header-navigation-actions">
                        <a onClick={() => navigate("/home")}><MdOutlineHome/> {translate("home")}</a>
                        <a onClick={() => {
                            setDBObject(DatabaseRoutes.SETTINGS, new SettingsModel())
                        }}><MdPowerSettingsNew /> {translate("logout")}</a>
                    </div>
                </div>
                <div className="content-overlay-header-content">
                    <div className="content-overlay-header-content-title">
                        { titleIcon }
                        { title }
                    </div>
                    <div className="content-overlay-header-content-actions">
                        { actions.map((action, index) => {
                            if (action.type === ContentActionType.BUTTON) {
                                const buttonAction = action as ContentAction;
                                return <a key={index} className="content-overlay-header-content-actions-button" onClick={buttonAction.action}>
                                    {buttonAction.icon}
                                    {buttonAction.name}
                                </a>
                            } else if (action.type === ContentActionType.SEARCH) {
                                return <div key={index} className="content-overlay-header-content-actions-search-action">
                                    <MdSearch className="content-overlay-header-content-actions-search-icon" />
                                    <input ref={searchInputRef} type="text" placeholder={(action as ContentSearchAction).placeholder} onChange={(e) => {
                                        const searchAction = action as ContentSearchAction;
                                        searchAction.onSearchTextChanged(e.target.value);
                                    }} onKeyDown={(e) => {
                                        e.key === "Enter" && searchInputRef.current?.blur()
                                    }} />
                                </div>
                            } else {
                                return null;
                            }
                        })}
                    </div>
                </div>
                <hr className="content-overlay-divider"/>
            </div>
            <div className="content-overlay-body">
                { children }
            </div>
        </div>
    </>
};

export default ContentOverlay;