import {TransactionPresetModel} from "../Data/CreateScreen/TransactionPresetModel";
import {TransactionModelBuilder} from "../Data/Transactions/TransactionModelBuilder";
import {RepetitionModelBuilder} from "../Data/Transactions/RepetitionModelBuilder";
import {ExecutionType} from "../Data/Transactions/ExecutionType";
import {RepetitionRateType} from "../Data/Transactions/RepetitionRateType";
import {TransactionType} from "../Data/Transactions/TransactionType";

export const defaultPresets = [
    new TransactionPresetModel(
        "MdHouse",
        new TransactionModelBuilder()
            .setName("Miete")
            .setRepetition(
                new RepetitionModelBuilder()
                    .setExecutionType(ExecutionType.LATER)
                    .setRepetitionAmount(null)
                    .setRepetitionRateType(RepetitionRateType.MONTH)
                    .setRepetitionRate(null)
                    .build()
            )
            .setTransactionExecutor("Wohnungsgesellschaft")
            .setTransactionType(TransactionType.EXPENSE)
            .setCategoryUid("Haushalt")
            .build()
    ),
    new TransactionPresetModel(
        "MdBolt",
        new TransactionModelBuilder()
            .setName("Strom")
            .setRepetition(
                new RepetitionModelBuilder()
                    .setExecutionType(ExecutionType.LATER)
                    .setRepetitionAmount(null)
                    .setRepetitionRateType(RepetitionRateType.MONTH)
                    .setRepetitionRate(null)
                    .build()
            )
            .setTransactionExecutor("Stromanbieter")
            .setTransactionType(TransactionType.EXPENSE)
            .setCategoryUid("Haushalt")
            .build()
    ),
    new TransactionPresetModel(
        "MdWifi",
        new TransactionModelBuilder()
            .setName("Internet")
            .setRepetition(
                new RepetitionModelBuilder()
                    .setExecutionType(ExecutionType.LATER)
                    .setRepetitionAmount(null)
                    .setRepetitionRateType(RepetitionRateType.MONTH)
                    .setRepetitionRate(null)
                    .build()
            )
            .setTransactionExecutor("Internetanbieter")
            .setTransactionType(TransactionType.EXPENSE)
            .setCategoryUid("Haushalt")
            .build()
    ),
    new TransactionPresetModel(
        "MdAccountBalanceWallet",
        new TransactionModelBuilder()
            .setName("Anlagen")
            .setRepetition(
                new RepetitionModelBuilder()
                    .setExecutionType(ExecutionType.LATER)
                    .setRepetitionAmount(null)
                    .setRepetitionRateType(RepetitionRateType.MONTH)
                    .setRepetitionRate(null)
                    .build()
            )
            .setTransactionExecutor("Bank")
            .setTransactionType(TransactionType.EXPENSE)
            .setCategoryUid("Investition")
            .build()
    ),
    new TransactionPresetModel(
        "MdShield",
        new TransactionModelBuilder()
            .setName("Versicherung")
            .setRepetition(
                new RepetitionModelBuilder()
                    .setExecutionType(ExecutionType.LATER)
                    .setRepetitionAmount(null)
                    .setRepetitionRateType(RepetitionRateType.MONTH)
                    .setRepetitionRate(null)
                    .build()
            )
            .setTransactionExecutor("Versicherungsgesellschaft")
            .setTransactionType(TransactionType.EXPENSE)
            .setCategoryUid("Haushalt")
            .build()
    ),
    new TransactionPresetModel(
        "MdPhone",
        new TransactionModelBuilder()
            .setName("Handyvertrag")
            .setRepetition(
                new RepetitionModelBuilder()
                    .setExecutionType(ExecutionType.LATER)
                    .setRepetitionAmount(null)
                    .setRepetitionRateType(RepetitionRateType.MONTH)
                    .setRepetitionRate(null)
                    .build()
            )
            .setTransactionExecutor("Mobilfunkanbieter")
            .setTransactionType(TransactionType.EXPENSE)
            .setCategoryUid("Haushalt")
            .build()
    ),
    new TransactionPresetModel(
        "MdFitnessCenter",
        new TransactionModelBuilder()
            .setName("Fitnessstudiobeitrag")
            .setRepetition(
                new RepetitionModelBuilder()
                    .setExecutionType(ExecutionType.LATER)
                    .setRepetitionAmount(null)
                    .setRepetitionRateType(RepetitionRateType.MONTH)
                    .setRepetitionRate(null)
                    .build()
            )
            .setTransactionExecutor("Fitnessstudio")
            .setTransactionType(TransactionType.EXPENSE)
            .setCategoryUid("Sport")
            .build()
    ),
    new TransactionPresetModel(
        "MdSmartDisplay",
        new TransactionModelBuilder()
            .setName("Streamingdienst")
            .setRepetition(
                new RepetitionModelBuilder()
                    .setExecutionType(ExecutionType.LATER)
                    .setRepetitionAmount(null)
                    .setRepetitionRateType(RepetitionRateType.MONTH)
                    .setRepetitionRate(null)
                    .build()
            )
            .setTransactionExecutor("Streamingdienst")
            .setTransactionType(TransactionType.EXPENSE)
            .setCategoryUid("Freizeit")
            .build()
    ),
    new TransactionPresetModel(
        "MdCreditCard",
        new TransactionModelBuilder()
            .setName("Kredit")
            .setRepetition(
                new RepetitionModelBuilder()
                    .setExecutionType(ExecutionType.LATER)
                    .setRepetitionAmount(null)
                    .setRepetitionRateType(RepetitionRateType.MONTH)
                    .setRepetitionRate(null)
                    .build()
            )
            .setTransactionExecutor("Bank")
            .setTransactionType(TransactionType.EXPENSE)
            .setCategoryUid("Finanzen")
            .build()
    ),
    new TransactionPresetModel(
        "MdPayments",
        new TransactionModelBuilder()
            .setName("Gehalt")
            .setRepetition(
                new RepetitionModelBuilder()
                    .setExecutionType(ExecutionType.LATER)
                    .setRepetitionAmount(null)
                    .setRepetitionRateType(RepetitionRateType.MONTH)
                    .setRepetitionRate(null)
                    .build()
            )
            .setTransactionExecutor("Arbeitgeber")
            .setTransactionType(TransactionType.INCOME)
            .setCategoryUid("Einkommen")
            .build()
    ),
]