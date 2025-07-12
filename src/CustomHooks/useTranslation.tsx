import {useSettings} from "../Providers/SettingsProvider";
import {useEffect, useMemo} from "react";
import {LanguageType} from "../Data/EnumTypes/LanguageType";
import de from "../Translations/de.json";
import eng from "../Translations/eng.json";

export const useTranslation = () => {
    const settings = useSettings()

    const translate = (key: string, ...variables: string[]) => {
        let translation = ""

        switch (settings?.language) {
            case LanguageType.GERMAN:
                // @ts-ignore
                translation = de[key] || key
                break
            case LanguageType.ENGLISH:
                // @ts-ignore
                translation = eng[key] || key
                break
        }

        variables.forEach((variable, index) => {
            translation = translation.replaceAll(`%${index + 1}`, variable);
        });

        return translation
    }

    return useMemo(() => translate, [settings])
}