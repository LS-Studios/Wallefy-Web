import React, {useEffect} from 'react';
import './Menu.scss';
import {
    MdAddCircleOutline, MdClose,
    MdHelpOutline,
    MdHome, MdIcecream,
    MdInventory,
    MdOutlineAccountCircle,
    MdOutlineBarChart,
    MdOutlineMonetizationOn,
    MdSettings
} from "react-icons/md";
import Divider from "../Components/Divider/Divider";
import {RoutePath} from "../../Data/EnumTypes/RoutePath";
import {useLocation, useNavigate} from "react-router-dom";
import {IconType} from "react-icons";
import {useDialog} from "../../Providers/DialogProvider";
import {DialogModel} from "../../Data/DataModels/DialogModel";
import SettingsDialog from "../Dialogs/SettingsDialog/SettingsDialog";
import {useTranslation} from "../../CustomHooks/useTranslation";
import {useCurrentAccount} from "../../Providers/AccountProvider";
import {AccountType} from "../../Data/EnumTypes/AccountType";
import {useScreenScaleStep} from "../../CustomHooks/useScreenScaleStep";

const Menu = ({
    menuIsOpen,
    setMenuIsOpen
  }: {
    menuIsOpen: boolean,
    setMenuIsOpen: (isOpen: boolean) => void
}) => {
    const translate = useTranslation()
    const dialog = useDialog()
    const screenScaleStep = useScreenScaleStep()

    const navigate = useNavigate()
    const location = useLocation()
    const [currentRoute, setCurrentRoute] = React.useState(location.pathname);

    const { currentAccount } = useCurrentAccount();

    useEffect(() => {
        setCurrentRoute(location.pathname)
    }, [location]);

    const getMenuItemComponent = (id: string, route: string | (() => void), Icon: IconType, name: string) => {
        let onClick = () => {}

        if (typeof route === 'string') {
            onClick = () => {
                navigate(route)
                setMenuIsOpen(false)
            }
        } else {
            onClick = () => {
                route()
                setMenuIsOpen(false)
            }
        }

        return <li id={id} onClick={onClick} className={currentRoute === route ? "selected" : ""}><Icon className="menu-nav-icon"/>{name}</li>
    }

    return (
        <div className="menu" style={{
            width:  screenScaleStep < 1 ? "300px" : (menuIsOpen ? (screenScaleStep > 1 ? "100%" : "300px") : "300px"),
            left: screenScaleStep < 1 ? "0" : (menuIsOpen ? "0" : "-300px")
        }}>
            <div className="menu-app-title-container">
                <div className="menu-app-title">
                    <span>Wallefy</span>
                </div>
                { screenScaleStep > 0 && <MdClose onClick={() => {
                    setMenuIsOpen(false)
                }} /> }
            </div>
            <Divider />
            <nav className="menu-navigation main">
                <ul>
                    {getMenuItemComponent("menu-home", RoutePath.HOME, MdHome, translate("home"))}
                    {getMenuItemComponent("menu-create-transactions", RoutePath.CREATE_TRANSACTION, MdAddCircleOutline, translate("create-transaction"))}
                    {currentAccount?.type === AccountType.DEFAULT && getMenuItemComponent("menu-overview", RoutePath.TRANSACTION_OVERVIEW, MdOutlineBarChart, translate("transaction-overview"))}
                    {currentAccount?.type === AccountType.DEBTS && getMenuItemComponent("menu-evaluation", RoutePath.EVALUATION, MdOutlineBarChart, translate("evaluation"))}
                    {getMenuItemComponent("menu-transactions", RoutePath.TRANSACTIONS, MdOutlineMonetizationOn, translate("transactions"))}
                    {getMenuItemComponent("menu-storage", RoutePath.STORAGE, MdInventory, translate("storage"))}
                    {getMenuItemComponent("menu-accounts", RoutePath.ACCOUNTS, MdOutlineAccountCircle, translate("accounts"))}
                </ul>
            </nav>
            <div className="menu-bottom">
                <Divider />
                <nav className="menu-navigation">
                    <ul>
                        {getMenuItemComponent("menu-settings", () => {
                            dialog.open(
                                new DialogModel(
                                    translate("settings"),
                                    <SettingsDialog />
                                )
                            )
                        }, MdSettings, translate("settings"))}
                        {getMenuItemComponent("menu-help", () => {

                        }, MdHelpOutline, translate("help"))}
                    </ul>
                </nav>
            </div>
        </div>
    )
};

export default Menu;