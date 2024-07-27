import React, {useEffect, useState} from 'react';
import {AccountModel} from "../../../Data/DatabaseModels/AccountModel";

import CurrencyInputComponent from "../../Components/Input/CurrencyInput/CurrencyInputComponent";
import RadioInputComponent from "../../Components/Input/RadioInput/RadioInputComponent";
import {InputOptionModel} from "../../../Data/DataModels/Input/InputOptionModel";
import {AccountVisibilityType} from "../../../Data/EnumTypes/AccountVisibilityType";
import TextInputComponent from "../../Components/Input/TextInput/TextInputComponent";
import AutoCompleteInputComponent from "../../Components/Input/AutoCompleteInput/AutoCompleteInputComponent";
import DialogOverlay from "../DialogOverlay/DialogOverlay";
import {ContentAction} from "../../../Data/ContentAction/ContentAction";
import {useDialog} from "../../../Providers/DialogProvider";
import {DatabaseRoutes} from "../../../Helper/DatabaseRoutes";
import {TransactionPartnerModel} from "../../../Data/DatabaseModels/TransactionPartnerModel";
import {InputNameValueModel} from "../../../Data/DataModels/Input/InputNameValueModel";
import {getListDiff, toHash} from "../../../Helper/HandyFunctionHelper";
import {CreateAccountInputErrorModel} from "../../../Data/ErrorModels/CreateAccountInputErrorModel";
import {useToast} from "../../../Providers/Toast/ToastProvider";
import {CurrencyModel} from "../../../Data/DataModels/CurrencyModel";
import {getDefaultCurrency} from "../../../Helper/CurrencyHelper";
import {useTranslation} from "../../../CustomHooks/useTranslation";
import {useCurrentAccount} from "../../../Providers/AccountProvider";
import {useSettings} from "../../../Providers/SettingsProvider";
import {useAccounts} from "../../../CustomHooks/Database/useAccounts";
import {AccountType} from "../../../Data/EnumTypes/AccountType";
import {
    addPresetsForAccount,
    deleteUserFromPublicAccounts,
    getActiveDatabaseHelper
} from "../../../Helper/Database/ActiveDBHelper";
import {DatabaseType} from "../../../Data/EnumTypes/DatabaseType";
import {useInvites} from "../../../CustomHooks/Database/useInvites";
import {useParticipants} from "../../../CustomHooks/Database/useParticipants";
import {checkIfEmailIsValid} from "../../../Helper/AuthHelper";
import {useCurrentUser} from "../../../CustomHooks/Database/useCurrentUser";
import {useAccountsRoute} from "../../../CustomHooks/Database/useAccountsRoute";
import {SettingsModel} from "../../../Data/DataModels/SettingsModel";
import {ListDiffType} from "../../../Data/EnumTypes/ListDiffType";
import {InviteModel} from "../../../Data/DataModels/InviteModel";
import {DialogModel} from "../../../Data/DataModels/DialogModel";
import InfoDialog from "../InfoDialog/InfoDialog";
import DecisionDialog from "../DecisionDialog/DecisionDialog";
import {MdShare} from "react-icons/md";
import ShareAccountDialog from "../ShareAccountDialog/ShareAccountDialog";
import {LinkInvite} from "../../../Data/DataModels/LinkInvite";
import uuid from "react-uuid";

const CreateAccountDialog = ({
    account
 }: {
    account?: AccountModel
}) => {
    const translate = useTranslation()
    const { currentAccount } = useCurrentAccount();
    const dialog = useDialog()
    const toast = useToast()

    const settings = useSettings()

    const accountVisibilityOptions = [
        new InputOptionModel(translate("private"), AccountVisibilityType.PRIVATE),
        new InputOptionModel(translate("public"), AccountVisibilityType.PUBLIC)
    ];

    const accountTypeOptions = [
        new InputOptionModel(translate("default"), AccountType.DEFAULT),
        new InputOptionModel(translate("debts"), AccountType.DEBTS)
    ];

    const [workAccount, setWorkAccount] = React.useState<AccountModel>( structuredClone(account) || new AccountModel())
    const [inputError, setInputError] = React.useState<CreateAccountInputErrorModel>(new CreateAccountInputErrorModel())

    const getDatabaseRoute = useAccountsRoute(workAccount.visibility)

    const accounts = useAccounts()
    const currentUser = useCurrentUser()

    const [isLoading, setIsLoading] = useState<boolean>(false)

    const [selectedCurrency, setSelectedCurrency] = React.useState<CurrencyModel | null>(null)

    const invites = useInvites(workAccount.uid)
    const [invitedUsersInputOptions, setInvitedUsersInputOptions] = useState<InputNameValueModel<string>[]>([])

    const participants = useParticipants(workAccount.uid)
    const [participantsInputOptions, setParticipantsInputOptions] = useState<InputNameValueModel<TransactionPartnerModel>[]>([])

    const [tempInvites, setTempInvites] = useState<string[]>([])

    const [linkInvite, setLinkInvite] = useState<LinkInvite | null>(null)

    useEffect(() => {
        if (account) {
            getActiveDatabaseHelper().getDBLinkInvite(undefined, account.uid).then((linkInvite) => {
                setLinkInvite(linkInvite)
            })
        } else {
            setLinkInvite(new LinkInvite(uuid(), "", ""))
        }
    }, []);

    useEffect(() => {
        if (account && invites) {
            setInvitedUsersInputOptions(invites.map(user => new InputNameValueModel(user, user)))
        } else if (!account && tempInvites) {
            setInvitedUsersInputOptions(tempInvites.map(user => new InputNameValueModel(user, user)))
        }
    }, [tempInvites, invites]);

    useEffect(() => {
        if (!participants) return
        setParticipantsInputOptions(participants.map(participant => new InputNameValueModel(participant.name, participant)))
    }, [participants]);

    useEffect(() => {
        setSelectedCurrency(
            {
                ...getDefaultCurrency(currentAccount?.currencyCode),
                currencyCode: workAccount.currencyCode || getDefaultCurrency(null).currencyCode
            }
        )
    }, [currentAccount]);

    useEffect(() => {
        updateAccount((oldAccount) => {
            oldAccount.currencyCode = selectedCurrency?.currencyCode || getDefaultCurrency(null).currencyCode
            return oldAccount;
        })
    }, [selectedCurrency]);

    const updateAccount = (updater: (oldAccount: AccountModel) => AccountModel) => {
        setWorkAccount((current) => {
            const newAccount = new AccountModel();
            Object.assign(newAccount, updater(current));
            return newAccount
        })
    }

    const leaveOrDeleteAccount = () => {
        if (accounts!.length === 1) {
            toast.open(translate("there-must-be-at-least-one-account"))
            return;
        } else if (workAccount.uid === currentAccount?.uid) {
            getActiveDatabaseHelper(DatabaseType.ACE_BASE).setDBObject(DatabaseRoutes.SETTINGS, {
                ...settings,
                currentAccountUid: accounts!.filter(account => account.uid !== workAccount.uid)[0].uid,
                currentAccountVisibility: accounts!.filter(account => account.uid !== workAccount.uid)[0].visibility
            } as SettingsModel)
        }

        setIsLoading(true)

        if (workAccount.visibility === AccountVisibilityType.PRIVATE) {
            getActiveDatabaseHelper().deleteDBItem(getDatabaseRoute!(), workAccount).then(() => {
                setIsLoading(false)
                dialog.closeCurrent();
            })
        } else {
            deleteUserFromPublicAccounts(currentUser!.uid, workAccount.uid, () => {
                setIsLoading(false)
                dialog.closeCurrent();
            })
        }
    }

    return (
        <DialogOverlay actions={account ? [
            ...(workAccount.uid !== currentAccount?.uid) ? [
                new ContentAction(
                    translate("switch"),
                    () => {
                        dialog.closeCurrent();
                        getActiveDatabaseHelper(DatabaseType.ACE_BASE).setDBObject(
                            DatabaseRoutes.SETTINGS,
                            {
                                ...settings,
                                currentAccountUid: workAccount.uid,
                                currentAccountVisibility: workAccount.visibility
                            } as SettingsModel
                        )
                    },
                    false,
                    isLoading
                ),
            ] : [],
            new ContentAction(
                translate("save"),
                () => {
                    dialog.closeCurrent();
                    if (workAccount.balance === null) workAccount.balance = 0;

                    getActiveDatabaseHelper().updateDBItem(getDatabaseRoute!(), workAccount)
                },
                false,
                isLoading || !getDatabaseRoute
            ),
            new ContentAction(
                translate(workAccount.visibility === AccountVisibilityType.PRIVATE ? "delete" : "leave"),
                () => {
                    leaveOrDeleteAccount()
                },
                false,
                isLoading || !getDatabaseRoute || !accounts || !currentAccount
            ),
        ] : [
            new ContentAction(
                translate("create"),
                () => {
                    if (!workAccount.name) {
                        toast.open(translate("please-enter-an-account-name!"))
                        setInputError((oldError) => {
                            const newError = new CreateAccountInputErrorModel();
                            Object.assign(newError, new CreateAccountInputErrorModel(true));
                            return newError;
                        })
                        return;
                    }
                    if (workAccount.balance === null) workAccount.balance = 0;

                    setIsLoading(true)

                    getActiveDatabaseHelper().addDBItem(getDatabaseRoute!(), workAccount).then((newAccount) => {
                        const castedAccount = newAccount as AccountModel;

                        if (workAccount.visibility === AccountVisibilityType.PUBLIC) {
                            getActiveDatabaseHelper().setDBObject(`${DatabaseRoutes.PUBLIC_ACCOUNT_USERS}/${castedAccount.uid}/${currentUser!.uid}`, castedAccount.uid)

                            getActiveDatabaseHelper().setDBObject(`${DatabaseRoutes.PUBLIC_ACCOUNT_LINK_INVITES}/${castedAccount.uid}`, {
                                ...linkInvite,
                                accountUid: castedAccount.uid,
                                accountName: castedAccount.name
                            } as LinkInvite)

                            tempInvites.map(invite => {
                                getActiveDatabaseHelper().setDBObject(`${DatabaseRoutes.PUBLIC_ACCOUNT_INVITES}/${workAccount.uid}/${toHash(invite)}`, new InviteModel(
                                    invite,
                                    castedAccount.uid,
                                    castedAccount.name
                                ))
                            })
                        }

                        addPresetsForAccount(`${getDatabaseRoute!()}/${castedAccount.uid}`, castedAccount).then(() => {
                            setIsLoading(false)
                            dialog.closeCurrent()
                        })
                    })
                },
                false,
                isLoading || !settings || !getDatabaseRoute || !currentAccount || !currentUser
            )
        ]}>
            <TextInputComponent
                title={translate("account-name")}
                value={workAccount.name}
                onValueChange={(value) => updateAccount((oldAccount) => {
                    oldAccount.name = value as string;
                    return oldAccount;
                })}
                style={{
                    borderColor: inputError.nameError ? "var(--error-color)" : "null"
                }}
            />
            <RadioInputComponent
                title={translate("account-type")}
                value={accountTypeOptions.find(option => option.value === workAccount.type)!}
                onValueChange={(value) => {
                    updateAccount((oldAccount) => {
                        oldAccount.type = (value as InputOptionModel<AccountType>).value;
                        return oldAccount;
                    });
                }}
                options={accountTypeOptions}
                disabled={account !== undefined}
            />
            { workAccount.type === AccountType.DEFAULT && <CurrencyInputComponent
                title={translate("account-balance")}
                value={workAccount.balance}
                onValueChange={(value) => {
                    updateAccount((oldAccount) => {
                        oldAccount.balance = value;
                        return oldAccount;
                    });
                }}
                currency={selectedCurrency}
                onCurrencyChange={setSelectedCurrency}
                currencyRateIsDisabled={true}
                allowNegativeValue={true}
            /> }
            <RadioInputComponent
                title={translate("account-visibility")}
                value={accountVisibilityOptions.find(option => option.value === workAccount.visibility)!}
                onValueChange={(value) => {
                    updateAccount((oldAccount) => {
                        oldAccount.visibility = (value as InputOptionModel<AccountVisibilityType>).value;
                        return oldAccount;
                    });
                }}
                options={accountVisibilityOptions}
                disabled={account !== undefined}
            />
            { workAccount.visibility === AccountVisibilityType.PUBLIC && <>
                <AutoCompleteInputComponent
                    title={translate("participants")}
                    value={participantsInputOptions}
                    onValueChange={(value) => {
                        const newParticipants = value as InputNameValueModel<TransactionPartnerModel>[] | null || []

                        getListDiff(participantsInputOptions, newParticipants, (type, items) => {
                            switch (type) {
                                case ListDiffType.Deleted:
                                    items.forEach((participant) => {
                                        if (participant.value?.uid === settings?.currentUserUid) {
                                            dialog.open(
                                                new DialogModel(
                                                    null,
                                                    <DecisionDialog
                                                        text={translate("do-you-want-to-leave-the-account")}
                                                        onYesClick={() => {
                                                            leaveOrDeleteAccount()
                                                        }}
                                                    />
                                                )
                                            )
                                        } else {
                                            getActiveDatabaseHelper().deleteDBObject(`${DatabaseRoutes.PUBLIC_ACCOUNT_USERS}/${workAccount.uid}/${participant.value?.uid}`)
                                        }
                                    })
                                    break;
                            }
                        })
                    }}
                    placeholder={translate("email-to-invite")}
                    suggestions={participantsInputOptions}
                    readonly={true}
                />
                <AutoCompleteInputComponent<string>
                    title={translate("invited-participants")}
                    value={invitedUsersInputOptions}
                    onValueChange={(value) => {
                        const newInvites = value as InputNameValueModel<string>[] | null || []

                        if (account) {
                            getListDiff(invitedUsersInputOptions, newInvites, (type, items) => {
                                switch (type) {
                                    case ListDiffType.Deleted:
                                        toast.open(translate("invite-have-been-removed"))

                                        items.forEach((invite) => {
                                            getActiveDatabaseHelper().deleteDBObject(`${DatabaseRoutes.PUBLIC_ACCOUNT_INVITES}/${workAccount.uid}/${toHash(invite.value)}`)
                                        })
                                        break;
                                }
                            })
                        } else {
                            setTempInvites(newInvites.map(invite => invite.value || ""))
                        }
                    }}
                    placeholder={translate("email-to-invite")}
                    suggestions={invitedUsersInputOptions}
                    customNewItemText={translate("invite-new-participant")}
                    customNewItemAction={(input) => {
                        if (!checkIfEmailIsValid(input)) {
                            toast.open(translate("invalid-email"))
                            return;
                        }

                        if (participants?.find(participant => participant.name === input)) {
                            toast.open(translate("participant-already-in-account"))
                            return;
                        }

                        if (account) {
                            toast.open(translate("participant-invited", input))
                            getActiveDatabaseHelper().setDBObject(`${DatabaseRoutes.PUBLIC_ACCOUNT_INVITES}/${workAccount.uid}/${toHash(input)}`, new InviteModel(
                                input,
                                workAccount.uid,
                                workAccount.name
                            ))
                        } else {
                            toast.open(translate("participant-invited-when-account-created", input))
                            setTempInvites((oldInvites) => [...oldInvites, input])
                        }
                        //TODO implement invasion with email
                    }}
                    headerIcon={MdShare}
                    onHeaderIconClick={(e) => {
                        e.stopPropagation()

                        dialog.open(
                            new DialogModel(
                                translate("invite-participants"),
                                <ShareAccountDialog
                                    linkInviteUid={linkInvite?.linkUid || ""}
                                />,
                                280
                            )
                        )

                    }}
                />
            </> }
        </DialogOverlay>
    );
};

export default CreateAccountDialog;