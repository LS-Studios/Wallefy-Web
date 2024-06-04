import React, {useEffect} from 'react';
import './App.scss';
import Menu from "./Menu/Menu";
import {Route, Routes} from "react-router-dom";
import TransactionsOverlay from "./Screens/Transactions/TransactionsOverlay";
import CreateTransactionOverlay from "./Screens/CreateTransaction/CreateTransactionOverlay";
import Providers from "../Providers/Providers";
import AccountsOverlay from "./Screens/Accounts/AccountsOverlay"
import {getDatabase} from "../Database/AceBaseDatabase";
import {AceBase} from "acebase";
import StorageOverlay from "./Screens/Storage/StorageOverlay";
import {RoutePath} from "../Data/Menu/RoutePath";
import TransactionOverviewOverlay from "./Screens/TransactionOverview/TransactionOverviewOverlay";

function App() {
    return (
        <Providers>
            <Menu />
            <Routes>
                <Route path={RoutePath.CREATE_TRANSACTION} element={
                    <CreateTransactionOverlay />
                } />
                <Route path={RoutePath.TRANSACTION_OVERVIEW} element={
                    <TransactionOverviewOverlay />
                } />
                <Route path={RoutePath.TRANSACTIONS} element={
                    <TransactionsOverlay />
                } />
                <Route path={RoutePath.STORAGE} element={
                    <StorageOverlay />
                } />
                <Route path={RoutePath.ACCOUNTS} element={
                    <AccountsOverlay />
                } />
            </Routes>
        </Providers>
    );
}

export default App;
