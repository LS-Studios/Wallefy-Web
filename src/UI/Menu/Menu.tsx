import React, {useEffect} from 'react';
import './Menu.scss';
import {
    MdAddCircleOutline, MdHelpOutline, MdInventory,
    MdOutlineAccountCircle,
    MdOutlineBarChart,
    MdOutlineMonetizationOn,
    MdSettings
} from "react-icons/md";
import Divider from "../Components/Divider/Divider";
import {RoutePath} from "../../Data/Menu/RoutePath";
const Menu = () => {
    return (
        <div className="menu">
            <div className="menu-app-title">Wallefy</div>
            <Divider />
            <nav className="menu-navigation main">
                <ul>
                    <li id={window.location.pathname === RoutePath.CREATE_TRANSACTION ? "selected" : ""}><MdAddCircleOutline className="menu-nav-icon"/> <a href={RoutePath.CREATE_TRANSACTION}>Create transaction</a></li>
                    <li id={window.location.pathname === RoutePath.TRANSACTION_OVERVIEW ? "selected" : ""}><MdOutlineBarChart className="menu-nav-icon"/> <a href={RoutePath.TRANSACTION_OVERVIEW}>Transaction overview</a></li>
                    <li id={window.location.pathname === RoutePath.TRANSACTIONS ? "selected" : ""}><MdOutlineMonetizationOn className="menu-nav-icon"/> <a href={RoutePath.TRANSACTIONS}>Transactions</a></li>
                    <li id={window.location.pathname === RoutePath.STORAGE ? "selected" : ""}><MdInventory className="menu-nav-icon"/> <a href={RoutePath.STORAGE}>Storage</a></li>
                    <li id={window.location.pathname === RoutePath.ACCOUNTS ? "selected" : ""}><MdOutlineAccountCircle className="menu-nav-icon"/> <a href={RoutePath.ACCOUNTS}>Accounts</a></li>
                </ul>
            </nav>
            <div className="menu-bottom">
                <Divider />
                <nav className="menu-navigation">
                    <ul>
                        <li><MdSettings className="menu-nav-icon"/> <a href="/settings">Settings</a></li>
                        <li><MdHelpOutline className="menu-nav-icon"/> <a href="/help">Help</a></li>
                    </ul>
                </nav>
            </div>
        </div>
    );
};

export default Menu;