import React, {CSSProperties, useEffect, useState} from 'react';
import InputBaseComponent from "../InputBase/InputBaseComponent";
import './AutoCompleteInputComponent.scss';
import DropDialog from "../../Dropdialog/DropDialog";
import {MdClose} from "react-icons/md";
import {InputNameValueModel} from "../../../../Data/DataModels/Input/InputNameValueModel";
import {getInputValueUidByUid} from "../../../../Helper/HandyFunctionHelper";
import {useContextMenu} from "../../../../Providers/ContextMenuProvider";
import {ContentAction} from "../../../../Data/ContentAction/ContentAction";
import {deleteDBItem, deleteDBItemByUid} from "../../../../Helper/AceBaseHelper";
import {DatabaseRoutes} from "../../../../Helper/DatabaseRoutes";
import {useTranslation} from "../../../../CustomHooks/useTranslation";

function AutoCompleteInputComponent<T>({
    title,
    value,
    onValueChange,
    suggestions,
    fetchSuggestionsOnOpen,
    valueFormatter,
    suggestionUlStyle,
    suggestionElement,
    placeholder = "",
    type = "text",
    allowCreatingNew = false,
    selectAtLeastOne = false,
    contextMenuOptions,
    enabled,
    setEnabled,
    style,
}: {
    title: string,
    value: InputNameValueModel<T> | InputNameValueModel<T>[] | null,
    onValueChange: (value: InputNameValueModel<T> | InputNameValueModel<T>[] | null) => void,
    suggestions?: InputNameValueModel<T>[] | null,
    fetchSuggestionsOnOpen?: () => Promise<InputNameValueModel<T>[]>,
    valueFormatter?: (value: string) => string,
    suggestionUlStyle?: CSSProperties,
    suggestionElement?: (suggestion: InputNameValueModel<T>) => React.ReactElement
    placeholder?: string,
    type?: string,
    allowCreatingNew?: boolean,
    selectAtLeastOne?: boolean,
    contextMenuOptions?: (value: InputNameValueModel<T>) => ContentAction[],
    enabled?: boolean,
    setEnabled?: (enabled: boolean) => void,
    style?: CSSProperties,
}) {
    const translate = useTranslation()
    const contextMenu = useContextMenu()

    const inputRef = React.createRef<HTMLInputElement>();
    const tagsRef = React.createRef<HTMLDivElement>();

    const [dropDownTopOffset, setDropDownTopOffset] = useState<number>(0)

    const [inputIsExpanded, setInputIsExpanded] = useState<Boolean>(false)

    const [userInput, setUserInput] = useState<string>(Array.isArray(value) ? "" : value?.name || "")
    const [changeUserInputOnValueChange, setChangeUserInputOnValueChange] = useState<boolean>(true)
    const [activeSuggestion, setActiveSuggestion] = useState<number | null>(null)
    const [suggestionsToWorkWith, setSuggestionsToWorkWith] = useState<InputNameValueModel<T>[] | null>(null)
    const [filteredSuggestions, setFilteredSuggestions] = useState<InputNameValueModel<T>[] | null>(null)
    const [showSuggestions, setShowSuggestions] = useState<boolean>(false)

    const sortSuggestions = (suggestions: InputNameValueModel<T>[] | null) => {
        return suggestions?.sort((a, b) => {
            if (a.name < b.name) {
                return -1
            }
            if (a.name > b.name) {
                return 1
            }
            return 0
        }) || null
    }

    useEffect(() => {
        if (showSuggestions && fetchSuggestionsOnOpen) {
            setSuggestionsToWorkWith(null)
            setTimeout(() => {
                fetchSuggestionsOnOpen().then((suggestions) => {
                    setSuggestionsToWorkWith(suggestions)
                })
            }, 1000)
        } else if (fetchSuggestionsOnOpen) {
            setSuggestionsToWorkWith([])
        }
    }, [showSuggestions]);

    useEffect(() => {
        if (suggestions) {
            setSuggestionsToWorkWith(suggestions)
        }
    }, [suggestions]);

    useEffect(() => {
        setFilteredSuggestions(sortSuggestions(suggestionsToWorkWith))
    }, [suggestionsToWorkWith]);

    useEffect(() => {
        setUserInput(Array.isArray(value) ? "" : value?.name || "")
    }, [value]);

    const valueIsSelected = (suggestion: InputNameValueModel<T>) => {
        if (Array.isArray(value)) {
            return value.map((v) => v.name).includes(suggestion.name);
        } else {
            return value?.name === suggestion.name;
        }
    }

    const applySuggestion = (selectedSuggestion: string) => {
        const suggestion = filteredSuggestions!.find((suggestion) => suggestion.name === selectedSuggestion);

        //New option is selected -> Remove
        if (suggestion === undefined) {
            if (selectAtLeastOne) return;

            if (Array.isArray(value)) {
                onValueChange(value.filter((v) => v.name !== selectedSuggestion));
                setUserInput("");
            } else {
                onValueChange(null)
            }
            return;
        }


        if (allowCreatingNew && !suggestion.value) {
            if (Array.isArray(value)) {
                onValueChange([...value, new InputNameValueModel<T>(userInput, null)]);
                setUserInput("");
            } else {
                onValueChange(new InputNameValueModel<T>(userInput, null));
            }
        } else if (valueIsSelected(suggestion)) {
            if (Array.isArray(value) && (selectAtLeastOne || value.length > 1)) {
                const newValue = value.filter((v) => v.name !== suggestion.name);
                onValueChange(newValue);

                setUserInput("");
            } else if (!selectAtLeastOne) {
                onValueChange(null);
                setUserInput("");
            } else {
                setShowSuggestions(false)
            }
        } else {
            if (Array.isArray(value)) {
                onValueChange([...value, suggestion]);
                setUserInput("");
            } else {
                onValueChange(suggestion);
            }
        }

        setFilteredSuggestions(sortSuggestions(suggestionsToWorkWith));
    }

    const changeFocus = (newFocusValue: boolean) => {
        if (!Array.isArray(value) && !value) {
            setUserInput("")
        } else {
            setUserInput(Array.isArray(value) ? "" : value?.name || "")
        }

        if (newFocusValue) {
            setInputIsExpanded(true)
            setShowSuggestions(true)
            inputRef.current?.focus();
        } else if (!newFocusValue && (Array.isArray(value) ? !value.length : !value) && enabled === undefined) {
            setInputIsExpanded(false)
            inputRef.current?.blur();
            setShowSuggestions(false)
        } else if (!newFocusValue) {
            setShowSuggestions(false)
        }
    }

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const userInput = e.currentTarget.value;

        const filteredSuggestions = suggestionsToWorkWith?.filter(
            suggestion =>
                suggestion.name.toLowerCase().indexOf(userInput.toLowerCase()) > -1
        ) || [];

        const foundSuggestion = suggestionsToWorkWith?.find(suggestion => suggestion.name === userInput) === undefined

        if (userInput) {
            setActiveSuggestion(0)
            if (allowCreatingNew && foundSuggestion) filteredSuggestions.push(new InputNameValueModel<T>(translate("add-as-new-option"), null))
        } else {
            setActiveSuggestion(null)
        }

        setFilteredSuggestions(sortSuggestions(filteredSuggestions));

        if (!Array.isArray(value)) {
            onValueChange(null);
        }

        setUserInput(userInput);
    }

    const selectSuggestion = (selectedSuggestion: string) => {
        const suggestion = filteredSuggestions!.find((suggestion) => suggestion.name === selectedSuggestion);

        if (!suggestion?.value || !valueIsSelected(suggestion)) {
            setActiveSuggestion(null);
            setShowSuggestions(false);
        }

        applySuggestion(selectedSuggestion);
    }

    const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (!filteredSuggestions) return;

        if (e.key === "Enter") {
            if (activeSuggestion !== null) applySuggestion(
                filteredSuggestions!.find((suggestion, index) => index === activeSuggestion)!.name
            );

            setShowSuggestions(false)

            setActiveSuggestion(null);
            inputRef.current?.blur();
            changeFocus(false);
        } else if (e.key === "ArrowUp") {
            let newActiveSuggestion

            if (activeSuggestion === null || activeSuggestion === 0) {
                newActiveSuggestion = filteredSuggestions.length
            } else {
                newActiveSuggestion = activeSuggestion
            }

            for (let i = 0; i < filteredSuggestions.length; i++) {
                newActiveSuggestion -= 1

                if (newActiveSuggestion === -1) {
                    newActiveSuggestion = filteredSuggestions.length - 1
                }

                if (!valueIsSelected(filteredSuggestions[newActiveSuggestion])) {
                    break;
                }
            }

            setActiveSuggestion(newActiveSuggestion)
        } else if (e.key === "ArrowDown") {
            let newActiveSuggestion

            if (activeSuggestion === null || activeSuggestion === filteredSuggestions.length - 1) {
                newActiveSuggestion = -1
            } else {
                newActiveSuggestion = activeSuggestion
            }

            for (let i = 0; i < filteredSuggestions.length; i++) {
                newActiveSuggestion += 1

                if (newActiveSuggestion === filteredSuggestions.length) {
                    newActiveSuggestion = 0
                }

                if (!valueIsSelected(filteredSuggestions[newActiveSuggestion])) {
                    break;
                }
            }

            setActiveSuggestion(newActiveSuggestion)
        }

        const activeSuggestionElement = document.querySelector(".auto-complete-suggestions-drop-down li.selected") as HTMLElement;
        if (activeSuggestionElement) activeSuggestionElement.scrollIntoView({behavior: "smooth", block: "center"})
    }

    useEffect(() => {
        changeFocus(showSuggestions)
    }, [showSuggestions]);

    useEffect(() => {
        if (!Array.isArray(value) || !value.length)
            setDropDownTopOffset(enabled === undefined ? 59.5 : 65)
        else
            setDropDownTopOffset(tagsRef.current!.clientHeight + (enabled === undefined ? 27 : 31))
    }, [tagsRef]);

    useEffect(() => {
        if ((Array.isArray(value) ? value.length : value) || enabled) setInputIsExpanded(true);
        else if (!showSuggestions) setInputIsExpanded(false)
    }, [value]);

    return <div>
        <DropDialog
            isOpen={showSuggestions}
            setIsOpen={setShowSuggestions}
            style={{
                top: dropDownTopOffset,
            }}
            content={
                <>
                    { filteredSuggestions ? (filteredSuggestions.length ? <ul
                        className="auto-complete-suggestions-drop-down"
                        style={suggestionUlStyle}
                    >
                        { filteredSuggestions.map((suggestion, index) => {
                            return <li
                                key={index}
                                onClick={(e) => selectSuggestion(suggestion.name)}
                                className={(Array.isArray(value) ? value.includes(suggestion) : value?.name === suggestion.name) ? "active" : index === activeSuggestion ? "selected" : ""}
                                onContextMenu={(e) => {
                                    contextMenuOptions && contextMenu.handleOnContextMenu(e, contextMenuOptions(suggestion))
                                }}
                            >
                                { suggestionElement ? suggestionElement(suggestion) : <>
                                    <span>{suggestion.name}</span>
                                    { (Array.isArray(value) ? (value.includes(suggestion) && (selectAtLeastOne || value.length > 1)) : (value?.name === suggestion.name && !selectAtLeastOne)) && <MdClose /> }
                                </> }
                            </li>
                        })}
                    </ul> : <ul className="auto-complete-suggestions-drop-down-no-items">
                        <li>{translate("no-suggestions")}</li>
                    </ul>) : <ul className="auto-complete-suggestions-drop-down-no-items">
                        <li>{translate("loading")}</li>
                    </ul> }
                </>
            }
        >
            <InputBaseComponent
                title={title}
                onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                    if (enabled === undefined) inputRef.current?.focus()
                    else if (enabled) changeFocus(false)
                }}
                labelClassName={enabled === undefined ? (inputIsExpanded ? "input-is-expanded" : "") : ""}
                style={{
                    ...style,
                    borderRadius: showSuggestions ? "12px 12px 0 0" : "12px",
                }}
                enabled={enabled}
                setEnabled={setEnabled}
            >
                <div ref={tagsRef} className={"auto-complete-multi-selection-tags " + (inputIsExpanded ? "input-is-expanded" : "")}>
                    { Array.isArray(value) &&
                        value.map((tag, index) => {
                            return <span
                                key={index}
                                className="auto-complete-multi-selection-tag"
                                onClick={(e: React.MouseEvent<HTMLSpanElement>) => {
                                    e.stopPropagation();
                                    if (!filteredSuggestions) return;

                                    applySuggestion(tag.name)
                                }}
                            >
                                <span>{tag.name}</span>
                                <MdClose />
                            </span>
                        })
                    }
                    <input
                        className="auto-complete-multi-input-component-input"
                        ref={inputRef}
                        type={type}
                        value={valueFormatter ? valueFormatter(userInput) : userInput}
                        placeholder={placeholder}
                        onChange={(e) => onChange(e)}
                        onKeyDown={onKeyDown}
                        onFocus={(e) => {
                            changeFocus(true)
                        }}
                        onBlur={(e) => {
                            if (selectAtLeastOne) {
                                //TODO implement on blur select first
                            }
                        }}
                        //TODO make, that blur closes the suggestions but selecting is still possible
                    />
                </div>
            </InputBaseComponent>
        </DropDialog>
    </div>
};

export default AutoCompleteInputComponent;