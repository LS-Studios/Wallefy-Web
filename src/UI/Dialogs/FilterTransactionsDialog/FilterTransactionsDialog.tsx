import React, {useEffect} from 'react';
import {ContentAction} from "../../../Data/ContentAction/ContentAction";
import DialogOverlay from "../DialogOverlay/DialogOverlay";

import './FilterTransactionsDialog.scss';
import {useDialog} from "../../../Providers/DialogProvider";
import {FilterModel} from "../../../Data/FilterModel";
import RadioInputComponent from "../../Components/Input/RadioInput/RadioInputComponent";
import {InputOptionModel} from "../../../Data/Input/InputOptionModel";
import {TransactionType} from "../../../Data/Transactions/TransactionType";
import InputBaseComponent from "../../Components/Input/InputBase/InputBaseComponent";
import {TransactionModel} from "../../../Data/Transactions/TransactionModel";
import {DateRange} from "../../../Data/DateRange";
import DateInputComponent from "../../Components/Input/DateInputComponent/DateInputComponent";
import {formatDateToStandardString, getDateFromStandardString} from "../../../Helper/DateHelper";
import AutoCompleteInputComponent from "../../Components/Input/AutoCompleteInput/AutoCompleteInputComponent";
import {PriceRange} from "../../../Data/PriceRange";
import CurrencyInputComponent from "../../Components/Input/CurrencyInput/CurrencyInputComponent";
import SliderInputComponent from "../../Components/Input/SliderInput/SliderInputComponent";
import {InputNameValueModel} from "../../../Data/Input/InputNameValueModel";
import {getDBItemsOnChange} from "../../../Helper/AceBaseHelper";
import {DatabaseRoutes} from "../../../Helper/DatabaseRoutes";
import {CategoryModel} from "../../../Data/CategoryModel";
import {LabelModel} from "../../../Data/LabelModel";
import {TransactionPartnerModel} from "../../../Data/TransactionPartnerModel";
import {getInputValueUidsByUids} from "../../../Helper/HandyFunctionHelper";
import {getTransactionAmount} from "../../../Helper/TransactionHelper";
import usePrevious from "../../../CustomHooks/usePrevious";

const FilterTransactionsDialog = ({
    currentFilter,
    onFilterChange,
}: {
    currentFilter: FilterModel,
    onFilterChange: (filter: FilterModel) => void,
}) => {
    const dialog = useDialog();

    const [filter, setFilter] = React.useState<FilterModel>(structuredClone(currentFilter));
    const previousPriceRange = usePrevious(filter.priceRange);

    const [categories, setCategories] = React.useState<InputNameValueModel<CategoryModel>[] | null>(null);
    const [labels, setLabels] = React.useState<InputNameValueModel<LabelModel>[] | null>(null);
    const [transactionPartners, setTransactionPartners] = React.useState<InputNameValueModel<TransactionPartnerModel>[] | null>(null);

    const [priceRangeMin, setPriceRangeMin] = React.useState<number>(0);
    const [priceRangeMax, setPriceRangeMax] = React.useState<number>(0);

    useEffect(() => {
        getDBItemsOnChange(DatabaseRoutes.CATEGORIES, (categories: CategoryModel[]) => {
            setCategories(categories.map(category => new InputNameValueModel(category.name, category)))
        })
        getDBItemsOnChange(DatabaseRoutes.LABELS, (labels: LabelModel[]) => {
            setLabels(labels.map(label => new InputNameValueModel(label.name, label)))
        })
        getDBItemsOnChange(DatabaseRoutes.TRANSACTION_PARTNERS, (partners: TransactionPartnerModel[]) => {
            setTransactionPartners(partners.map(partner => new InputNameValueModel(partner.name, partner)))
        })
        getDBItemsOnChange(DatabaseRoutes.TRANSACTIONS, (transactions: TransactionModel[]) => {
            const minPrice = Math.min(...transactions.map(transaction => getTransactionAmount(transaction)!));
            const maxPrice = Math.max(...transactions.map(transaction => getTransactionAmount(transaction)!));
            setPriceRangeMin(minPrice);
            setPriceRangeMax(maxPrice);
        })
    }, []);

    useEffect(() => {
        if (filter.priceRange && previousPriceRange === null) {
            updateFilter((oldFilter) => {
                oldFilter.priceRange = new PriceRange(priceRangeMin, priceRangeMax);
                return oldFilter;
            })
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
        new InputOptionModel("Income", TransactionType.INCOME),
        new InputOptionModel("Expense", TransactionType.EXPENSE)
    ];

    return (
        <DialogOverlay actions={[
            new ContentAction(
                "Apply",
                () => {
                    onFilterChange(filter);
                    dialog.closeCurrent();
                }
            ),
        ]}>
            <InputBaseComponent
                title="Transaction type"
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
            </InputBaseComponent>
            <InputBaseComponent
                title="Date range"
                enabled={filter.dateRange !== null}
                setEnabled={(enabled) => {
                    updateFilter((oldFilter) => {
                        oldFilter.dateRange = enabled ? new DateRange() : null;
                        return oldFilter;
                    });
                }}
            >
                <div className="filter-transaction-dialog-date-range">
                    <DateInputComponent
                        value={filter.dateRange ? getDateFromStandardString(filter.dateRange!.startDate) : new Date()}
                        onValueChange={(value) => {
                            updateFilter((oldFilter) => {
                                oldFilter.dateRange = new DateRange(formatDateToStandardString(value), oldFilter.dateRange?.endDate || formatDateToStandardString(new Date()));
                                return oldFilter;
                            });
                        }}
                    />
                    <span>to</span>
                    <DateInputComponent
                        value={filter.dateRange ? getDateFromStandardString(filter.dateRange!.endDate) : new Date()}
                        onValueChange={(value) => {
                            updateFilter((oldFilter) => {
                                oldFilter.dateRange = new DateRange(oldFilter.dateRange?.startDate || formatDateToStandardString(new Date()), formatDateToStandardString(value));
                                return oldFilter;
                            });
                        }}
                    />
                </div>
            </InputBaseComponent>
            <InputBaseComponent
                title="Price range"
                enabled={filter.priceRange !== null}
                setEnabled={(enabled) => {
                    updateFilter((oldFilter) => {
                        oldFilter.priceRange = enabled ? new PriceRange() : null;
                        return oldFilter;
                    });
                }}
            >
                <div className="filter-transaction-dialog-price-range">
                    <CurrencyInputComponent
                        value={filter.priceRange?.minPrice}
                        onValueChange={(value) => {
                            updateFilter((oldFilter) => {
                                oldFilter.priceRange = new PriceRange(value, oldFilter.priceRange?.maxPrice || 0);
                                return oldFilter;
                            });
                        }}
                        allowNegativeValue={true}
                    />
                    <span>to</span>
                    <CurrencyInputComponent
                        value={filter.priceRange?.maxPrice}
                        onValueChange={(value) => {
                            updateFilter((oldFilter) => {
                                oldFilter.priceRange = new PriceRange(oldFilter.priceRange?.minPrice || 0, value);
                                return oldFilter;
                            });
                        }}
                    />
                </div>
                <SliderInputComponent
                    fromValue={filter.priceRange ? filter.priceRange!.minPrice : 0}
                    onFromValueChange={(value) => {
                        updateFilter((oldFilter) => {
                            oldFilter.priceRange = new PriceRange(value, oldFilter.priceRange?.maxPrice || 0);
                            return oldFilter;
                        });
                    }}
                    toValue={filter.priceRange ? filter.priceRange!.maxPrice : 0}
                    onToValueChange={(value) => {
                        console.log("to", value)
                        updateFilter((oldFilter) => {
                            oldFilter.priceRange = new PriceRange(oldFilter.priceRange?.minPrice || 0, value);
                            return oldFilter;
                        });
                    }}
                    min={priceRangeMin}
                    max={priceRangeMax}
                />
            </InputBaseComponent>
            <AutoCompleteInputComponent
                title="Categories"
                enabled={filter.categories !== null}
                setEnabled={(enabled) => {
                    updateFilter((oldFilter) => {
                        oldFilter.categories = enabled ? [] : null;
                        return oldFilter;
                    });
                }}
                value={getInputValueUidsByUids(filter.categories || [], categories)}
                onValueChange={(value) => {
                    updateFilter((oldFilter) => {
                        oldFilter.categories = (value as InputNameValueModel<CategoryModel>[]).map(category => category.value?.uid!);
                        return oldFilter;
                    })
                }}
                suggestions={categories}
            />
            <AutoCompleteInputComponent
                title="Labels"
                enabled={filter.labels !== null}
                setEnabled={(enabled) => {
                    updateFilter((oldFilter) => {
                        oldFilter.labels = enabled ? [] : null;
                        return oldFilter;
                    });
                }}
                value={getInputValueUidsByUids(filter.labels || [], labels)}
                onValueChange={(value) => {
                    updateFilter((oldFilter) => {
                        oldFilter.labels = (value as InputNameValueModel<LabelModel>[]).map(label => label.value?.uid!);
                        return oldFilter;
                    })
                }}
                suggestions={labels}
            />
            <AutoCompleteInputComponent
                title="Transaction partners"
                enabled={filter.transactionPartners !== null}
                setEnabled={(enabled) => {
                    updateFilter((oldFilter) => {
                        oldFilter.transactionPartners = enabled ? [] : null;
                        return oldFilter;
                    });
                }}
                value={getInputValueUidsByUids(filter.transactionPartners || [], transactionPartners)}
                onValueChange={(value) => {
                    updateFilter((oldFilter) => {
                        oldFilter.transactionPartners = (value as InputNameValueModel<TransactionPartnerModel>[]).map(partner => partner.value?.uid!);
                        return oldFilter;
                    })
                }}
                suggestions={transactionPartners}
            />
        </DialogOverlay>
    );
};

export default FilterTransactionsDialog;