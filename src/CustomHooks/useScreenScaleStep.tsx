import {useEffect, useState} from "react";

// @ts-ignore
import variables from "../Data/Variables.scss";

export const useScreenScaleStep = () => {
    const [width, setWidth] = useState<number>(window.innerWidth);

    function handleWindowSizeChange() {
        setWidth(window.innerWidth);
    }
    useEffect(() => {
        window.addEventListener('resize', handleWindowSizeChange);
        return () => {
            window.removeEventListener('resize', handleWindowSizeChange);
        }
    }, []);

    const state1Value = variables.mobile_state_1.replace("px", "")
    const state2Value = variables.mobile_state_2.replace("px", "")

    if (width <= state1Value && width > state2Value) {
        return 1
    } else if (width <= state2Value && width > 0) {
        return 2
    } else {
        return 0
    }
}