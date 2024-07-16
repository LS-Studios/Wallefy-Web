import React, {useEffect} from 'react';
import DialogOverlay from "./DialogOverlay/DialogOverlay";
import {ContentAction} from "../../Data/ContentAction/ContentAction";
import {useTranslation} from "../../CustomHooks/useTranslation";
import FileSelectionInput from "../Components/Input/FileSelectionInput/FileSelectionInput";
import {FileContent} from "use-file-picker/types";
import InputBaseComponent from "../Components/Input/InputBase/InputBaseComponent";
import {ConfigType} from "dayjs";
import CheckboxInputComponent from "../Components/Input/CheckboxInput/CheckboxInputComponent";
import {ImportErrorModel} from "../../Data/ErrorModels/ImportErrorModel";
// @ts-ignore
import variables from "../../Data/Variables.scss";
import {useToast} from "../../Providers/Toast/ToastProvider";
import {useDialog} from "../../Providers/DialogProvider";
import {ExportDataModel} from "../../Data/DataModels/ExportDataModel";
import {addDBItem} from "../../Helper/AceBaseHelper";
import {DatabaseRoutes} from "../../Helper/DatabaseRoutes";
import {useCurrentAccount} from "../../Providers/AccountProvider";
import {useDatabaseRoute} from "../../CustomHooks/useDatabaseRoute";

const ImportDialog = () => {
    const dialog = useDialog();
    const toast = useToast();
    const translate = useTranslation();
    const getDatabaseRoute = useDatabaseRoute();

    const [selectedFile, setSelectedFile] = React.useState<FileContent<ConfigType> | null>(null);

    const [importPresets, setImportPresets] = React.useState(true);
    const [importHistory, setImportHistory] = React.useState(true);
    const [importTransactions, setImportTransactions] = React.useState(true);
    const [importCategories, setImportCategories] = React.useState(true);
    const [importTransactionPartners, setImportTransactionPartners] = React.useState(true);
    const [importLabels, setImportLabels] = React.useState(true);

    const [error, setError] = React.useState<ImportErrorModel>(new ImportErrorModel());

    return (
        <DialogOverlay actions={[
            new ContentAction(
                translate("import"),
                () => {
                    setError(new ImportErrorModel())
                    if (!selectedFile) {
                        setError(new ImportErrorModel(true));
                        toast.open(translate("please-select-a-file"));
                    }

                    if (!selectedFile || typeof selectedFile.content !== "string") {
                        setError(new ImportErrorModel(true));
                        toast.open(translate("file-content-error"));
                        return
                    }

                    const fileContent: ExportDataModel = JSON.parse(selectedFile.content as string)

                    Promise.all([
                        importPresets && fileContent.presets.map((preset) => addDBItem(getDatabaseRoute!(DatabaseRoutes.PRESETS), preset)),
                        importHistory && fileContent.history.map((transaction) => addDBItem(getDatabaseRoute!(DatabaseRoutes.HISTORY_TRANSACTIONS), transaction)),
                        importTransactions && fileContent.transactions.map((transaction) => addDBItem(getDatabaseRoute!(DatabaseRoutes.TRANSACTIONS), transaction)),
                        importTransactions && fileContent.debts.map((debt) => addDBItem(getDatabaseRoute!(DatabaseRoutes.DEBTS), debt)),
                        importTransactions && fileContent.payedDebts.map((debt) => addDBItem(getDatabaseRoute!(DatabaseRoutes.PAYED_DEBTS), debt)),
                        importCategories && fileContent.categories.map((category) => addDBItem(getDatabaseRoute!(DatabaseRoutes.CATEGORIES), category)),
                        importTransactionPartners && fileContent.transactionPartners.map((partner) => addDBItem(getDatabaseRoute!(DatabaseRoutes.TRANSACTION_PARTNERS), partner)),
                        importLabels && fileContent.labels.map((label) => addDBItem(getDatabaseRoute!(DatabaseRoutes.LABELS), label))
                    ]).then(() => {
                        dialog.closeCurrent()
                    })
                },
                false,
                getDatabaseRoute! === null
            )
        ]}>
            <FileSelectionInput
                accept=".json"
                onSelectedChange={(selected) => {
                    if (selected.length > 0) {
                        setSelectedFile(selected[0]);
                    } else {
                        setSelectedFile(null);
                    }
                }}
            />
            <InputBaseComponent
                title={translate("selected-file")}
                style={{
                    borderColor: error.selectedFileError ? variables.error_color : null
                }}
            >
                { selectedFile ? selectedFile.name : <span className="no-items">No file selected</span> }
            </InputBaseComponent>
            <CheckboxInputComponent
                text={translate("import-presets")}
                disabled={!selectedFile}
                value={importPresets}
                onValueChange={setImportPresets}
            />
            <CheckboxInputComponent
                text={translate("import-past-transactions")}
                disabled={!selectedFile}
                value={importHistory}
                onValueChange={setImportHistory}
            />
            <CheckboxInputComponent
                text={translate("import-transactions")}
                disabled={!selectedFile}
                value={importTransactions}
                onValueChange={setImportTransactions}
            />
            <CheckboxInputComponent
                text={translate("import-categories")}
                disabled={!selectedFile}
                value={importCategories}
                onValueChange={setImportCategories}
            />
            <CheckboxInputComponent
                text={translate("import-transaction-partners")}
                disabled={!selectedFile}
                value={importTransactionPartners}
                onValueChange={setImportTransactionPartners}
            />
            <CheckboxInputComponent
                text={translate("import-labels")}
                disabled={!selectedFile}
                value={importLabels}
                onValueChange={setImportLabels}
            />
        </DialogOverlay>
    );
};

export default ImportDialog;