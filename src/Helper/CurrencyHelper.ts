import {
    cleanValue,
    CleanValueOptions,
    formatValue,
    FormatValueOptions,
    getLocaleConfig,
    padTrimValue
} from "../UI/Components/CustomCurrrencyInput/utils";
import {TransactionModel} from "../Data/DatabaseModels/TransactionModel";
import {TransactionType} from "../Data/EnumTypes/TransactionType";
import {CurrencyModel} from "../Data/DataModels/CurrencyModel";
import {InputNameValueModel} from "../Data/DataModels/Input/InputNameValueModel";
import {DebtModel} from "../Data/DatabaseModels/DebtModel";
import {LanguageType} from "../Data/EnumTypes/LanguageType";

export function getTransactionAmount(transaction: TransactionModel | DebtModel, baseCurrency: string | null | undefined, absolute: boolean = false): number {
    let currencyValue = transaction.transactionAmount || 0;

    if (transaction.currency.baseCurrencyCode === baseCurrency) {
        currencyValue = calculateCurrencyWithRate(
            currencyValue,
            baseCurrency,
            transaction.currency.currencyCode,
            transaction.currency.currencyRate
        )
    } else {
        currencyValue = calculateCurrencyWithRate(
            currencyValue,
            baseCurrency || getDefaultCurrency(null).currencyCode,
            transaction.currency.currencyCode
        )
    }

    const castedTransaction = transaction as TransactionModel
    const value = castedTransaction.transactionType ? (castedTransaction.transactionType === TransactionType.EXPENSE ? -currencyValue : currencyValue) : currencyValue
    return absolute ? Math.abs(value) : value
}

export function formatCurrencyFromTransaction(transaction: TransactionModel, language: LanguageType | null | undefined,): string {
    return (transaction.transactionType === TransactionType.EXPENSE ? "-" : "") + formatCurrency(
        transaction.transactionAmount || 0,
        language,
        transaction.currency.currencyCode
    )
}

export function formatCurrency(value: number, language: LanguageType | null | undefined, currencyCode: string | null |undefined): string {
    const isNegative = value < 0;

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

    const cleanValueOptions: Partial<CleanValueOptions> = {
        decimalSeparator,
        groupSeparator,
        allowDecimals: true,
        decimalsLimit: 2,
        allowNegativeValue: false,
        prefix: localeConfig.prefix,
    };

    const stringValue = cleanValue({
        value: String(Math.abs(value)).replace('.', decimalSeparator),
        ...cleanValueOptions
    });

    const newValue = padTrimValue(
        stringValue,
        decimalSeparator,
        2
    )

     if (language && currencyCode) {
         return new Intl.NumberFormat(language, {style: 'currency', currency: currencyCode}).format(value);
     }
    return `${(isNegative ? "-" : "") + formatValue(
        {
            ...formatValueOptions,
            value: newValue,
        }
    )} ${currencyCode}`;
}

export const getCurrencyRate = (baseCurrency: string, targetCurrency: string): number => {
    //https://freecurrencyapi.com/
    switch (baseCurrency) {
        case "EUR":
            switch (targetCurrency) {
                case "EUR":
                    return 1;
                case "USD":
                    return 1.1;
                default:
                    return 1;
            }
        case "USD":
            switch (targetCurrency) {
                case "EUR":
                    return 0.9;
                case "USD":
                    return 1;
                default:
                    return 1;
            }
        default:
            return 1;
    }
}

export const calculateCurrencyWithRate = (
    value: number,
    baseCurrency: string,
    targetCurrency: string,
    customCurrencyRate?: number
): number => {
    return value * (customCurrencyRate ? customCurrencyRate : getCurrencyRate(baseCurrency, targetCurrency))
}

export const getDefaultCurrency = (baseCurrency: string | null | undefined): CurrencyModel => {
    return new CurrencyModel(
        "EUR",
        baseCurrency || "EUR",
        getCurrencyRate(
            baseCurrency || "EUR",
            "EUR"
        )
    );
}

export const getCurrencyOptions = () => [
    new InputNameValueModel("EUR - Euro", "EUR"),
    new InputNameValueModel("USD - US-Dollar", "USD"),
]