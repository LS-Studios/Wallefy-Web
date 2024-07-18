import React, {PropsWithChildren, useEffect, useRef} from 'react';
import './ContentOverlay.scss';
import {
    MdAddCircleOutline,
    MdCreate,
    MdIcecream,
    MdMenu,
    MdOutlineHome,
    MdPowerSettingsNew,
    MdSearch
} from "react-icons/md";
import {ContentAction} from "../../Data/ContentAction/ContentAction";
import {ContentActionInterface} from "../../Data/ContentAction/ContentActionInterface";
import {ContentActionType} from "../../Data/EnumTypes/ContentActionType";
import {ContentSearchAction} from "../../Data/ContentAction/ContentSearchAction";
import {AccountModel} from "../../Data/DatabaseModels/AccountModel";
import {DatabaseRoutes} from "../../Helper/DatabaseRoutes";
import {SettingsModel} from "../../Data/DataModels/SettingsModel";
import {useNavigate} from "react-router-dom";
import {useTranslation} from "../../CustomHooks/useTranslation";
import {useCurrentAccount} from "../../Providers/AccountProvider";
import Menu from "../Menu/Menu";
import {useScreenScaleStep} from "../../CustomHooks/useScreenScaleStep";
import {getActiveDatabaseHelper} from "../../Helper/Database/ActiveDBHelper";

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
    const screenScaleStep = useScreenScaleStep()

    const {currentAccount} = useCurrentAccount();

    const searchInputRef = useRef<HTMLInputElement>(null)

    const [menuIsOpen, setMenuIsOpen] = React.useState(false);

    const getActionButtons = (absolute: boolean) => <div className={"content-overlay-header-content-actions" + (absolute ? " absolute" : "")}>
        {actions.map((action, index) => {
            if (action.type === ContentActionType.BUTTON) {
                const buttonAction = action as ContentAction;
                return <a key={index} className="content-overlay-header-content-actions-button"
                          onClick={buttonAction.action}>
                    {buttonAction.icon}
                    {buttonAction.name}
                </a>
            } else if (action.type === ContentActionType.SEARCH) {
                return <div key={index} className="content-overlay-header-content-actions-search-action">
                    <MdSearch className="content-overlay-header-content-actions-search-icon"/>
                    <input ref={searchInputRef} type="text" placeholder={(action as ContentSearchAction).placeholder}
                           onChange={(e) => {
                               const searchAction = action as ContentSearchAction;
                               searchAction.onSearchTextChanged(e.target.value);
                           }} onKeyDown={(e) => {
                        e.key === "Enter" && searchInputRef.current?.blur()
                    }}/>
                </div>
            } else {
                return null;
            }
        })}
    </div>

    return <>
        <Menu
            menuIsOpen={menuIsOpen}
            setMenuIsOpen={setMenuIsOpen}
        />
        {(screenScaleStep < 2 || !menuIsOpen) && <div onClick={() => {
            if (screenScaleStep === 1 && menuIsOpen) {
                setMenuIsOpen(false)
            }
        }} className={"content-overlay" + (screenScaleStep === 1 && menuIsOpen ? " blurred" : "")}>
            <div className="content-overlay-header">
                <div className="content-overlay-navigation">
                    {screenScaleStep > 0 && <div className="content-overlay-navigation-page-name">
                        <MdIcecream/>
                        {screenScaleStep < 2 && <span>Wallefy</span>}
                    </div>}
                    {screenScaleStep === 0 && <div className="content-overlay-header-navigation-account"
                                                   onClick={() => navigate("/accounts")}>
                        {currentAccount?.name}
                    </div>}
                    <div className="content-overlay-header-navigation-actions">
                        <a onClick={() => navigate("/home")}>
                            <MdOutlineHome/> {translate("home")}
                        </a>
                        <a onClick={() => {
                            getActiveDatabaseHelper().dbLogout()
                        }}>
                            <MdPowerSettingsNew/> {translate("logout")}
                        </a>
                        {screenScaleStep !== 0 && <a onClick={() => {
                                setMenuIsOpen(!menuIsOpen)
                            }}>
                                <MdMenu className="content-overlay-header-navigation-actions-menu"/>
                                {screenScaleStep < 2 && translate("menu")}
                        </a>}
                    </div>
                </div>
                <div className="content-overlay-header-content">
                    <div className="content-overlay-header-content-title">
                        {titleIcon}
                        {title}
                    </div>
                    { screenScaleStep < 2 && getActionButtons(false) }
                </div>
                <hr className="content-overlay-divider"/>
            </div>
            <div className="content-overlay-body">
                {children}
                { screenScaleStep > 1 && getActionButtons(true) }
            </div>
        </div>}
    </>
};

export default ContentOverlay;