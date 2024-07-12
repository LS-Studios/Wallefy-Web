import {useSettings} from "../Providers/SettingsProvider";
import {useThemeDetector} from "./useThemeDetector";
import React, {useEffect} from "react";
import {ThemeType} from "../Data/EnumTypes/ThemeType";
import {SettingsModel} from "../Data/DataModels/SettingsModel";

export const useToolTip = (settings: SettingsModel | null, toolTipWith = 250, tooTopHeight = 80) => {
    const systemTheme = useThemeDetector()

    const [isOnRight, setIsOnRight] = React.useState<boolean>(false);
    const [isOnBottom, setIsOnBottom] = React.useState<boolean>(false);

    const mouseMove = (e: MouseEvent) => {
        if (e.pageX + toolTipWith > window.screen.width) {
            setIsOnRight(false);
        } else {
            setIsOnRight(true);
        }

        if (e.pageY + tooTopHeight > window.screen.height) {
            setIsOnBottom(false);
        } else {
            setIsOnBottom(true);
        }
    }

    useEffect(() => {
        window.onmousemove = mouseMove

        return () => {
            window.onmousemove = null;
        }
    }, []);

    const setColorsByTheme = (theme: ThemeType) => {
        const css = getComputedStyle(document.documentElement)

        switch (theme) {
            case ThemeType.DARK:
                document.documentElement.style.setProperty('--primary', css.getPropertyValue('--primary-dark'))
                document.documentElement.style.setProperty('--stroke-color', css.getPropertyValue('--stroke-color-dark'))
                document.documentElement.style.setProperty('--text', css.getPropertyValue('--text-dark'))
                break;
            case ThemeType.LIGHT:
                document.documentElement.style.setProperty('--primary', css.getPropertyValue('--primary-light'))
                document.documentElement.style.setProperty('--stroke-color', css.getPropertyValue('--stroke-color-light'))
                document.documentElement.style.setProperty('--text', css.getPropertyValue('--text-light'))
                break;
        }
    }

    useEffect(() => {
        if (settings?.theme === ThemeType.SYSTEM) {
            setColorsByTheme(systemTheme)
        } else if (settings) {
            setColorsByTheme(settings?.theme)
        }
    }, [settings, systemTheme]);

    return { isOnRight, isOnBottom }
}