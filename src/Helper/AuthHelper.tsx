import {AuthenticationErrorModel} from "../Data/ErrorModels/AuthenticationErrorModel";
import React from "react";
import {getActiveDatabaseHelper} from "./Database/ActiveDBHelper";
import {AccountModel} from "../Data/DatabaseModels/AccountModel";
import {UserDataModel} from "../Data/DatabaseModels/UserDataModel";

export function login(email: string, password: string, newAccount: AccountModel): Promise<UserDataModel> {
    return new Promise<UserDataModel>((resolve, reject) => {
        const errorModel = new AuthenticationErrorModel()

        if (email === "" || !checkIfEmailIsValid(email)) {
            reject({
                ...errorModel,
                emailError: true,
            } as AuthenticationErrorModel)
        } else if (password === "") {
            reject({
                ...errorModel,
                passwordError: true,
            } as AuthenticationErrorModel)
        } else {
            getActiveDatabaseHelper().dbLogin(email, password, newAccount).then((user: UserDataModel) => {
                resolve(user)
            }).catch((error: any) => {
                reject({
                    ...errorModel,
                    userNotFound: true,
                } as AuthenticationErrorModel)
            })
        }
    })
}

export function signup(translate: (key: string) => string, user: UserDataModel, password: string, newAccount: AccountModel): Promise<UserDataModel> {
    return new Promise<UserDataModel>((resolve, reject) => {
        const errorModel = new AuthenticationErrorModel()

        const passwordCheck = checkIfPasswordIsValid(password, translate)
        if (user.email === "" || !checkIfEmailIsValid(user.email)) {
            reject({
                ...errorModel,
                emailError: true,
            } as AuthenticationErrorModel)
        } else if (password === "") {
            reject({
                ...errorModel,
                passwordError: true,
            } as AuthenticationErrorModel)
        } else if (passwordCheck) {
            reject([{
                ...errorModel,
                passwordError: true,
            } as AuthenticationErrorModel, passwordCheck])
        } else {
            getActiveDatabaseHelper().dbSignUp(user, password, newAccount).then((user: UserDataModel) => {
                resolve(user)
            }).catch((error: any) => {
                reject({
                    ...errorModel,
                    emailAlreadyInUse: true,
                } as AuthenticationErrorModel)
            })
        }
    })
}

export function checkIfEmailIsValid(email: string): boolean {
    const regexp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    return regexp.test(email)
}

function checkIfPasswordIsValid(password: string, translate: (key: string) => string): React.ReactNode | null {
    const regex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*\-.,]).{6,}$/;

    if (!regex.test(password)) {
        return <div>
            {translate("the_entered_password_is_not_valid")}<br/>
            {(password.length < 6 ? "[✗] " : "[✓] ") + translate("password_not_valid_length")}<br/>
            {(!/[A-Z]/.test(password) ? "[✗] " : "[✓] ") + translate("password_not_valid_uppercase")}<br/>
            {(!/[a-z]/.test(password) ? "[✗] " : "[✓] ") + translate("password_not_valid_lowercase")}<br/>
            {(!/[0-9]/.test(password) ? "[✗] " : "[✓] ") + translate("password_not_valid_number")}<br/>
            {(!/[#?!@$%^&*\-.,]/.test(password) ? "[✗] " : "[✓] ") + translate("password_not_valid_special_character")}
        </div>
    }

    return null;
}