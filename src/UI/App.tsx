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

function App() {
    return (
        <Providers>
            <Menu />
            <Routes>
                <Route path="/create-transaction" element={
                    <CreateTransactionOverlay />
                } />
                <Route path="/transactions/:tab" element={
                    <TransactionsOverlay />
                } />
                <Route path="/storage" element={
                    <StorageOverlay />
                } />
                <Route path="/accounts" element={
                    <AccountsOverlay />
                } />
            </Routes>
        </Providers>
    );
}

export default App;
