import React from 'react';
import './Menu.scss';
import {
    MdAddCircleOutline, MdHelpOutline, MdInventory,
    MdOutlineAccountCircle,
    MdOutlineBarChart,
    MdOutlineMonetizationOn,
    MdSettings
} from "react-icons/md";
import Divider from "../Components/Divider/Divider";
const Menu = () => {
    return (
        <div className="menu">
            <div className="menu-app-title">Wallefy</div>
            <Divider />
            <nav className="menu-navigation main">
                <ul>
                    <li><MdAddCircleOutline className="menu-nav-icon"/> <a href="/create-transaction">Create transaction</a></li>
                    <li><MdOutlineBarChart className="menu-nav-icon"/> <a href="/transaction-overview">Transaction overview</a></li>
                    <li><MdOutlineMonetizationOn className="menu-nav-icon"/> <a href="/transactions/presets">Transactions</a></li>
                    <li><MdInventory className="menu-nav-icon"/> <a href="/storage">Storage</a></li>
                    <li><MdOutlineAccountCircle className="menu-nav-icon"/> <a href="/accounts">Accounts</a></li>
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