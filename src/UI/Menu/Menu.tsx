import React, {useEffect} from 'react';
import './Menu.scss';
import {
    MdAddCircleOutline,
    MdHelpOutline,
    MdHome,
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

const Menu = () => {
    const translate = useTranslation()
    const dialog = useDialog()

    const navigate = useNavigate()
    const location = useLocation()
    const [currentRoute, setCurrentRoute] = React.useState(location.pathname);

    const { currentAccount } = useCurrentAccount();

    useEffect(() => {
        setCurrentRoute(location.pathname)
    }, [location]);

    const getMenuItemComponent = (route: string | (() => void), Icon: IconType, name: string) => {
        let onClick = () => {}

        if (typeof route === 'string') {
            onClick = () => navigate(route)
        } else {
            onClick = route
        }

        return <li onClick={onClick} id={currentRoute === route ? "selected" : ""}><Icon className="menu-nav-icon"/>{name}</li>
    }

    return (
        <div className="menu">
            <div className="menu-app-title">Wallefy</div>
            <Divider />
            <nav className="menu-navigation main">
                <ul>
                    {getMenuItemComponent(RoutePath.HOME, MdHome, translate("home"))}
                    {getMenuItemComponent(RoutePath.CREATE_TRANSACTION, MdAddCircleOutline, translate("create-transaction"))}
                    {currentAccount?.type === AccountType.DEFAULT && getMenuItemComponent(RoutePath.TRANSACTION_OVERVIEW, MdOutlineBarChart, translate("transaction-overview"))}
                    {currentAccount?.type === AccountType.DEBTS && getMenuItemComponent(RoutePath.EVALUATION, MdOutlineBarChart, translate("evaluation"))}
                    {getMenuItemComponent(RoutePath.TRANSACTIONS, MdOutlineMonetizationOn, translate("transactions"))}
                    {getMenuItemComponent(RoutePath.STORAGE, MdInventory, translate("storage"))}
                    {getMenuItemComponent(RoutePath.ACCOUNTS, MdOutlineAccountCircle, translate("accounts"))}
                </ul>
            </nav>
            <div className="menu-bottom">
                <Divider />
                <nav className="menu-navigation">
                    <ul>
                        {getMenuItemComponent(() => {
                            dialog.open(
                                new DialogModel(
                                    translate("settings"),
                                    <SettingsDialog />
                                )
                            )
                        }, MdSettings, translate("settings"))}
                        {getMenuItemComponent(() => {

                        }, MdHelpOutline, translate("help"))}
                    </ul>
                </nav>
            </div>
        </div>
    );
};

export default Menu;