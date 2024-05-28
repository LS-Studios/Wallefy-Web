import React, {CSSProperties, useEffect, useState} from 'react';
import InputBaseComponent from "../InputBase/InputBaseComponent";
import './AutoCompleteInputComponent.scss';
import DropDialog from "../../Dropdialog/DropDialog";
import {MdClose} from "react-icons/md";
import {InputValueIdModel} from "../../../../Data/Input/InputValueIdModel";
import {getInputValueUidByUid} from "../../../../Helper/HandyFunctionHelper";
import {useContextMenu} from "../../../../Providers/ContextMenuProvider";
import {ContentAction} from "../../../../Data/ContentAction/ContentAction";
import {deleteDBItem, deleteDBItemByUid} from "../../../../Helper/AceBaseHelper";
import {DatabaseRoutes} from "../../../../Helper/DatabaseRoutes";

const AutoCompleteInputComponent = ({
    title,
    value,
    onValueChange,
    suggestions,
    valueFormatter,
    suggestionUlStyle,
    suggestionElement,
    placeholder = "",
    type = "text",
    allowCreatingNew = false,
    onDelete,
    enabled,
    setEnabled,
    style,
}: {
    title: string,
    value: InputValueIdModel | InputValueIdModel[] | null,
    onValueChange: (value: InputValueIdModel | InputValueIdModel[] | null) => void,
    suggestions: InputValueIdModel[] | null,
    valueFormatter?: (value: string) => string,
    suggestionUlStyle?: CSSProperties,
    suggestionElement?: (suggestion: InputValueIdModel) => React.ReactElement
    placeholder?: string,
    type?: string,
    allowCreatingNew?: boolean,
    onDelete?: (value: InputValueIdModel) => void,
    enabled?: boolean,
    setEnabled?: (enabled: boolean) => void,
    style?: CSSProperties,
}) => {
    const contextMenu = useContextMenu()

    const inputRef = React.createRef<HTMLInputElement>();
    const tagsRef = React.createRef<HTMLDivElement>();

    const [dropDownTopOffset, setDropDownTopOffset] = useState<number>(0)

    const [inputIsExpanded, setInputIsExpanded] = useState<Boolean>(false)

    const [userInput, setUserInput] = useState<string>(Array.isArray(value) ? "" : value?.name || "")
    const [activeSuggestion, setActiveSuggestion] = useState<number | null>(null)
    const [filteredSuggestions, setFilteredSuggestions] = useState<InputValueIdModel[] | null>(null)
    const [showSuggestions, setShowSuggestions] = useState<boolean>(false)

    useEffect(() => {
        if (suggestions) setFilteredSuggestions(suggestions)
    }, [suggestions]);

    useEffect(() => {
        setUserInput(Array.isArray(value) ? "" : value?.name || "")
    }, [value]);

    const valueIsSelected = (suggestion: InputValueIdModel) => {
        if (Array.isArray(value)) {
            return value.map((v) => v.name).includes(suggestion.name);
            //TODO could cause problems if two suggestions have the same name
        } else {
            return value?.name === suggestion.name;
        }
    }

    const applySuggestion = (suggestion: InputValueIdModel) => {
        if (!suggestion) return;

        if (allowCreatingNew && activeSuggestion === 0) {
            if (Array.isArray(value)) {
                onValueChange([...value, new InputValueIdModel(userInput, null)]);
                setUserInput("");
            } else {
                onValueChange(new InputValueIdModel(userInput, null));
            }
        } else if (valueIsSelected(suggestion)) {
            if (Array.isArray(value)) {
                const newValue = value.filter((v) => v.name !== suggestion.name);
                onValueChange(newValue);

                setUserInput("");
            } else {
                setUserInput("");
                onValueChange(null);
            }
        } else {
            if (Array.isArray(value)) {
                onValueChange([...value, suggestion]);

                setUserInput("");
            } else {
                setUserInput(suggestion.name);
                onValueChange(suggestion);
            }
        }

        setFilteredSuggestions(suggestions);
    }

    const changeFocus = (newFocusValue: boolean) => {
        if (!Array.isArray(value) && !value) {
            setUserInput("")
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

        const filteredSuggestions = suggestions?.filter(
            suggestion =>
                suggestion.name.toLowerCase().indexOf(userInput.toLowerCase()) > -1
        ) || [];

        if (userInput) {
            setActiveSuggestion(0)
            if (allowCreatingNew) filteredSuggestions.unshift(new InputValueIdModel("Als neue Option hinzufügen", null))
        } else {
            setActiveSuggestion(null)
        }

        setFilteredSuggestions(filteredSuggestions);

        setUserInput(userInput);

        if (!Array.isArray(value) && value?.uid) {
            onValueChange(null);
        }
    }

    const selectSuggestion = (suggestion: InputValueIdModel) => {
        if (!valueIsSelected(suggestion)) {
            setActiveSuggestion(null);
            setShowSuggestions(false);
        }

        applySuggestion(suggestion);
    }

    const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (!filteredSuggestions) return;

        if (e.key === "Enter") {
            applySuggestion(filteredSuggestions[activeSuggestion!]);
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
                                onClick={(e) => selectSuggestion(suggestion)}
                                className={(Array.isArray(value) ? value.includes(suggestion) : value === suggestion) ? "active" : index === activeSuggestion ? "selected" : ""}
                                onContextMenu={(e) => {
                                    onDelete && contextMenu.handleOnContextMenu(e, [
                                        new ContentAction(
                                            "Delete",
                                            () => {
                                                onDelete(suggestion)
                                            }
                                        )
                                    ])
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
                    if (enabled === undefined) changeFocus(!showSuggestions)
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
                                    applySuggestion(tag)
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
                        // onClick={() => inputRef.current?.blur()}
                        // onFocusCapture={(e) => {
                        //     e.preventDefault()
                        //     changeFocus(true)
                        // }}
                    />
                </div>
            </InputBaseComponent>
        </DropDialog>
    </div>
};

export default AutoCompleteInputComponent;