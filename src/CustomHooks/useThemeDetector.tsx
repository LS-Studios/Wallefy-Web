import {useEffect, useState} from "react";
import {ThemeType} from "../Data/EnumTypes/ThemeType";

export const useThemeDetector = () => {
    const getCurrentTheme = () => window.matchMedia("(prefers-color-scheme: dark)").matches;
    const [isDarkTheme, setIsDarkTheme] = useState(getCurrentTheme());
    const mqListener = ((e: MediaQueryListEvent) => {
        setIsDarkTheme(e.matches);
    });

    useEffect(() => {
        const darkThemeMq = window.matchMedia("(prefers-color-scheme: dark)");
        darkThemeMq.addEventListener("change", mqListener);
        return () => darkThemeMq.removeEventListener("change", mqListener)
    }, []);

    return isDarkTheme ? ThemeType.DARK : ThemeType.LIGHT;
}
