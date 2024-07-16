import {ThemeType} from "../EnumTypes/ThemeType";
import {LanguageType} from "../EnumTypes/LanguageType";

export class SettingsModel {
    currentUserUid: string;
    currentAccountUid: string;
    theme: ThemeType;
    language: LanguageType;

    constructor(currentUserUid?: string, currentAccountUid?: string, theme?: ThemeType, language?: LanguageType) {
        this.currentUserUid = currentUserUid || "";
        this.currentAccountUid = currentAccountUid || "";
        this.theme = theme || ThemeType.SYSTEM;
        this.language = language !== undefined ? language : navigator.language === "de" ? LanguageType.GERMAN : LanguageType.ENGLISH;
    }
}