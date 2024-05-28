import {
    cleanValue, CleanValueOptions,
    formatValue,
    FormatValueOptions,
    getLocaleConfig,
    padTrimValue
} from "../UI/Components/CustomCurrrencyInput/utils";
import {useMemo} from "react";

export function formatCurrency(value: number, currencyCode: string): string {
    const localeConfig = getLocaleConfig(undefined)
    const decimalSeparator = localeConfig.decimalSeparator || '';
    const groupSeparator = localeConfig.groupSeparator || '';

    const formatValueOptions: Partial<FormatValueOptions> = {
        decimalSeparator,
        groupSeparator,
        disableGroupSeparators: false,
        intlConfig: undefined,
        prefix: localeConfig.prefix,
        suffix: undefined,
        fixedDecimalLength: 2,
    };

    const newValue = padTrimValue(
        String(value),
        undefined,
        2
    )

    return `${formatValue(
        {
            ...formatValueOptions,
            value: newValue,
        }
    )} ${currencyCode}`;
}