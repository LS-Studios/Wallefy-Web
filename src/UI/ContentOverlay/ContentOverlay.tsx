import React, {PropsWithChildren} from 'react';
import './ContentOverlay.scss';
import {MdAddCircleOutline, MdCreate, MdOutlineHome, MdPowerSettingsNew, MdSearch} from "react-icons/md";
import {ContentAction} from "../../Data/ContentAction/ContentAction";
import {ContentActionInterface} from "../../Data/ContentAction/ContentActionInterface";
import {ContentActionType} from "../../Data/ContentAction/ContentActionType";
import {ContentSearchAction} from "../../Data/ContentAction/ContentSearchAction";

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
    return (
        <div className="content-overlay">
            <div className="content-overlay-header">
                <div className="content-overlay-navigation">
                    <div className="content-overlay-header-navigation-account">
                        Privates Konto
                    </div>
                    <div className="content-overlay-header-navigation-actions">
                        <a><MdOutlineHome /> Home</a>
                        <a><MdPowerSettingsNew /> Logout</a>
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
                                return <div className="content-overlay-header-content-actions-search-action">
                                    <MdSearch className="content-overlay-header-content-actions-search-icon" />
                                    <input type="text" placeholder={(action as ContentSearchAction).placeholder} onChange={(e) => {
                                        const searchAction = action as ContentSearchAction;
                                        searchAction.onSearchTextChanged(e.target.value);
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
    );
};

export default ContentOverlay;