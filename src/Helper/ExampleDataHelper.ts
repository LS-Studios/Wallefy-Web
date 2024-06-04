import {TransactionPresetModel} from "../Data/CreateScreen/TransactionPresetModel";
import {TransactionModelBuilder} from "../Data/Transactions/TransactionModelBuilder";
import {RepetitionModelBuilder} from "../Data/Transactions/RepetitionModelBuilder";
import {ExecutionType} from "../Data/Transactions/ExecutionType";
import {RepetitionRateType} from "../Data/Transactions/RepetitionRateType";
import {TransactionType} from "../Data/Transactions/TransactionType";

//TODO add category, transaction partners and labels
export const defaultPresets = [
    new TransactionPresetModel(
        "MdHouse",
        "Miete",
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
            .setCategory("Haushalt")
            .build()
    ),
    new TransactionPresetModel(
        "MdBolt",
        "Strom",
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
            .setCategory("Haushalt")
            .build()
    ),
    new TransactionPresetModel(
        "MdWifi",
        "Internet",
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
            .setCategory("Haushalt")
            .build()
    ),
    new TransactionPresetModel(
        "MdAccountBalanceWallet",
        "Anlagen",
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
            .setCategory("Investition")
            .build()
    ),
    new TransactionPresetModel(
        "MdShield",
        "Versicherung",
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
            .setCategory("Haushalt")
            .build()
    ),
    new TransactionPresetModel(
        "MdPhone",
        "Handyvertrag",
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
            .setCategory("Haushalt")
            .build()
    ),
    new TransactionPresetModel(
        "MdFitnessCenter",
        "Fitnessstudiobeitrag",
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
            .setCategory("Sport")
            .build()
    ),
    new TransactionPresetModel(
        "MdSmartDisplay",
        "Streamingdienst",
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
            .setCategory("Freizeit")
            .build()
    ),
    new TransactionPresetModel(
        "MdCreditCard",
        "Kredit",
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
            .setCategory("Finanzen")
            .build()
    ),
    new TransactionPresetModel(
        "MdPayments",
        "Gehalt",
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
            .setCategory("Einkommen")
            .build()
    ),
]

const transactions = [
    /*
    {"uid":"lww5i8c3000c3b6e6wj8qzqp","accountId":"","history":false,"name":"Miete","categoryUid":"lww5i8c200093b6eyax6g0un","transactionAmount":532,"currencyCode":"EUR","currencyRates":"","transactionType":1,"transactionExecutorUid":"lww5i8c100083b6ebwyf2sl6","date":"2024-06-02","labels":[],"newLabels":[],"notes":"","repetition":{"executionType":2,"repetitionRateType":2,"isPending":false,"isPaused":false,"repetitionDaysInWeek":[0]}}
    {"uid":"lww5m9xz000d3b6e1hg0vcsd","accountId":"","history":false,"name":"Wocheneinkauf","categoryUid":"lww5i8c200093b6eyax6g0un","transactionAmount":80,"currencyCode":"EUR","currencyRates":"","transactionType":1,"transactionExecutorUid":"lww5m9xx000b3b6e8vjt8r1p","date":"2024-06-07","labels":[],"newLabels":[],"notes":"","repetition":{"executionType":2,"repetitionRateType":1,"isPending":false,"isPaused":false,"repetitionDaysInWeek":[5]}}
    {"uid":"lww6ampx000p3b6e52av6rqm","accountId":"","history":false,"name":"Mittagessen Arbeit","categoryUid":"lww6ampv000m3b6erdx0ansb","transactionAmount":8,"currencyCode":"EUR","currencyRates":"","transactionType":1,"transactionExecutorUid":"lww6ampu000l3b6elg97towq","date":"2024-06-03","labels":[],"newLabels":[],"notes":"","repetition":{"executionType":2,"repetitionRateType":1,"isPending":false,"isPaused":false,"repetitionDaysInWeek":[1,3]}}
    {"uid":"lww8dtyk000c3b6e2ja1khi4","accountId":"","history":false,"name":"Spotify Abo","categoryUid":"lww8dtyh00093b6ezuad5450","transactionAmount":9,"currencyCode":"EUR","currencyRates":"","transactionType":1,"transactionExecutorUid":"lww8dtyf00083b6e3bqc8aik","date":"2024-06-09","labels":[],"newLabels":[],"notes":"","repetition":{"executionType":2,"repetitionRateType":2,"isPending":false,"isPaused":false,"repetitionDaysInWeek":[0]}}
    {"uid":"lww8pp6f000c3b6eejcc1bp5","accountId":"","history":false,"name":"Volleyball Beitrag","categoryUid":"lww8pp6d00093b6e4cpmhtyn","transactionAmount":9,"currencyCode":"EUR","currencyRates":"","transactionType":1,"transactionExecutorUid":"lww8pp6d00083b6e5jxy8fzy","date":"2024-06-11","labels":[],"newLabels":[],"notes":"","repetition":{"executionType":2,"repetitionRateType":2,"isPending":false,"isPaused":false,"repetitionDaysInWeek":[0]}}
    {"uid":"lww8r5sz001r3b6e6qrxyazy","accountId":"","history":false,"name":"Fondanlagen","categoryUid":"lww8r5sy001o3b6eb0z62d2s","transactionAmount":50,"currencyCode":"EUR","currencyRates":"","transactionType":0,"transactionExecutorUid":"lww8r5sy001n3b6eltshvv0s","date":"2024-06-14","labels":[],"newLabels":[],"notes":"","repetition":{"executionType":2,"repetitionRateType":2,"isPending":false,"isPaused":false,"repetitionDaysInWeek":[0]}}
    {"uid":"lww8sm5h00363b6ek1ppot60","accountId":"","history":false,"name":"Google One","categoryUid":"lww8sm5g00333b6eg7d59pfs","transactionAmount":14,"currencyCode":"EUR","currencyRates":"","transactionType":1,"transactionExecutorUid":"lww8sm5g00323b6e5krxwzah","date":"2024-06-14","labels":[],"newLabels":[],"notes":"","repetition":{"executionType":2,"repetitionRateType":2,"isPending":false,"isPaused":false,"repetitionDaysInWeek":[0]}}
    {"uid":"lww8x1pv000h3b6eiqurfxem","accountId":"","history":false,"name":"Kindergeld","categoryUid":"lww8x1ps000f3b6ew8ahulv9","transactionAmount":250,"currencyCode":"EUR","currencyRates":"","transactionType":0,"transactionExecutorUid":"lww8r5sy001n3b6eltshvv0s","date":"2024-06-14","labels":[],"newLabels":[],"notes":"","repetition":{"executionType":2,"repetitionRateType":2,"isPending":false,"isPaused":false,"repetitionDaysInWeek":[0]}}
    {"uid":"lwwdqt37000g3b6edgm93i97","accountId":"","history":false,"name":"Unterhakt","categoryUid":"lww8x1ps000f3b6ew8ahulv9","transactionAmount":370,"currencyCode":"EUR","currencyRates":"","transactionType":0,"transactionExecutorUid":"lww8r5sy001n3b6eltshvv0s","date":"2024-06-14","labels":[],"newLabels":[],"notes":"","repetition":{"executionType":2,"repetitionRateType":2,"isPending":false,"isPaused":false,"repetitionDaysInWeek":[0]}}
    {"uid":"lwwduqxi000s3b6el64u6x64","accountId":"","history":false,"name":"Strom","categoryUid":"lww5i8c200093b6eyax6g0un","transactionAmount":45,"currencyCode":"EUR","currencyRates":"","transactionType":1,"transactionExecutorUid":"lwwduqxh000q3b6e04p86vrj","date":"2024-06-16","labels":[],"newLabels":[],"notes":"","repetition":{"executionType":2,"repetitionRateType":2,"isPending":false,"isPaused":false,"repetitionDaysInWeek":[0]}}
    {"uid":"lwwdwxyu00273b6ea6q3m8g9","accountId":"","history":false,"name":"ChatGPT+","categoryUid":"lww8sm5g00333b6eg7d59pfs","transactionAmount":22,"currencyCode":"EUR","currencyRates":"","transactionType":1,"transactionExecutorUid":"lwwdwxyq00253b6e6tcqev5n","date":"2024-06-25","newLabels":[],"notes":"","labels":["lwwdvmny00143b6eaylebnbs"],"repetition":{"executionType":2,"repetitionRateType":2,"isPending":false,"isPaused":false,"repetitionDaysInWeek":[0]}}
    {"uid":"lwwdxhna002j3b6egwmume43","accountId":"","history":false,"name":"Gehalt","categoryUid":"lww8x1ps000f3b6ew8ahulv9","transactionAmount":1160,"currencyCode":"EUR","currencyRates":"","transactionType":0,"transactionExecutorUid":"lwwdxhn8002h3b6ecz2astwo","date":"2024-06-25","labels":[],"newLabels":[],"notes":"","repetition":{"executionType":2,"repetitionRateType":2,"isPending":false,"isPaused":false,"repetitionDaysInWeek":[0]}}
    {"uid":"lwwdylbz002v3b6eq1jgnmqy","accountId":"","history":false,"name":"GigaTV Box","categoryUid":"lww8sm5g00333b6eg7d59pfs","transactionAmount":20,"currencyCode":"EUR","currencyRates":"","transactionType":1,"transactionExecutorUid":"lwwdylbw002t3b6e8babx05c","date":"2024-06-26","labels":[],"newLabels":[],"notes":"","repetition":{"executionType":2,"repetitionRateType":2,"isPending":false,"isPaused":false,"repetitionAmount":1,"repetitionDaysInWeek":[0]}}
    {"uid":"lwwdz67y003b3b6eafbuoet6","accountId":"","history":false,"name":"Handyvertrag","categoryUid":"lww8sm5g00333b6eg7d59pfs","transactionAmount":20,"currencyCode":"EUR","currencyRates":"","transactionType":1,"transactionExecutorUid":"lwwdylbw002t3b6e8babx05c","date":"2024-06-26","labels":[],"newLabels":[],"notes":"","repetition":{"executionType":2,"repetitionRateType":2,"isPending":false,"isPaused":false,"repetitionDaysInWeek":[0]}}
    {"uid":"lwwdzpv5003o3b6eqfii0ku8","accountId":"","history":false,"name":"Internet","categoryUid":"lww5i8c200093b6eyax6g0un","transactionAmount":40,"currencyCode":"EUR","currencyRates":"","transactionType":1,"transactionExecutorUid":"lwwdylbw002t3b6e8babx05c","date":"2024-06-26","labels":[],"newLabels":[],"notes":"","repetition":{"executionType":2,"repetitionRateType":2,"isPending":false,"isPaused":false,"repetitionDaysInWeek":[0]}}
    {"uid":"lwwe21u3003z3b6e8h58yb8n","accountId":"","history":false,"name":"Lautsprecher Ratenzahlung","categoryUid":"lww8sm5g00333b6eg7d59pfs","transactionAmount":38,"currencyCode":"EUR","currencyRates":"","transactionType":1,"transactionExecutorUid":"lwwe21u1003x3b6egnzht25x","date":"2024-06-28","newLabels":[],"notes":"","labels":["lwwesv40000g3b6e6s1nn8j6"],"repetition":{"executionType":2,"repetitionRateType":2,"isPending":false,"isPaused":false,"repetitionAmount":2,"repetitionDaysInWeek":[0]}}
    {"uid":"lwwevasu000m3b6ettcruntr","accountId":"","history":false,"name":"E-Bike Ratenzahlung","categoryUid":"lww8sm5g00333b6eg7d59pfs","transactionAmount":90,"currencyCode":"EUR","currencyRates":"","transactionType":1,"transactionExecutorUid":"lwwe21u1003x3b6egnzht25x","date":"2024-06-29","newLabels":[],"notes":"","labels":["lwwesv40000g3b6e6s1nn8j6"],"repetition":{"executionType":2,"repetitionAmount":23,"repetitionRateType":2,"isPending":false,"isPaused":false,"repetitionDaysInWeek":[0]}}
    {"uid":"lwwex293000a3b6edx3as65j","accountId":"","history":false,"name":"Altersvorsorge-Fond","categoryUid":"lww8r5sy001o3b6eb0z62d2s","transactionAmount":50,"currencyCode":"EUR","currencyRates":"","transactionType":1,"transactionExecutorUid":"lwwex29100083b6e49iobi1s","date":"2024-06-01","labels":[],"newLabels":[],"notes":"","repetition":{"executionType":2,"repetitionRateType":2,"isPending":false,"isPaused":false,"repetitionDaysInWeek":[0]}}
    {"uid":"lwweyg6f00113b6ed58jz77f","accountId":"","history":false,"name":"Anlage-Fonds","categoryUid":"lww8r5sy001o3b6eb0z62d2s","transactionAmount":100,"currencyCode":"EUR","currencyRates":"","transactionType":1,"transactionExecutorUid":"lwwex29100083b6e49iobi1s","date":"2024-06-01","labels":[],"newLabels":[],"notes":"","repetition":{"executionType":2,"repetitionRateType":2,"isPending":false,"isPaused":false,"repetitionDaysInWeek":[0]}}
    {"uid":"lwwf97x3001h3b6elcwc9aw7","accountId":"","history":false,"name":"Fitnessstudio","categoryUid":"lww8pp6d00093b6e4cpmhtyn","transactionAmount":40,"currencyCode":"EUR","currencyRates":"","transactionType":1,"transactionExecutorUid":"lwwf97x1001f3b6ed323yi3o","date":"2024-06-01","labels":[],"newLabels":[],"notes":"","repetition":{"executionType":2,"repetitionRateType":2,"isPending":false,"isPaused":false,"repetitionDaysInWeek":[0]}}
    {"uid":"lwwfaodh001u3b6evjp93gi4","accountId":"","history":false,"name":"GEZ - Rundfunkbeitrag","categoryUid":"lww5i8c200093b6eyax6g0un","transactionAmount":55,"currencyCode":"EUR","currencyRates":"","transactionType":1,"transactionExecutorUid":"lwwfaodf001s3b6e84eb02az","date":"2024-08-17","labels":[],"newLabels":[],"notes":"","repetition":{"executionType":2,"repetitionRateType":2,"repetitionRate":3,"isPending":false,"isPaused":false,"repetitionDaysInWeek":[0]}}
    {"uid":"lwwfbpiz002e3b6ey0843qqa","accountId":"","history":false,"name":"Energiepauschale","categoryUid":"lww8x1ps000f3b6ew8ahulv9","transactionAmount":1000,"currencyCode":"EUR","currencyRates":"","transactionType":0,"transactionExecutorUid":"lwwdxhn8002h3b6ecz2astwo","date":"2024-12-25","labels":[],"newLabels":[],"notes":"","repetition":{"executionType":2,"repetitionAmount":1,"repetitionRateType":0,"isPending":false,"isPaused":false,"repetitionDaysInWeek":[0]}}
    {"uid":"lwwfd7cm002o3b6e7oep3w7t","accountId":"","history":false,"name":"Fahrradversicherung","categoryUid":"lww5i8c200093b6eyax6g0un","transactionAmount":103,"currencyCode":"EUR","currencyRates":"","transactionType":1,"transactionExecutorUid":"lwwfd7ci002m3b6ee5rbwjrk","date":"2025-05-14","labels":[],"newLabels":[],"notes":"","repetition":{"executionType":2,"repetitionRateType":3,"isPending":false,"isPaused":false,"repetitionDaysInWeek":[0]}}
     */
]