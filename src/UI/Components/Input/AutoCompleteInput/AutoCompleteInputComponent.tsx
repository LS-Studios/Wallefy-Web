import React, {CSSProperties, useEffect, useState} from 'react';
import InputBaseComponent from "../InputBase/InputBaseComponent";
import './AutoCompleteInputComponent.scss';
import DropDialog from "../../Dropdialog/DropDialog";
import {MdClose} from "react-icons/md";
import {InputNameValueModel} from "../../../../Data/Input/InputNameValueModel";
import {getInputValueUidByUid} from "../../../../Helper/HandyFunctionHelper";
import {useContextMenu} from "../../../../Providers/ContextMenuProvider";
import {ContentAction} from "../../../../Data/ContentAction/ContentAction";
import {deleteDBItem, deleteDBItemByUid} from "../../../../Helper/AceBaseHelper";
import {DatabaseRoutes} from "../../../../Helper/DatabaseRoutes";

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
    contextMenuOptions?: (value: InputNameValueModel<T>) => ContentAction[],
    enabled?: boolean,
    setEnabled?: (enabled: boolean) => void,
    style?: CSSProperties,
}) {
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
        setFilteredSuggestions(suggestionsToWorkWith)
    }, [suggestionsToWorkWith]);

    useEffect(() => {
        if (changeUserInputOnValueChange) {
            setUserInput(Array.isArray(value) ? "" : value?.name || "")
            setChangeUserInputOnValueChange(true)
            //TODO could cause problem, if value is not fetched yet and user puts something in
        }
    }, [value]);

    const valueIsSelected = (suggestion: InputNameValueModel<T>) => {
        if (Array.isArray(value)) {
            return value.map((v) => v.name).includes(suggestion.name);
        } else {
            return value?.name === suggestion.name;
        }
    }

    const applySuggestion = (selectedSuggestion: number) => {
        const suggestion = filteredSuggestions![selectedSuggestion]

        setChangeUserInputOnValueChange(false)
        if (allowCreatingNew && !suggestion.value) {
            if (Array.isArray(value)) {
                onValueChange([...value, new InputNameValueModel<T>(userInput, null)]);
                setUserInput("");
            } else {
                onValueChange(new InputNameValueModel<T>(userInput, null));
            }
        } else if (valueIsSelected(suggestion)) {
            if (Array.isArray(value)) {

                const newValue = value.filter((v) => v.name !== suggestion.name);
                onValueChange(newValue);

                setUserInput("");
            } else {
                onValueChange(null);
            }
        } else {
            if (Array.isArray(value)) {
                onValueChange([...value, suggestion]);
                setUserInput("");
            } else {
                onValueChange(suggestion);
            }
        }

        setFilteredSuggestions(suggestionsToWorkWith);
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

        if (userInput) {
            setActiveSuggestion(0)
            if (allowCreatingNew) filteredSuggestions.unshift(new InputNameValueModel<T>("Als neue Option hinzufügen", null))
        } else {
            setActiveSuggestion(null)
        }

        setFilteredSuggestions(filteredSuggestions);

        if (!Array.isArray(value)) {
            onValueChange(null);
        }

        setUserInput(userInput);
    }

    const selectSuggestion = (selectedSuggestion: number) => {
        const suggestion = filteredSuggestions![selectedSuggestion];

        if (!suggestion?.value || !valueIsSelected(suggestion)) {
            setActiveSuggestion(null);
            setShowSuggestions(false);
        }

        applySuggestion(selectedSuggestion);
    }

    const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (!filteredSuggestions) return;

        if (e.key === "Enter") {
            if (activeSuggestion !== null) applySuggestion(activeSuggestion!);

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
                        { filteredSuggestions.length ? filteredSuggestions.map((suggestion, index) => {
                            return <li
                                key={index}
                                onClick={(e) => selectSuggestion(index)}
                                className={(Array.isArray(value) ? value.includes(suggestion) : value === suggestion) ? "active" : index === activeSuggestion ? "selected" : ""}
                                onContextMenu={(e) => {
                                    contextMenuOptions && contextMenu.handleOnContextMenu(e, contextMenuOptions(suggestion))
                                }}
                            >
                                { suggestionElement ? suggestionElement(suggestion) : <>
                                    <span>{suggestion.name}</span>
                                    { (Array.isArray(value) ? value.includes(suggestion) : value === suggestion) && <MdClose /> }
                                </> }
                            </li>
                        }) : <div>
                            <li>No suggestions available</li>
                        </div>}
                    </ul> : <ul className="auto-complete-suggestions-drop-down-no-items">
                        <li>No suggestions</li>
                    </ul>) : <ul className="auto-complete-suggestions-drop-down-no-items">
                        <li>Loading ...</li>
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

                                    const suggestionIndex = filteredSuggestions?.indexOf(tag)
                                    suggestionIndex !== -1 && applySuggestion(suggestionIndex!)
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
                        // onBlur={(e) => {
                        //     changeFocus(false)
                        // }}
                        //TODO make, that blur closes the suggestions but selecting is still possible
                    />
                </div>
            </InputBaseComponent>
        </DropDialog>
    </div>
};

export default AutoCompleteInputComponent;