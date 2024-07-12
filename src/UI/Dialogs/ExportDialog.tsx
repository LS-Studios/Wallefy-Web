import React from 'react';
import DialogBase from "../Provider/DialogBase/DialogBase";
import DialogOverlay from "./DialogOverlay/DialogOverlay";
import {ContentAction} from "../../Data/ContentAction/ContentAction";
import {useTranslation} from "../../CustomHooks/useTranslation";
import TextInputComponent from "../Components/Input/TextInput/TextInputComponent";
import CheckboxInputComponent from "../Components/Input/CheckboxInput/CheckboxInputComponent";
import InputBaseComponent from "../Components/Input/InputBase/InputBaseComponent";
import {formatDate, formatDateToStandardString, formatTime} from "../../Helper/DateHelper";
import {ExportErrorModel} from "../../Data/ErrorModels/ExportErrorModel";
// @ts-ignore
import variables from "../../Data/Variables.scss";
import {useToast} from "../../Providers/Toast/ToastProvider";
import {useTransactions} from "../../CustomHooks/useTransactions";
import {useTransactionPartners} from "../../CustomHooks/useTransactionPartners";
import {useCategories} from "../../CustomHooks/useCategories";
import {useDialog} from "../../Providers/DialogProvider";
import {ExportDataModel} from "../../Data/DataModels/ExportDataModel";
import {usePresets} from "../../CustomHooks/usePresets";
import {useHistoryTransactions} from "../../CustomHooks/useHistoryTransactions";
import {useDebts} from "../../CustomHooks/useDebts";

const ExportDialog = () => {
    const dialog = useDialog()
    const translate = useTranslation()
    const toast = useToast()

    const [fileName, setFileName] = React.useState<string>("");
    const [useTimestamp, setUseTimestamp] = React.useState<boolean>(false);
    const [error, setError] = React.useState<ExportErrorModel>(new ExportErrorModel());

    const presets = usePresets()
    const historyTransactions = useHistoryTransactions()
    const transactions = useTransactions()
    const debts = useDebts()
    const transactionPartners = useTransactionPartners()
    const categories = useCategories()
    const labels = useCategories()

    const getFileName = () => {
        if (fileName) {
            if (useTimestamp) {
                return fileName + " - " + formatDateToStandardString(new Date()) + " " + formatTime(new Date());
            } else {
                return fileName;
            }
        } else if (useTimestamp) {
            return formatDateToStandardString(new Date()) + " " + formatTime(new Date());
        } else {
            return "";
        }
    }

    return (
        <DialogOverlay actions={[
            new ContentAction(
                translate("export"),
                () => {
                    setError(new ExportErrorModel())

                    if (!fileName) {
                        setError(new ExportErrorModel(true))
                        toast.open(translate("please-enter-a-file-name"))
                        return;
                    }

                    if (
                        !presets ||
                        !historyTransactions ||
                        !transactions ||
                        !debts ||
                        !transactionPartners ||
                        !categories ||
                        !labels
                    ) {
                        return;
                    }

                    const exportData = new ExportDataModel(
                        presets,
                        historyTransactions,
                        transactions,
                        debts,
                        categories,
                        transactionPartners,
                        labels,
                    )

                    const jsonData = new Blob([JSON.stringify(exportData)], { type: 'application/json' });
                    const jsonURL = URL.createObjectURL(jsonData);
                    const link = document.createElement('a');
                    link.href = jsonURL;
                    link.download = `${fileName}.json`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);

                    dialog.closeCurrent()
                }
            )
        ]}>
            <TextInputComponent
                title={translate("file-name")}
                value={fileName}
                onValueChange={(newName) => {
                    setFileName(newName as string);
                }}
                style={{
                    borderColor: error.fileNameError ? variables.error_color : null
                }}
            />
            <CheckboxInputComponent
                text={translate("use-timestamp")}
                value={useTimestamp}
                onValueChange={setUseTimestamp}
            />
            <InputBaseComponent
                title={translate("file-preview")}
            >
                { getFileName() + ".json"}
            </InputBaseComponent>
        </DialogOverlay>
    );
};

export default ExportDialog;