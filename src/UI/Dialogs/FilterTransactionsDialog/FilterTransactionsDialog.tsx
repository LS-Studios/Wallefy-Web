import React, {useEffect} from 'react';
import {ContentAction} from "../../../Data/ContentAction/ContentAction";
import DialogOverlay from "../DialogOverlay/DialogOverlay";

import './FilterTransactionsDialog.scss';
import {useDialog} from "../../../Providers/DialogProvider";
import {FilterModel} from "../../../Data/DataModels/FilterModel";
import RadioInputComponent from "../../Components/Input/RadioInput/RadioInputComponent";
import {InputOptionModel} from "../../../Data/DataModels/Input/InputOptionModel";
import {TransactionType} from "../../../Data/EnumTypes/TransactionType";
import InputBaseComponent from "../../Components/Input/InputBase/InputBaseComponent";
import {DateRangeModel} from "../../../Data/DataModels/DateRangeModel";
import DateInputComponent from "../../Components/Input/DateInputComponent/DateInputComponent";
import {formatDateToStandardString} from "../../../Helper/DateHelper";
import AutoCompleteInputComponent from "../../Components/Input/AutoCompleteInput/AutoCompleteInputComponent";
import {PriceRangeModel} from "../../../Data/DataModels/PriceRangeModel";
import CurrencyInputComponent from "../../Components/Input/CurrencyInput/CurrencyInputComponent";
import RangeSliderInputComponent from "../../Components/Input/RangeSliderInput/RangeSliderInputComponent";
import {InputNameValueModel} from "../../../Data/DataModels/Input/InputNameValueModel";
import {CategoryModel} from "../../../Data/DatabaseModels/CategoryModel";
import {LabelModel} from "../../../Data/DatabaseModels/LabelModel";
import {TransactionPartnerModel} from "../../../Data/DatabaseModels/TransactionPartnerModel";
import {getInputValueUidsByUids} from "../../../Helper/HandyFunctionHelper";
import {getDefaultCurrency, getTransactionAmount} from "../../../Helper/CurrencyHelper";
import {CurrencyModel} from "../../../Data/DataModels/CurrencyModel";
import {useTranslation} from "../../../CustomHooks/useTranslation";
import Spinner from "../../Components/Spinner/Spinner";
import {SpinnerType} from "../../../Data/EnumTypes/SpinnerType";
import {useCurrentAccount} from "../../../Providers/AccountProvider";
import {useTransactions} from "../../../CustomHooks/Database/useTransactions";
import {useCategories} from "../../../CustomHooks/Database/useCategories";
import {useLabels} from "../../../CustomHooks/Database/useLabels";
import {useTransactionPartners} from "../../../CustomHooks/Database/useTransactionPartners";
import {useDebts} from "../../../CustomHooks/Database/useDebts";
import {usePayedDebts} from "../../../CustomHooks/Database/usePayedDebts";
import TextInputComponent from "../../Components/Input/TextInput/TextInputComponent";

const FilterTransactionsDialog = ({
    currentFilter,
    onFilterChange,
    onlyName = false,
    isDebt = false,
}: {
    currentFilter: FilterModel,
    onFilterChange: (filter: FilterModel) => void,
    onlyName?: boolean,
    isDebt?: boolean
}) => {
    const translate = useTranslation();
    const { currentAccount } = useCurrentAccount();
    const dialog = useDialog();

    const [filter, setFilter] = React.useState<FilterModel>(structuredClone(currentFilter));

    const transactions = useTransactions()
    const debts = useDebts()
    const payedDebts = usePayedDebts()

    const categories = useCategories()
    const labels = useLabels()
    const transactionPartners = useTransactionPartners()

    const [categoriesInputOptions, setCategoriesInputOptions] = React.useState<InputNameValueModel<CategoryModel>[] | null>(null);
    const [labelsInputOptions, setLabelsInputOptions] = React.useState<InputNameValueModel<LabelModel>[] | null>(null);
    const [transactionPartnersInputOptions, setTransactionPartnersInputOptions] = React.useState<InputNameValueModel<TransactionPartnerModel>[] | null>(null);

    const [priceRangeMin, setPriceRangeMin] = React.useState<number | null>(null);
    const [priceRangeMax, setPriceRangeMax] = React.useState<number | null>(null);
    const [selectedCurrency, setSelectedCurrency] = React.useState<CurrencyModel | null>(null);

    useEffect(() => {
        if (categories) {
            setCategoriesInputOptions(categories.map(category => new InputNameValueModel(category.name, category)))
        }
    }, [categories]);

    useEffect(() => {
        if (labels) {
            setLabelsInputOptions(labels.map(label => new InputNameValueModel(label.name, label)))
        }
    }, [labels]);

    useEffect(() => {
        if (transactionPartners) {
            setTransactionPartnersInputOptions(transactionPartners.map(partner => new InputNameValueModel(partner.name, partner)))
        }
    }, [transactionPartners]);

    useEffect(() => {
        setSelectedCurrency(getDefaultCurrency(currentAccount?.currencyCode))
    }, [currentAccount]);

    useEffect(() => {
        if (!transactions || !selectedCurrency || !debts || !payedDebts) return

        let minPrice
        let maxPrice

        if (isDebt) {
            minPrice = Math.min(...[...debts, ...payedDebts].map(debt => getTransactionAmount(debt, selectedCurrency?.currencyCode)!));
            maxPrice = Math.max(...[...debts, ...payedDebts].map(debt => getTransactionAmount(debt, selectedCurrency?.currencyCode)!));
        } else {
            minPrice = Math.min(...transactions.map(transaction => getTransactionAmount(transaction, selectedCurrency?.currencyCode)!));
            maxPrice = Math.max(...transactions.map(transaction => getTransactionAmount(transaction, selectedCurrency?.currencyCode)!));
        }

        setPriceRangeMin(minPrice);
        setPriceRangeMax(maxPrice);
    }, [transactions, debts, payedDebts, selectedCurrency]);

    useEffect(() => {
        if (filter.priceRange && priceRangeMin && priceRangeMax) {
            if (filter.priceRange.minPrice < priceRangeMin || filter.priceRange.minPrice > priceRangeMax) {
                updateFilter((oldFilter) => {
                    oldFilter.priceRange = new PriceRangeModel(priceRangeMin, oldFilter.priceRange?.maxPrice);
                    return oldFilter;
                })
            } else if (filter.priceRange.maxPrice < priceRangeMin || filter.priceRange.maxPrice > priceRangeMax) {
                updateFilter((oldFilter) => {
                    oldFilter.priceRange = new PriceRangeModel(oldFilter.priceRange?.minPrice, priceRangeMax);
                    return oldFilter;
                })
            }
        }
    }, [filter.priceRange]);

    const updateFilter = (updater: (oldFilter: FilterModel) => FilterModel) => {
        setFilter((current) => {
            const newFilter = new FilterModel();
            Object.assign(newFilter, updater(current));
            return newFilter
        });
    }

    const transactionTypeInputOptions = [
        new InputOptionModel(translate("income"), TransactionType.INCOME),
        new InputOptionModel(translate("expenses"), TransactionType.EXPENSE)
    ];

    return (
        <DialogOverlay actions={[
            new ContentAction(
                translate("apply"),
                () => {
                    onFilterChange(filter);
                    dialog.closeCurrent();
                }
            ),
        ]}>
            <InputBaseComponent
                title={translate("name")}
                enabled={filter.searchName !== null}
                setEnabled={(enabled) => {
                    updateFilter((oldFilter) => {
                        oldFilter.searchName = enabled ? "" : null;
                        return oldFilter;
                    });
                }}>
                <TextInputComponent
                    value={filter.searchName}
                    onValueChange={
                        (value) => {
                            updateFilter((oldFilter) => {
                                oldFilter.searchName = value as string;
                                return oldFilter;
                            });
                        }
                    }
                />
            </InputBaseComponent>
            { !onlyName && <>
                {!isDebt && <InputBaseComponent
                    title={translate("transaction-type")}
                    enabled={filter.transactionType !== null}
                    setEnabled={(enabled) => {
                        updateFilter((oldFilter) => {
                            oldFilter.transactionType = enabled ? TransactionType.INCOME : null;
                            return oldFilter;
                        });
                    }}
                >
                    <RadioInputComponent
                        value={transactionTypeInputOptions.find(option => option.value === filter.transactionType) || transactionTypeInputOptions[0]}
                        onValueChange={(value) => {
                            updateFilter((oldFilter) => {
                                oldFilter.transactionType = (value as InputOptionModel<TransactionType>).value;
                                return oldFilter;
                            });
                        }}
                        options={transactionTypeInputOptions}
                    />
                </InputBaseComponent>}
                <InputBaseComponent
                    title={translate("date-range")}
                    enabled={filter.dateRange !== null}
                    setEnabled={(enabled) => {
                        updateFilter((oldFilter) => {
                            oldFilter.dateRange = enabled ? new DateRangeModel() : null;
                            return oldFilter;
                        });
                    }}
                >
                    <div className="filter-transaction-dialog-date-range">
                        <DateInputComponent
                            value={filter.dateRange ? new Date(filter.dateRange!.startDate) : new Date()}
                            onValueChange={(value) => {
                                updateFilter((oldFilter) => {
                                    oldFilter.dateRange = new DateRangeModel(formatDateToStandardString(value), oldFilter.dateRange?.endDate || formatDateToStandardString(new Date()));
                                    return oldFilter;
                                });
                            }}
                        />
                        <span>{translate("to")}</span>
                        <DateInputComponent
                            value={filter.dateRange ? new Date(filter.dateRange!.endDate) : new Date()}
                            onValueChange={(value) => {
                                updateFilter((oldFilter) => {
                                    oldFilter.dateRange = new DateRangeModel(oldFilter.dateRange?.startDate || formatDateToStandardString(new Date()), formatDateToStandardString(value));
                                    return oldFilter;
                                });
                            }}
                        />
                    </div>
                </InputBaseComponent>
                <InputBaseComponent
                    title={translate("price-range")}
                    enabled={filter.priceRange !== null}
                    setEnabled={(enabled) => {
                        updateFilter((oldFilter) => {
                            oldFilter.priceRange = enabled ? new PriceRangeModel() : null;
                            return oldFilter;
                        });
                    }}
                >
                    <div className="filter-transaction-dialog-price-range">
                        <CurrencyInputComponent
                            value={filter.priceRange?.minPrice}
                            onValueChange={(value) => {
                                updateFilter((oldFilter) => {
                                    oldFilter.priceRange = new PriceRangeModel(value, oldFilter.priceRange?.maxPrice || 0);
                                    return oldFilter;
                                });
                            }}
                            changeOnBlur={true}
                            allowNegativeValue={true}
                            currency={selectedCurrency}
                            onCurrencyChange={setSelectedCurrency}
                            currencyRateIsDisabled={true}
                        />
                        <span>{translate("to")}</span>
                        <CurrencyInputComponent
                            value={filter.priceRange?.maxPrice}
                            onValueChange={(value) => {
                                updateFilter((oldFilter) => {
                                    oldFilter.priceRange = new PriceRangeModel(oldFilter.priceRange?.minPrice || 0, value);
                                    return oldFilter;
                                });
                            }}
                            changeOnBlur={true}
                            allowNegativeValue={true}
                            currency={selectedCurrency}
                            onCurrencyChange={setSelectedCurrency}
                            currencyRateIsDisabled={true}
                        />
                    </div>
                    { priceRangeMin && priceRangeMax ? <RangeSliderInputComponent
                        fromValue={filter.priceRange ? filter.priceRange!.minPrice : 0}
                        onFromValueChange={(value) => {
                            updateFilter((oldFilter) => {
                                oldFilter.priceRange = new PriceRangeModel(value, oldFilter.priceRange?.maxPrice || 0);
                                return oldFilter;
                            });
                        }}
                        toValue={filter.priceRange ? filter.priceRange!.maxPrice : 0}
                        onToValueChange={(value) => {
                            updateFilter((oldFilter) => {
                                oldFilter.priceRange = new PriceRangeModel(oldFilter.priceRange?.minPrice || 0, value);
                                return oldFilter;
                            });
                        }}
                        min={priceRangeMin || 0}
                        max={priceRangeMax || 0}
                    /> : <Spinner type={SpinnerType.DOTS} center={true} style={{
                        margin: "16px"
                    }}/>}
                </InputBaseComponent>
                <AutoCompleteInputComponent
                    title={translate("categories")}
                    enabled={filter.categories !== null}
                    setEnabled={(enabled) => {
                        updateFilter((oldFilter) => {
                            oldFilter.categories = enabled ? [] : null;
                            return oldFilter;
                        });
                    }}
                    value={getInputValueUidsByUids(filter.categories || [], categoriesInputOptions)}
                    onValueChange={(value) => {
                        updateFilter((oldFilter) => {
                            oldFilter.categories = (value as InputNameValueModel<CategoryModel>[]).map(category => category.value?.uid!);
                            return oldFilter;
                        })
                    }}
                    suggestions={categoriesInputOptions}
                />
                <AutoCompleteInputComponent
                    title={translate("labels")}
                    enabled={filter.labels !== null}
                    setEnabled={(enabled) => {
                        updateFilter((oldFilter) => {
                            oldFilter.labels = enabled ? [] : null;
                            return oldFilter;
                        });
                    }}
                    value={getInputValueUidsByUids(filter.labels || [], labelsInputOptions)}
                    onValueChange={(value) => {
                        updateFilter((oldFilter) => {
                            oldFilter.labels = (value as InputNameValueModel<LabelModel>[]).map(label => label.value?.uid!);
                            return oldFilter;
                        })
                    }}
                    suggestions={labelsInputOptions}
                />
                <AutoCompleteInputComponent
                    title={translate("transaction-partners")}
                    enabled={filter.transactionPartners !== null}
                    setEnabled={(enabled) => {
                        updateFilter((oldFilter) => {
                            oldFilter.transactionPartners = enabled ? [] : null;
                            return oldFilter;
                        });
                    }}
                    value={getInputValueUidsByUids(filter.transactionPartners || [], transactionPartnersInputOptions)}
                    onValueChange={(value) => {
                        updateFilter((oldFilter) => {
                            oldFilter.transactionPartners = (value as InputNameValueModel<TransactionPartnerModel>[]).map(partner => partner.value?.uid!);
                            return oldFilter;
                        })
                    }}
                    suggestions={transactionPartnersInputOptions}
                />
            </>}
        </DialogOverlay>
    );
};

export default FilterTransactionsDialog;