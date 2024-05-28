import React, { useState, useRef, useEffect } from "react";
import "./DropDialog.scss"

function DropDialog({
    isOpen,
    setIsOpen,
    setIsDroppedUp,
    content,
    wrapContent=false,
    style,
    children
}: React.PropsWithChildren<{
    isOpen: boolean,
    setIsOpen: (value: boolean) => void,
    setIsDroppedUp?: (value: boolean) => void,
    content: React.ReactNode,
    wrapContent?: boolean,
    style?: React.CSSProperties
}>) {
    const [menuHeight, setMenuHeight] = useState<string | number>("auto");
    const [dropUp, setDropUp] = useState<boolean>(false);
    const dropDialogRef = useRef<HTMLDivElement>(null);
    const dropDialogMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            // @ts-ignore
            if (dropDialogRef.current && !dropDialogRef.current.contains(event.target)) {
                // @ts-ignore
                if (dropDialogMenuRef.current && !dropDialogMenuRef.current.contains(event.target)) {
                    setIsOpen(false);
                }
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropDialogRef]);

    function setDropdownPosition() {
        if (dropDialogRef.current == null || dropDialogMenuRef.current == null) return;

        const windowHeight = window.innerHeight;
        const dropDialogMenuRect = dropDialogMenuRef.current.getBoundingClientRect()

        if (dropDialogMenuRect.bottom > windowHeight) {
            setMenuHeight("auto")
            setDropUp(true);
            setIsDroppedUp && setIsDroppedUp(true);
        } else {
            const heightValue = dropDialogMenuRef.current.offsetHeight

            if (!isOpen || heightValue == 0) setMenuHeight("auto")
            else setMenuHeight(heightValue);

            setDropUp(false);
            setIsDroppedUp && setIsDroppedUp(false);
        }
    }

    useEffect(() => {
        setDropdownPosition();
    }, [isOpen]);

    return (
        <div className="dropDialog" ref={dropDialogRef}>
            {children}
            <div className={"dialogHeightAdjust" + " " + (isOpen ? "show" : "") + " " + (dropUp ? "dropUp" : "")  + " " + (wrapContent ? "wrapContent" : "")} style={{...style, height: menuHeight}} ref={dropDialogMenuRef}>
                {content}
            </div>
        </div>
    );
}

export default DropDialog;