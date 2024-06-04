import React, {useEffect} from 'react';
import './SliderInputComponent.scss';

// @ts-ignore
import variables from '../../../../Data/Variables.scss';
import {useTimeout} from "../../../../CustomHooks/useTimeout";

const SliderInputComponent = ({
    fromValue,
    onFromValueChange,
    toValue,
    onToValueChange,
    min = 0,
    max = 100
}: {
    fromValue: number,
    onFromValueChange: (value: number) => void,
    toValue: number,
    onToValueChange: (value: number) => void,
    min?: number,
    max?: number
}) => {
    const fromSliderRef = React.useRef<HTMLInputElement>(null);
    const toSliderRef = React.useRef<HTMLInputElement>(null);

    function getParsed(currentFrom: HTMLInputElement, currentTo: HTMLInputElement) {
        const from = parseInt(currentFrom.value, 10);
        const to = parseInt(currentTo.value, 10);
        return [from, to];
    }

    function fillSlider() {
        const rangeDistance = Number(toSliderRef.current!.max) - Number(toSliderRef.current!.min);
        const fromPosition = Number(fromSliderRef.current!.value) - Number(toSliderRef.current!.min);
        const toPosition = Number(toSliderRef.current!.value) - Number(toSliderRef.current!.min);
        toSliderRef.current!.style.background = `linear-gradient(
          to right,
          ${variables.stroke_color} 0%,
          ${variables.stroke_color} ${(fromPosition)/(rangeDistance)*100}%,
          ${variables.text_color} ${((fromPosition)/(rangeDistance))*100}%,
          ${variables.text_color} ${(toPosition)/(rangeDistance)*100}%, 
          ${variables.stroke_color} ${(toPosition)/(rangeDistance)*100}%, 
          ${variables.stroke_color} 100%)`;
    }

    function setToggleAccessible(currentTarget: HTMLInputElement) {
        if (Number(currentTarget.value) <= 0 ) {
            toSliderRef.current!.style.zIndex = String(2);
        } else {
            toSliderRef.current!.style.zIndex = String(0);
        }
    }

    const controlFrom = () => {
        fillSlider();
    }

    const controlTo = () => {
        fillSlider();
        setToggleAccessible(toSliderRef.current!);
    }

    const onChangeFrom = (e: React.ChangeEvent<HTMLInputElement>) => {
        const [from, to] = getParsed(fromSliderRef.current!, toSliderRef.current!);
        if (from > to) {
            onFromValueChange(to);
        } else {
            onFromValueChange(from)
        }
    }

    const onChangeTo = (e: React.ChangeEvent<HTMLInputElement>) => {
        const [from, to] = getParsed(fromSliderRef.current!, toSliderRef.current!);
        if (from <= to) {
            onToValueChange(to)
        } else {
            onToValueChange(from)
        }
    }

    useTimeout(() => {
        fillSlider();
        setToggleAccessible(toSliderRef.current!);
    }, 50)

    useEffect(() => {
        controlFrom();
    }, [fromValue]);

    useEffect(() => {
        controlTo();
    }, [toValue]);

    return (
        <div className="slider-input-component">
            <input
                ref={fromSliderRef}
                id="fromSlider"
                type="range"
                value={fromValue}
                onInput={controlFrom}
                onChange={onChangeFrom}
                min={min}
                max={max}
            />
            <input
                ref={toSliderRef}
                id="toSlider"
                type="range"
                value={toValue}
                onInput={controlTo}
                onChange={onChangeTo}
                min={min}
                max={max}
            />
        </div>
    );
};

export default SliderInputComponent;