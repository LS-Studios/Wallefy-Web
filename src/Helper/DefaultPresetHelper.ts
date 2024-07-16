import {TransactionPresetModel} from "../Data/DatabaseModels/TransactionPresetModel";
import {TransactionModel} from "../Data/DatabaseModels/TransactionModel";
import {TransactionType} from "../Data/EnumTypes/TransactionType";
import {RepetitionModel} from "../Data/DataModels/Reptition/RepetitionModel";
import {ExecutionType} from "../Data/EnumTypes/ExecutionType";
import {RepetitionRateType} from "../Data/EnumTypes/RepetitionRateType";
import {PresetQuestionModel} from "../Data/DataModels/PresetQuestionModel";
import {PresetQuestionType} from "../Data/EnumTypes/PresetQuestionType";
import {DebtModel} from "../Data/DatabaseModels/DebtModel";
import {DebtPresetModel} from "../Data/DatabaseModels/DebtPresetModel";

function createTransactionPreset(
    baseCurrency: string,
    accountUid: string,
    icon: string,
    name: string,
    transactionType: TransactionType = TransactionType.EXPENSE,
    category: string = "",
    repetition: RepetitionModel = new RepetitionModel(),
    presetQuestions: PresetQuestionModel<TransactionModel>[] = []
) {
    const presetTransaction = new TransactionModel(baseCurrency)

    presetTransaction.accountUid = accountUid
    presetTransaction.name = name
    presetTransaction.icon = icon
    presetTransaction.transactionType = transactionType
    presetTransaction.repetition = repetition
    presetTransaction.categoryFallback = category

    return new TransactionPresetModel(
        accountUid,
        icon,
        name,
        presetTransaction,
        baseCurrency,
        presetQuestions
    )
}

function createDebtPreset(
    baseCurrency: string,
    accountUid: string,
    icon: string,
    name: string,
    category: string = "",
    presetQuestions: PresetQuestionModel<DebtModel>[] = []
) {
    const presetDebt = new DebtModel(baseCurrency)

    presetDebt.accountUid = accountUid
    presetDebt.name = name
    presetDebt.icon = icon
    presetDebt.categoryFallback = category

    return new DebtPresetModel(
        accountUid,
        icon,
        name,
        presetDebt,
        baseCurrency,
        presetQuestions
    )

}

export const getDefaultPresets = (
    baseCurrency: string,
    accountUid: string,
) => [
    createTransactionPreset(
        baseCurrency,
        accountUid,
        "house",
        "Miete",
        TransactionType.EXPENSE,
        "Haushalt",
        new RepetitionModel(
            ExecutionType.LATER,
            null,
            RepetitionRateType.MONTH,
            null,
            []
        ),
        [
            new PresetQuestionModel<TransactionModel>(
                "Wie hoch ist die Miete?",
                PresetQuestionType.CURRENCY,
                "transactionAmount"
            ),
            new PresetQuestionModel<TransactionModel>(
                "Wann ist die Miete fällig?",
                PresetQuestionType.FUTURE_DATE,
                "date"
            ),
            new PresetQuestionModel<TransactionModel>(
                "An wen geht die Miete?",
                PresetQuestionType.TRANSACTION_PARTNER_NO_USER,
                "transactionExecutorUid"
            )
        ],
    ),
    createTransactionPreset(
        baseCurrency,
        accountUid,
        "fuel",
        "Tanken",
        TransactionType.EXPENSE,
        "Fahrzeuge",
        new RepetitionModel(
            ExecutionType.PAST
        ),
        [
            new PresetQuestionModel<TransactionModel>(
                "Wie teuer war die Tankfüllung?",
                PresetQuestionType.CURRENCY,
                "transactionAmount"
            ),
            new PresetQuestionModel<TransactionModel>(
                "Wann wurde getankt?",
                PresetQuestionType.PAST_DATE,
                "date"
            ),
            new PresetQuestionModel<TransactionModel>(
                "Bei welcher Tankstelle wurde getankt?",
                PresetQuestionType.TRANSACTION_PARTNER_NO_USER,
                "transactionExecutorUid"
            )
        ]
    ),
    createTransactionPreset(
        baseCurrency,
        accountUid,
        "bolt",
        "Strom",
        TransactionType.EXPENSE,
        "Haushalt",
        new RepetitionModel(
            ExecutionType.LATER,
            null,
            RepetitionRateType.MONTH,
            null,
            []
        ),
        [
            new PresetQuestionModel<TransactionModel>(
                "Wie hoch ist die Stromrechnung?",
                PresetQuestionType.CURRENCY,
                "transactionAmount"
            ),
            new PresetQuestionModel<TransactionModel>(
                "Wann ist die Stromrechnung fällig?",
                PresetQuestionType.FUTURE_DATE,
                "date"
            ),
            new PresetQuestionModel<TransactionModel>(
                "Wie heißt der Stromanbieter?",
                PresetQuestionType.TRANSACTION_PARTNER_NO_USER,
                "transactionExecutorUid"
            )
        ]

    ),
    createTransactionPreset(
        baseCurrency,
        accountUid,
        "wifi",
        "Internet",
        TransactionType.EXPENSE,
        "Haushalt",
        new RepetitionModel(
            ExecutionType.LATER,
            null,
            RepetitionRateType.MONTH,
            null,
            []
        ),
        [
            new PresetQuestionModel<TransactionModel>(
                "Wie teuer ist der Internetvertrag?",
                PresetQuestionType.CURRENCY,
                "transactionAmount"
            ),
            new PresetQuestionModel<TransactionModel>(
                "Wann ist die Internetrechnung fällig?",
                PresetQuestionType.FUTURE_DATE,
                "date"
            ),
            new PresetQuestionModel<TransactionModel>(
                "Wie heißt der Internetanbieter?",
                PresetQuestionType.TRANSACTION_PARTNER_NO_USER,
                "transactionExecutorUid"
            )
        ]
    ),
    createTransactionPreset(
        baseCurrency,
        accountUid,
        "handy",
        "Handyrechnung",
        TransactionType.EXPENSE,
        "Haushalt",
        new RepetitionModel(
            ExecutionType.LATER,
            null,
            RepetitionRateType.MONTH,
            null,
            []
        ),
        [
            new PresetQuestionModel<TransactionModel>(
                "Wie teuer ist der Handyvertrag?",
                PresetQuestionType.CURRENCY,
                "transactionAmount"
            ),
            new PresetQuestionModel<TransactionModel>(
                "Wann ist die Handyrechnung fällig?",
                PresetQuestionType.FUTURE_DATE,
                "date"
            ),
            new PresetQuestionModel<TransactionModel>(
                "Wie heißt der Handyanbieter?",
                PresetQuestionType.TRANSACTION_PARTNER_NO_USER,
                "transactionExecutorUid"
            )
        ]
    ),
    createTransactionPreset(
        baseCurrency,
        accountUid,
        "shield",
        "Versicherung",
        TransactionType.EXPENSE,
        "Haushalt",
        new RepetitionModel(
            ExecutionType.LATER,
            null,
            RepetitionRateType.MONTH,
            null,
            []
        ),
        [
            new PresetQuestionModel<TransactionModel>(
                "Wie hoch ist der Versicherungsbetrag?",
                PresetQuestionType.CURRENCY,
                "transactionAmount"
            ),
            new PresetQuestionModel<TransactionModel>(
                "Wann ist die Versicherung fällig?",
                PresetQuestionType.FUTURE_DATE,
                "date"
            ),
            new PresetQuestionModel<TransactionModel>(
                "Wie heißt die Versicherung?",
                PresetQuestionType.TRANSACTION_PARTNER_NO_USER,
                "transactionExecutorUid"
            )
        ]
    ),
    createTransactionPreset(
        baseCurrency,
        accountUid,
        "shopping-cart",
        "Einkaufen",
        TransactionType.EXPENSE,
        "Haushalt",
        new RepetitionModel(
            ExecutionType.PAST
        ),
        [
            new PresetQuestionModel<TransactionModel>(
                "Wie teuer war der Einkauf?",
                PresetQuestionType.CURRENCY,
                "transactionAmount"
            ),
            new PresetQuestionModel<TransactionModel>(
                "Wann wurde eingekauft?",
                PresetQuestionType.PAST_DATE,
                "date"
            ),
            new PresetQuestionModel<TransactionModel>(
                "Wo wurde eingekauft?",
                PresetQuestionType.TRANSACTION_PARTNER_NO_USER,
                "transactionExecutorUid"
            )
        ]
    ),
    createTransactionPreset(
        baseCurrency,
        accountUid,
        "fitness-center",
        "Fitnessstudio",
        TransactionType.EXPENSE,
        "Freizeit",
        new RepetitionModel(
            ExecutionType.LATER,
            null,
            RepetitionRateType.MONTH,
            null,
            []
        ),
        [
            new PresetQuestionModel<TransactionModel>(
                "Wie teuer ist der Mitgliedsbeitrag?",
                PresetQuestionType.CURRENCY,
                "transactionAmount"
            ),
            new PresetQuestionModel<TransactionModel>(
                "Wann ist der Mitgliedsbeitrag fällig?",
                PresetQuestionType.FUTURE_DATE,
                "date"
            ),
            new PresetQuestionModel<TransactionModel>(
                "Wie heißt das Fitnesstudio?",
                PresetQuestionType.TRANSACTION_PARTNER_NO_USER,
                "transactionExecutorUid"
            )
        ]
    ),
    createTransactionPreset(
        baseCurrency,
        accountUid,
        "run",
        "Sportverein",
        TransactionType.EXPENSE,
        "Freizeit",
        new RepetitionModel(
            ExecutionType.LATER,
            null,
            RepetitionRateType.MONTH,
            null,
            []
        ),
        [
            new PresetQuestionModel<TransactionModel>(
                "Wie teuer ist der Mitgliedsbeitrag?",
                PresetQuestionType.CURRENCY,
                "transactionAmount"
            ),
            new PresetQuestionModel<TransactionModel>(
                "Wann ist der Mitgliedsbeitrag fällig?",
                PresetQuestionType.FUTURE_DATE,
                "date"
            ),
            new PresetQuestionModel<TransactionModel>(
                "Wie heißt der Sportverein?",
                PresetQuestionType.TRANSACTION_PARTNER_NO_USER,
                "transactionExecutorUid"
            )
        ]
    ),
    createTransactionPreset(
        baseCurrency,
        accountUid,
        "tv",
        "Streaming",
        TransactionType.EXPENSE,
        "Freizeit",
        new RepetitionModel(
            ExecutionType.LATER,
            null,
            RepetitionRateType.MONTH,
            null,
            []
        ),
        [
            new PresetQuestionModel<TransactionModel>(
                "Wie teuer ist das Streaming-Abo?",
                PresetQuestionType.CURRENCY,
                "transactionAmount"
            ),
            new PresetQuestionModel<TransactionModel>(
                "Wann ist der Beitrag fällig?",
                PresetQuestionType.FUTURE_DATE,
                "date"
            ),
            new PresetQuestionModel<TransactionModel>(
                "Wie heißt der Streaming Anbieter?",
                PresetQuestionType.TRANSACTION_PARTNER_NO_USER,
                "transactionExecutorUid"
            )
        ]
    ),
    createTransactionPreset(
        baseCurrency,
        accountUid,
        "money",
        "Gehalt",
        TransactionType.INCOME,
        "Einkommen",
        new RepetitionModel(
            ExecutionType.LATER,
            null,
            RepetitionRateType.MONTH,
            null,
            []
        ),
        [
            new PresetQuestionModel<TransactionModel>(
                "Wie hoch ist das Gehalt?",
                PresetQuestionType.CURRENCY,
                "transactionAmount"
            ),
            new PresetQuestionModel<TransactionModel>(
                "Wann kommt das Gehalt?",
                PresetQuestionType.FUTURE_DATE,
                "date"
            ),
            new PresetQuestionModel<TransactionModel>(
                "Wie heißt der Arbeitgeber?",
                PresetQuestionType.TRANSACTION_PARTNER_NO_USER,
                "transactionExecutorUid"
            )
        ]
    ),
    createTransactionPreset(
        baseCurrency,
        accountUid,
        "payments",
        "GEZ",
        TransactionType.EXPENSE,
        "Haushalt",
        new RepetitionModel(
            ExecutionType.LATER,
            null,
            RepetitionRateType.MONTH,
            null,
            []
        ),
        [
            new PresetQuestionModel<TransactionModel>(
                "Wie hoch ist der Rundfunkbeitrag?",
                PresetQuestionType.CURRENCY,
                "transactionAmount"
            ),
            new PresetQuestionModel<TransactionModel>(
                "Wie oft ist der Rundfunkbeitrag fällig?",
                PresetQuestionType.REPETITION,
                "repetition"
            ),
            new PresetQuestionModel<TransactionModel>(
                "Wann ist der Rundfunkbeitrag fällig?",
                PresetQuestionType.FUTURE_DATE,
                "date"
            ),
            new PresetQuestionModel<TransactionModel>(
                "An wen geht die Zahlung?",
                PresetQuestionType.TRANSACTION_PARTNER_NO_USER,
                "transactionExecutorUid"
            )
        ]
    ),
    createTransactionPreset(
        baseCurrency,
        accountUid,
        "hair",
        "Friseur",
        TransactionType.EXPENSE,
        "Freizeit",
        new RepetitionModel(
            ExecutionType.PAST
        ),
        [
            new PresetQuestionModel<TransactionModel>(
                "Wie teuer war der Friseurbesuch?",
                PresetQuestionType.CURRENCY,
                "transactionAmount"
            ),
            new PresetQuestionModel<TransactionModel>(
                "Wann war der Friseurbesuch?",
                PresetQuestionType.PAST_DATE,
                "date"
            ),
            new PresetQuestionModel<TransactionModel>(
                "Wie heißt der Friseur?",
                PresetQuestionType.TRANSACTION_PARTNER_NO_USER,
                "transactionExecutorUid"
            )
        ]
    ),
]

export const getDefaultDebtPresets = (
    baseCurrency: string,
    accountUid: string,
) => [
    createDebtPreset(
        baseCurrency,
        accountUid,
        "shopping-cart",
        "Einkaufen",
        "Lebensmittel",
        [
            new PresetQuestionModel<DebtModel>(
                "Wie teuer war der Einkauf?",
                PresetQuestionType.CURRENCY,
                "transactionAmount"
            ),
            new PresetQuestionModel<DebtModel>(
                "Wann wurde eingekauft?",
                PresetQuestionType.PAST_DATE,
                "date"
            ),
            new PresetQuestionModel<DebtModel>(
                "Wo wurde eingekauft?",
                PresetQuestionType.TRANSACTION_PARTNER_NO_USER,
                "transactionExecutorUid"
            ),
            new PresetQuestionModel<DebtModel>(
                "Wer hat eingekauft?",
                PresetQuestionType.TRANSACTION_PARTNER_USER,
                "whoHasPaidUid"
            ),
            new PresetQuestionModel<DebtModel>(
                "Für wen wurde eingekauft?",
                PresetQuestionType.TRANSACTION_PARTNER_USERS,
                "whoWasPaiFor"
            )
        ]
    ),
    createDebtPreset(
        baseCurrency,
        accountUid,
        "restaurant",
        "Restaurant",
        "Essen",
        [
            new PresetQuestionModel<DebtModel>(
                "Wie teuer war der Restaurantbesuch?",
                PresetQuestionType.CURRENCY,
                "transactionAmount"
            ),
            new PresetQuestionModel<DebtModel>(
                "Wann wart ihr beim Restaurant?",
                PresetQuestionType.PAST_DATE,
                "date"
            ),
            new PresetQuestionModel<DebtModel>(
                "Bei welchen Restaurant wart ihr?",
                PresetQuestionType.TRANSACTION_PARTNER_NO_USER,
                "transactionExecutorUid"
            ),
            new PresetQuestionModel<DebtModel>(
                "Wer hat im Restaurant bezahlt?",
                PresetQuestionType.TRANSACTION_PARTNER_USER,
                "whoHasPaidUid"
            ),
            new PresetQuestionModel<DebtModel>(
                "Für wen wurde im Restaurant bezahlt?",
                PresetQuestionType.TRANSACTION_PARTNER_USERS,
                "whoWasPaiFor"
            )
        ]
    ),
    createDebtPreset(
        baseCurrency,
        accountUid,
        "beer",
        "Bar",
        "Trinken",
        [
            new PresetQuestionModel<DebtModel>(
                "Wie teuer war der Barbesuch?",
                PresetQuestionType.CURRENCY,
                "transactionAmount"
            ),
            new PresetQuestionModel<DebtModel>(
                "Wann wart ihr bei der Bar?",
                PresetQuestionType.PAST_DATE,
                "date"
            ),
            new PresetQuestionModel<DebtModel>(
                "Bei welcher Bar wart ihr?",
                PresetQuestionType.TRANSACTION_PARTNER_NO_USER,
                "transactionExecutorUid"
            ),
            new PresetQuestionModel<DebtModel>(
                "Wer hat in der Bar bezahlt?",
                PresetQuestionType.TRANSACTION_PARTNER_USER,
                "whoHasPaidUid"
            ),
            new PresetQuestionModel<DebtModel>(
                "Für wen wurde in der Bar bezahlt?",
                PresetQuestionType.TRANSACTION_PARTNER_USERS,
                "whoWasPaiFor"
            )
        ]
    ),
    createDebtPreset(
        baseCurrency,
        accountUid,
        "car",
        "Fahrzeug",
        "Transport",
        [
            new PresetQuestionModel<DebtModel>(
                "Wie teuer war das Fahrzeug?",
                PresetQuestionType.CURRENCY,
                "transactionAmount"
            ),
            new PresetQuestionModel<DebtModel>(
                "Wann habt iht das Fahrzeug bezahlt?",
                PresetQuestionType.PAST_DATE,
                "date"
            ),
            new PresetQuestionModel<DebtModel>(
                "Bei wem habt ihr das Fahrzeug gekauft/gemietet?",
                PresetQuestionType.TRANSACTION_PARTNER_NO_USER,
                "transactionExecutorUid"
            ),
            new PresetQuestionModel<DebtModel>(
                "Wer hat das Fahrzeug bezahlt?",
                PresetQuestionType.TRANSACTION_PARTNER_USER,
                "whoHasPaidUid"
            ),
            new PresetQuestionModel<DebtModel>(
                "Für wen wurde das Fahrzeug bezahlt?",
                PresetQuestionType.TRANSACTION_PARTNER_USERS,
                "whoWasPaiFor"
            )
        ]
    ),
    createDebtPreset(
        baseCurrency,
        accountUid,
        "parking",
        "Parkplatz",
        "Transport",
        [
            new PresetQuestionModel<DebtModel>(
                "Wie teuer war der Parkplatz?",
                PresetQuestionType.CURRENCY,
                "transactionAmount"
            ),
            new PresetQuestionModel<DebtModel>(
                "Wann habt iht den Parkplatz bezahlt?",
                PresetQuestionType.PAST_DATE,
                "date"
            ),
            new PresetQuestionModel<DebtModel>(
                "Wie hieß bzw. wo war der der Parkplatz?",
                PresetQuestionType.TRANSACTION_PARTNER_NO_USER,
                "transactionExecutorUid"
            ),
            new PresetQuestionModel<DebtModel>(
                "Wer hat den Parkplatz bezahlt?",
                PresetQuestionType.TRANSACTION_PARTNER_USER,
                "whoHasPaidUid"
            ),
            new PresetQuestionModel<DebtModel>(
                "Für wen wurde der Parkplatz bezahlt?",
                PresetQuestionType.TRANSACTION_PARTNER_USERS,
                "whoWasPaiFor"
            )
        ]
    ),
    createDebtPreset(
        baseCurrency,
        accountUid,
        "fuel",
        "Tanken",
        "Transport",
        [
            new PresetQuestionModel<DebtModel>(
                "Wie teuer war die Tankfüllung?",
                PresetQuestionType.CURRENCY,
                "transactionAmount"
            ),
            new PresetQuestionModel<DebtModel>(
                "Wann wurde getankt?",
                PresetQuestionType.PAST_DATE,
                "date"
            ),
            new PresetQuestionModel<DebtModel>(
                "Bei welcher Tankstelle wurde getankt?",
                PresetQuestionType.TRANSACTION_PARTNER_NO_USER,
                "transactionExecutorUid"
            ),
            new PresetQuestionModel<DebtModel>(
                "Wer hat die Tankfüllung bezahlt?",
                PresetQuestionType.TRANSACTION_PARTNER_USER,
                "whoHasPaidUid"
            ),
            new PresetQuestionModel<DebtModel>(
                "Für wen wurde die Tankfüllung bezahlt?",
                PresetQuestionType.TRANSACTION_PARTNER_USERS,
                "whoWasPaiFor"
            )
        ]
    ),
]