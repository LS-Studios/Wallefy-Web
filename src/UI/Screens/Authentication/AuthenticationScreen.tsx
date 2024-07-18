import React, {useEffect} from 'react';
import "./AuthenticationScreen.scss";
import TextInputComponent from "../../Components/Input/TextInput/TextInputComponent";
import ButtonInputComponent from "../../Components/Input/ButtonInput/ButtonInputComponent";
import Divider from "../../Components/Divider/Divider";
import {AuthType} from "../../../Data/EnumTypes/AuthType";
import {login, signup} from "../../../Helper/AuthHelper";
import {AuthenticationErrorModel} from "../../../Data/ErrorModels/AuthenticationErrorModel";
import {useToast} from "../../../Providers/Toast/ToastProvider";
import {MdDarkMode, MdLanguage, MdLightMode} from "react-icons/md";
import {useSettings} from "../../../Providers/SettingsProvider";
import {LanguageType} from "../../../Data/EnumTypes/LanguageType";
import {ThemeType} from "../../../Data/EnumTypes/ThemeType";
import {DatabaseRoutes} from "../../../Helper/DatabaseRoutes";
import {SettingsModel} from "../../../Data/DataModels/SettingsModel";
import {useDialog} from "../../../Providers/DialogProvider";
import {DialogModel} from "../../../Data/DataModels/DialogModel";
import OptionDialog from "../../Dialogs/OptionDialog/OptionDialog";
import {useTranslation} from "../../../CustomHooks/useTranslation";
import {UserModel} from "../../../Data/DatabaseModels/UserModel";
import {useNavigate} from "react-router-dom";
import {useThemeDetector} from "../../../CustomHooks/useThemeDetector";
import {getActiveDatabaseHelper} from "../../../Helper/Database/ActiveDBHelper";
import CurrencyInputComponent from "../../Components/Input/CurrencyInput/CurrencyInputComponent";
import {CurrencyModel} from "../../../Data/DataModels/CurrencyModel";
import {getDefaultCurrency} from "../../../Helper/CurrencyHelper";
import {AccountModel} from "../../../Data/DatabaseModels/AccountModel";
import {DatabaseType} from "../../../Data/EnumTypes/DatabaseType";

const AuthenticationScreen = () => {
    const navigate = useNavigate()

    const dialog = useDialog()
    const toast = useToast()
    const translate = useTranslation()

    const settings = useSettings()
    const systemTheme = useThemeDetector()

    const [authType, setAuthType] = React.useState<AuthType>(AuthType.LOGIN)

    const [email, setEmail] = React.useState<string>("")
    const [name, setName] = React.useState<string>("")
    const [password, setPassword] = React.useState<string>("")
    const [repeatPassword, setRepeatPassword] = React.useState<string>("")
    const [startingBalance, setStartingBalance] = React.useState<number | null>(null)
    const [selectedCurrency, setSelectedCurrency] = React.useState<CurrencyModel | null>(null)

    const [error, setError] = React.useState<AuthenticationErrorModel>(new AuthenticationErrorModel())

    const [language, setLanguage] = React.useState<LanguageType>(navigator.language === "de" ? LanguageType.GERMAN : LanguageType.ENGLISH)
    const [theme, setTheme] = React.useState<ThemeType>(ThemeType.SYSTEM)

    const languageOptions = [
        {name: translate("english"), value: LanguageType.ENGLISH},
        {name: translate("german"), value: LanguageType.GERMAN},
    ]

    const themeOptions = [
        {name: translate("system"), value: ThemeType.SYSTEM},
        {name: translate("light"), value: ThemeType.LIGHT},
        {name: translate("dark"), value: ThemeType.DARK},
    ]

    useEffect(() => {
        setError(new AuthenticationErrorModel())
        setEmail("")
        setName("")
        setPassword("")
        setRepeatPassword("")
        setStartingBalance(null)
        setSelectedCurrency(getDefaultCurrency(null))
    }, [authType]);

    useEffect(() => {
        if (settings && (settings.theme !== theme || settings.language !== language)) {
            getActiveDatabaseHelper(DatabaseType.ACE_BASE).setDBObject(
                DatabaseRoutes.SETTINGS,
                {
                    ...settings,
                    theme: theme,
                    language: language
                } as SettingsModel
            )
        }
    }, [settings, theme, language]);
    
    const loginInputs = <>
        <TextInputComponent
            title={translate("email")}
            value={email}
            onValueChange={(value) => setEmail(value as string)}
            placeholder=" "
            style={{
                borderColor: error.emailError ? "var(--error-color)" : ""
            }}
        />
        <TextInputComponent
            title={translate("password")}
            value={password}
            placeholder=" "
            type="password"
            onValueChange={(value) => setPassword(value as string)}
            style={{
                borderColor: error.passwordError ? "var(--error-color)" : ""
            }}
        />
        <ButtonInputComponent
            text={translate("login")}
            onClick={() => {
                setError(new AuthenticationErrorModel())

                if (!email) {
                    setError({...error, emailError: true})
                    toast.open(translate("please-enter-an-email"))
                    return
                } else if (!password) {
                    setError({...error, passwordError: true})
                    toast.open(translate("please-enter-a-password"))
                    return
                }

                login(email, password).then((user) => {
                    getActiveDatabaseHelper(DatabaseType.ACE_BASE).setDBObject(DatabaseRoutes.SETTINGS, {
                        ...settings,
                        currentUserUid: user.uid,
                        currentAccountUid: user.currentAccountUid
                    }).then(() => {
                        navigate("/home")
                    })
                }).catch((error: AuthenticationErrorModel) => {
                    setError(error)

                    if (error.userNotFound) {
                        toast.open(translate("user-not-found"))
                    } else if (error.emailError) {
                        toast.open(translate("invalid-email"))
                    } else if (error.passwordError) {
                        toast.open(translate("invalid-password"))
                    }
                })
            }}
        />
    </>

    const signUpInfo = <>
        <h2>{translate("new-here")}</h2>
        <p>{translate("sign-up-info-text")}</p>
        <ButtonInputComponent
            text={translate("sign-up")}
            onClick={() => {
                setAuthType(AuthType.SIGN_UP)
            }}
        />
    </>

    const signUpInputs = <>
        <TextInputComponent
            title={translate("email")}
            value={email}
            placeholder=" "
            onValueChange={(value) => setEmail(value as string)}
            style={{
                borderColor: error.emailError ? "var(--error-color)" : ""
            }}
        />
        <TextInputComponent
            title={translate("name")}
            value={name}
            placeholder=" "
            onValueChange={(value) => setName(value as string)}
            style={{
                borderColor: error.nameError ? "var(--error-color)" : ""
            }}
        />
        <TextInputComponent
            title={translate("password")}
            value={password}
            placeholder=" "
            type="password"
            onValueChange={(value) => setPassword(value as string)}
            style={{
                borderColor: error.passwordError ? "var(--error-color)" : ""
            }}
        />
        <TextInputComponent
            title={translate("repeat-password")}
            value={repeatPassword}
            placeholder=" "
            type="password"
            onValueChange={(value) => setRepeatPassword(value as string)}
            style={{
                borderColor: error.repeatPasswordError ? "var(--error-color)" : ""
            }}
        />
        <CurrencyInputComponent
            title={translate("starting-balance")}
            value={startingBalance}
            onValueChange={setStartingBalance}
            currency={selectedCurrency}
            onCurrencyChange={setSelectedCurrency}
            currencyRateIsDisabled={true}
        />
        <ButtonInputComponent
            text={translate("sign-up")}
            onClick={() => {
                const newError = new AuthenticationErrorModel()
                setError(newError)

                if (!email) {
                    setError({...newError, emailError: true})
                    toast.open(translate("please-enter-an-email"))
                    return
                } else if (!name) {
                    setError({...newError, nameError: true})
                    toast.open(translate("please-enter-a-name"))
                    return
                } else if (!password) {
                    setError({...newError, passwordError: true})
                    toast.open(translate("please-enter-a-password"))
                    return
                } else if (password !== repeatPassword) {
                    setError({...newError, repeatPasswordError: true})
                    toast.open(translate("passwords-do-not-match"))
                    return
                }

                const newAccount = new AccountModel(
                    translate("private-account"),
                    startingBalance || 0,
                )

                newAccount.currencyCode = selectedCurrency?.currencyCode || getDefaultCurrency(null).currencyCode

                signup(
                    translate,
                    new UserModel(
                        name,
                        email,
                        password
                    ),
                    newAccount
                ).then((newUser) => {
                    console.log(newUser)
                    getActiveDatabaseHelper(DatabaseType.ACE_BASE).setDBObject(DatabaseRoutes.SETTINGS, {
                        ...settings,
                        currentUserUid: newUser.uid,
                        currentAccountUid: newUser.currentAccountUid
                    }).then(() => {
                        navigate("/home")
                    })
                }).catch((error: AuthenticationErrorModel | [AuthenticationErrorModel, React.ReactNode]) => {
                    const errorModel = Array.isArray(error) ? error[0] : error
                    const errorMessage = Array.isArray(error) ? error[1] : null

                    setError(errorModel)

                    if (errorMessage) {
                        toast.open(errorMessage)
                        return
                    }


                    if (errorModel.userNotFound) {
                        toast.open(translate("user-not-found"))
                    } else if (errorModel.emailError) {
                        toast.open(translate("invalid-email"))
                    } else if (errorModel.passwordError) {
                        toast.open(translate("invalid-password"))
                    } else if (errorModel.emailAlreadyInUse) {
                        toast.open(translate("email-already-in-use"))
                    }
                })
            }}
        />
    </>

    const loginInfo = <>
        <h2>{translate("already-have-an-account")}</h2>
        <p>{translate("login-info-text")}</p>
        <ButtonInputComponent
            text={translate("login")}
            onClick={() => {
                setAuthType(AuthType.LOGIN)
            }}
        />
    </>

    const getThemeIcon = (isLight: boolean) => {
        return isLight ? <MdLightMode /> : <MdDarkMode />
    }

    return (
        <div className="authentication-screen">
            <div className="authentication-screen-settings">
                <div onClick={() => {
                    dialog.open(
                        new DialogModel(
                            translate("language"),
                            <OptionDialog
                                currentOption={languageOptions.find((option) => option.value === language)!}
                                onOptionChange={(languageOption) => setLanguage(languageOption.value)}
                                options={languageOptions}
                            />
                        )
                    )
                }}>
                    <MdLanguage />
                </div>
                <div onClick={() => {
                    dialog.open(
                        new DialogModel(
                            translate("theme"),
                            <OptionDialog
                                currentOption={themeOptions.find((option) => option.value === theme)!}
                                onOptionChange={(themeOption) => setTheme(themeOption.value)}
                                options={themeOptions}
                            />
                        )
                    )
                }}>
                    { theme === ThemeType.SYSTEM ? getThemeIcon(systemTheme === ThemeType.LIGHT) : getThemeIcon(theme === ThemeType.LIGHT) }
                </div>
            </div>
            <span className="authentication-screen-title">Wallefy</span>
            <div className="authentication-screen-input-overlay">
                <div className="authentication-screen-input-overlay-input">
                    <span className="authentication-screen-input-overlay-title">
                        { authType === AuthType.LOGIN ? translate("login") : translate("sign-up") }
                    </span>
                    <Divider/>
                    <div className="authentication-screen-input-overlay-inputs">
                        { authType === AuthType.LOGIN ? loginInputs : signUpInputs }
                    </div>
                </div>
                <div className="authentication-screen-input-overlay-info">
                    { authType === AuthType.LOGIN ? signUpInfo : loginInfo }
                </div>
            </div>
        </div>
    );
};

export default AuthenticationScreen;