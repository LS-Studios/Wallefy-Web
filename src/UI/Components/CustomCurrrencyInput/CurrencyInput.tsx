import React, {
  FC,
  useState,
  useEffect,
  useRef,
  forwardRef,
  useMemo,
  useImperativeHandle,
} from 'react';
import { CurrencyInputProps, CurrencyInputOnChangeValues } from './CurrencyInputProps';
import {
  isNumber,
  cleanValue,
  fixedDecimalValue,
  formatValue,
  getLocaleConfig,
  padTrimValue,
  CleanValueOptions,
  getSuffix,
  FormatValueOptions,
  repositionCursor,
} from "./utils";
import {stat} from "fs";
import usePrevious from "../../../CustomHooks/usePrevious";

// @ts-ignore
export const CurrencyInput: FC<CurrencyInputProps> = forwardRef<
  HTMLInputElement,
  CurrencyInputProps
>(
  (
    {
      allowDecimals = true,
      allowNegativeValue = true,
      id,
      name,
      className,
      customInput,
      decimalsLimit,
      defaultValue,
      disabled = false,
      maxLength: userMaxLength,
      value: userValue,
      onValueChange,
      fixedDecimalLength,
      placeholder,
      decimalScale,
      prefix,
      suffix,
      intlConfig,
      step,
      min,
      max,
      disableGroupSeparators = false,
      disableAbbreviations = false,
      decimalSeparator: _decimalSeparator,
      groupSeparator: _groupSeparator,
      onChange,
      onFocus,
      onBlur,
      onKeyDown,
      onKeyUp,
      transformRawValue,
      formatValueOnBlur = true,
      ...props
    }: CurrencyInputProps,
    ref
  ) => {
    if (_decimalSeparator && isNumber(_decimalSeparator)) {
      throw new Error('decimalSeparator cannot be a number');
    }

    if (_groupSeparator && isNumber(_groupSeparator)) {
      throw new Error('groupSeparator cannot be a number');
    }

    const localeConfig = useMemo(() => getLocaleConfig(intlConfig), [intlConfig]);
    const decimalSeparator = _decimalSeparator || localeConfig.decimalSeparator || '';
    const groupSeparator = _groupSeparator || localeConfig.groupSeparator || '';

    if (
      decimalSeparator &&
      groupSeparator &&
      decimalSeparator === groupSeparator &&
      disableGroupSeparators === false
    ) {
      throw new Error('decimalSeparator cannot be the same as groupSeparator');
    }

    const formatValueOptions: Partial<FormatValueOptions> = {
      decimalSeparator,
      groupSeparator,
      disableGroupSeparators,
      intlConfig,
      prefix: prefix || localeConfig.prefix,
      suffix: suffix,
      fixedDecimalLength: fixedDecimalLength,
    };

    const cleanValueOptions: Partial<CleanValueOptions> = {
      decimalSeparator,
      groupSeparator,
      allowDecimals,
      decimalsLimit: decimalsLimit || fixedDecimalLength || 2,
      allowNegativeValue,
      disableAbbreviations,
      prefix: prefix || localeConfig.prefix,
      transformRawValue,
    };

    const [stateValue, setStateValue] = useState(() =>
      defaultValue != null
        ? formatValue({ ...formatValueOptions, decimalScale, value: String(defaultValue) })
        : userValue != null
        ? formatValue({ ...formatValueOptions, decimalScale, value: String(userValue) })
        : ''
    );
    const [dirty, setDirty] = useState(false);
    const [cursor, setCursor] = useState(0);
    const [changeCount, setChangeCount] = useState(0);
    const [lastKeyStroke, setLastKeyStroke] = useState<string | null>(null);
    const oldValue = usePrevious(stateValue);
    const inputRef = useRef<HTMLInputElement>(null);
    useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    /**
     * Process change in value
     */
    const processChange = (value: string, selectionStart?: number | null): void => {
      setDirty(true);

      const { modifiedValue, cursorPosition } = repositionCursor({
        selectionStart,
        value,
        lastKeyStroke,
        stateValue,
        decimalSeparator,
        groupSeparator,
      });

      if (oldValue && cursorPosition) {
        if (lastKeyStroke === decimalSeparator) {
          if (oldValue[cursorPosition - 1] === decimalSeparator) {
            setCursor(oldValue.indexOf(decimalSeparator) + 1);
          } else if (cursorPosition > oldValue.indexOf(decimalSeparator)) {
            setCursor(cursorPosition - 2)
          } else {
            setCursor(cursorPosition - 1)
          }

          setChangeCount(changeCount + 1);
          return
        }
      }

      const stringValue = cleanValue({ value: modifiedValue, ...cleanValueOptions });

      if (userMaxLength && stringValue.replace(/-/g, '').length > userMaxLength) {
        return;
      }

      if (stringValue === '' || stringValue === '-' || stringValue === decimalSeparator) {
        onValueChange && onValueChange(undefined, name, { float: null, formatted: '', value: '' });
        setStateValue(stringValue);
        setCursor(1);
        return;
      }

      // const fixedDecimals = fixedDecimalValue(stringValue, decimalSeparator, fixedDecimalLength);

      const newValue = fixedDecimalLength ? padTrimValue(
          stringValue,
          decimalSeparator,
          decimalScale !== undefined ? decimalScale : fixedDecimalLength
      ) : stringValue

      const stringValueWithoutSeparator = decimalSeparator
        ? newValue.replace(decimalSeparator, '.')
        : newValue;

      const numberValue = parseFloat(stringValueWithoutSeparator);

      const formattedValue = formatValue({
        value: newValue,
        ...formatValueOptions,
      });


      if (cursorPosition != null) {
        // Prevent cursor jumping
        let newCursor = cursorPosition + (formattedValue.length - value.length);
        newCursor = newCursor <= 0 ? (prefix ? prefix.length : 0) : newCursor;

        if (value.length === 1 || (value.length === 2 && value.startsWith("-"))) {
          newCursor -= 3
        }

        if (oldValue && lastKeyStroke === 'Backspace') {
          if (oldValue[cursorPosition] === decimalSeparator) {
            setCursor(oldValue.indexOf(decimalSeparator));
            setChangeCount(changeCount + 1);
            return;
          }
          if (oldValue.indexOf(decimalSeparator) !== -1 && cursorPosition > oldValue.indexOf(decimalSeparator)!) {
            newCursor -= 1
          }
        }

        setCursor(newCursor);
        setChangeCount(changeCount + 1);
      }

      setStateValue(formattedValue);

      if (onValueChange) {
        const values: CurrencyInputOnChangeValues = {
          float: numberValue,
          formatted: formattedValue,
          value: stringValue,
        };
        onValueChange(newValue, name, values);
      }

      setDirty(false);
    };

    /**
     * Handle change event
     */
    const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
      const {
        target: { value, selectionStart },
      } = event;

      processChange(value, selectionStart);

      onChange && onChange(event);
    };

    /**
     * Handle focus event
     */
    const handleOnFocus = (event: React.FocusEvent<HTMLInputElement>): number => {
      onFocus && onFocus(event);
      return stateValue ? stateValue.length : 0;
    };

    /**
     * Handle blur event
     *
     * Format value by padding/trimming decimals if required by
     */
    const handleOnBlur = (event: React.FocusEvent<HTMLInputElement>): void => {
      const {
        target: { value },
      } = event;

      const valueOnly = cleanValue({ value, ...cleanValueOptions });

      if (valueOnly === '-' || valueOnly === decimalSeparator || !valueOnly) {
        setStateValue('');
        onBlur && onBlur(event);
        return;
      }

      const fixedDecimals = fixedDecimalValue(valueOnly, decimalSeparator, fixedDecimalLength);

      const newValue = padTrimValue(
        fixedDecimals,
        decimalSeparator,
        decimalScale !== undefined ? decimalScale : fixedDecimalLength
      );

      const numberValue = parseFloat(newValue.replace(decimalSeparator, '.'));

      const formattedValue = formatValue({
        ...formatValueOptions,
        value: newValue,
      });

      if (onValueChange && formatValueOnBlur) {
        onValueChange(newValue, name, {
          float: numberValue,
          formatted: formattedValue,
          value: newValue,
        });
      }

      setStateValue(formattedValue);

      onBlur && onBlur(event);
    };

    /**
     * Handle key down event
     *
     * Increase or decrease value by step
     */
    const handleOnKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      const { key } = event;

      setLastKeyStroke(key);

      if (step && (key === 'ArrowUp' || key === 'ArrowDown')) {
        event.preventDefault();
        setCursor(stateValue.length);

        const currentValue =
          parseFloat(
            userValue != null
              ? String(userValue).replace(decimalSeparator, '.')
              : cleanValue({ value: stateValue, ...cleanValueOptions })
          ) || 0;
        const newValue = key === 'ArrowUp' ? currentValue + step : currentValue - step;

        if (min !== undefined && newValue < Number(min)) {
          return;
        }

        if (max !== undefined && newValue > Number(max)) {
          return;
        }

        const fixedLength = String(step).includes('.')
          ? Number(String(step).split('.')[1].length)
          : undefined;

        processChange(
          String(fixedLength ? newValue.toFixed(fixedLength) : newValue).replace(
            '.',
            decimalSeparator
          )
        );
      }

      onKeyDown && onKeyDown(event);
    };

    /**
     * Handle key up event
     *
     * Move cursor if there is a suffix to prevent user typing past suffix
     */
    const handleOnKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
      const {
        key,
        currentTarget: { selectionStart },
      } = event;
      if (key !== 'ArrowUp' && key !== 'ArrowDown' && stateValue !== '-') {
        const suffix = getSuffix(stateValue, { groupSeparator, decimalSeparator });

        if (suffix && selectionStart && selectionStart > stateValue.length - suffix.length) {
          /* istanbul ignore else */
          if (inputRef.current) {
            const newCursor = stateValue.length - suffix.length;
            inputRef.current.setSelectionRange(newCursor, newCursor);
          }
        }
      }

      onKeyUp && onKeyUp(event);
    };

    // Update state if userValue changes to undefined
    useEffect(() => {
      if (userValue == null && defaultValue == null) {
        setStateValue('');
      } else if (!dirty) {
        const newValue = fixedDecimalLength ? padTrimValue(
            String(userValue),
            decimalSeparator,
            decimalScale !== undefined ? decimalScale : fixedDecimalLength
        ) : String(userValue)

        const formattedValue = formatValue({
          value: newValue,
          ...formatValueOptions,
        });
        setStateValue(formattedValue);
      }
    }, [defaultValue, userValue]);

    useEffect(() => {
      // prevent cursor jumping if editing value
      if (
        stateValue !== '-' &&
        inputRef.current &&
        document.activeElement === inputRef.current
      ) {
        inputRef.current.setSelectionRange(cursor, cursor);
      }
    }, [stateValue, cursor, inputRef, dirty, changeCount]);

    /**
     * If user has only entered "-" or decimal separator,
     * keep the char to allow them to enter next value
     */
/*    const getRenderValue = () => {
      if (
        userValue != null &&
        stateValue !== '-' &&
        (!decimalSeparator || stateValue !== decimalSeparator)
      ) {
        return formatValue({
          ...formatValueOptions,
          decimalScale: dirty ? undefined : decimalScale,
          value: String(userValue),
        });
      }

      return stateValue;
    };*/

    const inputProps: React.ComponentPropsWithRef<'input'> = {
      type: 'text',
      inputMode: 'decimal',
      id,
      name,
      className,
      onChange: handleOnChange,
      onBlur: handleOnBlur,
      onFocus: handleOnFocus,
      onKeyDown: handleOnKeyDown,
      onKeyUp: handleOnKeyUp,
      placeholder,
      disabled,
      value: stateValue,
      ref: inputRef,
      ...props,
    };

    if (customInput) {
      const CustomInput = customInput;
      return <CustomInput {...inputProps} />;
    }

    return <input {...inputProps} />;
  }
);

CurrencyInput.displayName = 'CurrencyInput';

export default CurrencyInput;
