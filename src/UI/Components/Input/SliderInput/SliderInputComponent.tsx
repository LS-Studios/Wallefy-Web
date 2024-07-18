import React, {ChangeEvent, ChangeEventHandler, useEffect} from 'react';
import './SliderInputComponent.scss';

import {useTimeout} from "../../../../CustomHooks/useTimeout";

const SliderInputComponent = ({
    value,
    onValueChange,
    min = 0,
    max = 100
}: {
    value: number,
    onValueChange: (value: number) => void,
    min?: number,
    max?: number
}) => {
    const sliderRef = React.useRef<HTMLInputElement>(null);

    function fillSlider() {
        const rangeDistance = Number(sliderRef.current!.max) - Number(sliderRef.current!.min);
        const fromPosition = 0;
        const toPosition = Number(sliderRef.current!.value) - Number(sliderRef.current!.min);
        sliderRef.current!.style.background = `linear-gradient(
          to right,
          var(--stroke-color) 0%,
          var(--stroke-color) 0%,
          var(--text) 0%,
          var(--text) ${(toPosition)/(rangeDistance)*100}%, 
          var(--stroke-color) ${(toPosition)/(rangeDistance)*100}%, 
          var(--stroke-color) 100%)`;
    }

    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
        onValueChange(parseInt(e.target.value, 10));
    }

    const onInput = (e: ChangeEvent<HTMLInputElement>) => {
        fillSlider()
    }

    useTimeout(() => {
        fillSlider();
    }, 50)

    useEffect(() => {
        fillSlider();
    }, [value, min, max]);

    return (
        <div className="slider-input-component">
            <input
                ref={sliderRef}
                type="range"
                value={value}
                onInput={onInput}
                onChange={onChange}
                min={min}
                max={max}
            />
        </div>
    );
};

export default SliderInputComponent;