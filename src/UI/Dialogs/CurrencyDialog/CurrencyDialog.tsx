import React, {useEffect} from 'react';
import DialogOverlay from "../DialogOverlay/DialogOverlay";
import {ContentAction} from "../../../Data/ContentAction/ContentAction";
import AutoCompleteInputComponent from "../../Components/Input/AutoCompleteInput/AutoCompleteInputComponent";
import {InputNameValueModel} from "../../../Data/DataModels/Input/InputNameValueModel";
import CurrencyInputComponent from "../../Components/Input/CurrencyInput/CurrencyInputComponent";
import InputBaseComponent from "../../Components/Input/InputBase/InputBaseComponent";
import './CurrencyDialog.scss';
import {LuEqual} from "react-icons/lu";
import {
    calculateCurrencyWithRate,
    getCurrencyOptions,
    getCurrencyRate,
    getDefaultCurrency
} from "../../../Helper/CurrencyHelper";
import {useDialog} from "../../../Providers/DialogProvider";
import {CurrencyModel} from "../../../Data/DataModels/CurrencyModel";
import {useTranslation} from "../../../CustomHooks/useTranslation";
import {useCurrentAccount} from "../../../Providers/AccountProvider";

const CurrencyDialog = ({
    value,
    currentCurrency,
    onCurrencyChange,
    currencyRateIsDisabled = false
}: {
    value: number | null | undefined,
    currentCurrency: CurrencyModel,
    onCurrencyChange: (value: CurrencyModel) => void,
    currencyRateIsDisabled?: boolean
}) => {
    const translate = useTranslation()
    const currentAccount = useCurrentAccount()
    const dialog = useDialog();

    const currencyOptions = getCurrencyOptions()

    const [selectedCurrency, setSelectedCurrency] = React.useState<InputNameValueModel<string>>(currencyOptions[0]);
    const [currencyRateSelectedToBase, setCurrencyRateSelectedToBase] = React.useState<number>(1);
    const [currencyRateBaseToSelected, setCurrencyRateBaseToSelected] = React.useState<number>(1);


    useEffect(() => {
        setSelectedCurrency(currencyOptions.find(option => option.value === currentCurrency.currencyCode) || currencyOptions[0])
    }, []);

    useEffect(() => {
        if (!currentAccount) return
        
        setCurrencyRateSelectedToBase(
            getCurrencyRate(selectedCurrency.value!, currentAccount?.currencyCode)
        )
        setCurrencyRateBaseToSelected(
            getCurrencyRate(currentAccount?.currencyCode!, selectedCurrency.value!)
        )
    }, [selectedCurrency, currentAccount]);

    return (
        <DialogOverlay
            actions={!currencyRateIsDisabled && selectedCurrency.value !== currentAccount?.currencyCode ? [
                new ContentAction(
                    translate("apply"),
                    () => {
                        dialog.closeCurrent()
                        onCurrencyChange(new CurrencyModel(
                            selectedCurrency.value!,
                            currentAccount?.currencyCode,
                            currencyRateSelectedToBase
                        ))
                    }
                ),
                new ContentAction(
                    translate("load-current-rates"),
                    () => {
                        setCurrencyRateSelectedToBase(
                            getCurrencyRate(selectedCurrency.value!, currentAccount?.currencyCode!)
                        )
                        setCurrencyRateBaseToSelected(
                            getCurrencyRate(currentAccount?.currencyCode!, selectedCurrency.value!)
                        )
                    }
                )
            ] : [
                new ContentAction(
                    translate("apply"),
                    () => {
                        dialog.closeCurrent()
                        onCurrencyChange(
                            new CurrencyModel(
                                selectedCurrency.value!,
                                currentAccount?.currencyCode,
                                currencyRateSelectedToBase
                            )
                        )
                    }
                )
            ]}
        >
            <AutoCompleteInputComponent
                title={translate("currency")}
                value={selectedCurrency}
                onValueChange={(value) => setSelectedCurrency(value as InputNameValueModel<string>)}
                suggestions={currencyOptions}
                selectAtLeastOne={true}
            />
            { !currencyRateIsDisabled && selectedCurrency.value !== currentAccount?.currencyCode && <>
                <InputBaseComponent title={translate("currency-rate")}>
                    <div className="currency-dialog-currency-rate">
                        <CurrencyInputComponent
                            value={1}
                            centerText={true}
                            suffix={" " + selectedCurrency.value}
                            disabled={true}
                        />
                        <LuEqual id="equals-icon"/>
                        <CurrencyInputComponent
                            value={currencyRateSelectedToBase}
                            onValueChange={(value) => {
                                setCurrencyRateSelectedToBase(value)
                                setCurrencyRateBaseToSelected(1 / value)
                            }}
                            centerText={true}
                            suffix={" " + currentAccount?.currencyCode}
                        />
                    </div>
                    <div className="currency-dialog-currency-rate">
                        <CurrencyInputComponent
                            value={1}
                            centerText={true}
                            suffix={" " + currentAccount?.currencyCode}
                            disabled={true}
                        />
                        <LuEqual id="equals-icon"/>
                        <CurrencyInputComponent
                            value={currencyRateBaseToSelected}
                            onValueChange={(value) => {
                                setCurrencyRateBaseToSelected(value)
                                setCurrencyRateSelectedToBase(1 / value)
                            }}
                            centerText={true}
                            suffix={" " + selectedCurrency.value}
                        />
                    </div>
                    <div className="currency-dialog-currency-rate">
                        <CurrencyInputComponent
                            value={value}
                            centerText={true}
                            suffix={" " + selectedCurrency.value}
                            disabled={true}
                        />
                        <LuEqual id="equals-icon"/>
                        <CurrencyInputComponent
                            value={calculateCurrencyWithRate(value || 0, currentAccount?.currencyCode!, selectedCurrency.value!, currencyRateSelectedToBase)}
                            centerText={true}
                            suffix={" " + currentAccount?.currencyCode}
                            disabled={true}
                        />
                    </div>
                </InputBaseComponent>
            </>}
        </DialogOverlay>
    );
};

export default CurrencyDialog;