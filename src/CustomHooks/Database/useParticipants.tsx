import {useEffect, useState} from "react";
import {DatabaseRoutes} from "../../Helper/DatabaseRoutes";
import {useAccountRoute} from "./useAccountRoute";
import {DebtModel} from "../../Data/DatabaseModels/DebtModel";
import {getActiveDatabaseHelper} from "../../Helper/Database/ActiveDBHelper";
import {TransactionPartnerModel} from "../../Data/DatabaseModels/TransactionPartnerModel";
import {UserDataModel} from "../../Data/DatabaseModels/UserDataModel";

export const useParticipants = (accountUid: string | null) => {
    const getDatabaseRoute = useAccountRoute()
    const [participants, setParticipants] = useState<TransactionPartnerModel[] | null>(null);

    useEffect(() => {
        if (!getDatabaseRoute || !accountUid) return

        getActiveDatabaseHelper().getDBObjectOnChange(
            `${DatabaseRoutes.PUBLIC_ACCOUNT_USERS}/${accountUid}`,
            (users) => {
                setParticipants([])

                if (!users)return

                Object.keys(users).forEach((userUid) => {
                    getActiveDatabaseHelper().getDBUserByUid(userUid).then((userData) => {
                        if (userData) {
                            const newTransactionPartner = new TransactionPartnerModel(
                                Object.values(users)[0] as string,
                                userData.email,
                                true
                            );

                            setParticipants((prev) => {
                                if (!prev) return [newTransactionPartner]

                                const index = prev.findIndex(acc => acc.uid === userData.uid);
                                newTransactionPartner.uid = userUid

                                if (index !== -1) {
                                    const updatedAccounts = [...prev];
                                    updatedAccounts[index] = newTransactionPartner
                                    return updatedAccounts;
                                }

                                return [...prev, newTransactionPartner];
                            })
                        }
                    })
                })
            }
        )
    }, [getDatabaseRoute, accountUid]);

    return participants
}