import {UserModel} from "../Data/DatabaseModels/UserModel";
import {AuthenticationErrorModel} from "../Data/ErrorModels/AuthenticationErrorModel";
import React from "react";
import {getActiveDatabaseHelper} from "./Database/ActiveDBHelper";

export function login(email: string, password: string): Promise<UserModel> {
    return new Promise<UserModel>((resolve, reject) => {
        const errorModel = new AuthenticationErrorModel()

        if (email === "") {
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
            getActiveDatabaseHelper().dbLogin(email, password).then((user: UserModel) => {
                resolve(user)
            }).catch((error: any) => {
                reject({
                    ...errorModel,
                    loginError: true,
                } as AuthenticationErrorModel)
            })
        }
    })
}

export function signup(translate: (key: string) => string, user: UserModel): Promise<UserModel> {
    return new Promise<UserModel>((resolve, reject) => {
        const errorModel = new AuthenticationErrorModel()

        const passwordCheck = checkIfPasswordIsValid(user.password, translate)

        if (user.email === "") {
            reject({
                ...errorModel,
                emailError: true,
            } as AuthenticationErrorModel)
        } else if (user.password === "") {
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
            getActiveDatabaseHelper().dbSignUp(user, translate).then((user: UserModel) => {
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