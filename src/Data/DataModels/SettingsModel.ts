import {ThemeType} from "../EnumTypes/ThemeType";
import {LanguageType} from "../EnumTypes/LanguageType";
import {AccountVisibilityType} from "../EnumTypes/AccountVisibilityType";

export class SettingsModel {
    currentUserUid: string;
    currentAccountUid: string;
    currentAccountVisibility: AccountVisibilityType;
    theme: ThemeType;
    language: LanguageType;

    constructor(currentUserUid?: string, currentAccountUid?: string, currentAccountVisibility?: AccountVisibilityType, theme?: ThemeType, language?: LanguageType) {
        this.currentUserUid = currentUserUid || "";
        this.currentAccountUid = currentAccountUid || "";
        this.currentAccountVisibility = currentAccountVisibility || AccountVisibilityType.PRIVATE;
        this.theme = theme || ThemeType.SYSTEM;
        this.language = language !== undefined ? language : navigator.language === "de" ? LanguageType.GERMAN : LanguageType.ENGLISH;
    }
}