import {InputNameValueModel} from "../Data/DataModels/Input/InputNameValueModel";
import {DBItem} from "../Data/DatabaseModels/DBItem";

export const getInputValueUidByUid = <T extends DBItem>(uid: string | null, options: InputNameValueModel<T>[] | null, newValue?: string | null): InputNameValueModel<T> | null => {
    if (options === null) return null
    if (!uid && newValue) return new InputNameValueModel<T>(newValue, null)
    else return options.find(option => option.value?.uid === uid) || null
}

export const getInputValueUidsByUids = <T extends DBItem>(uids: string[], options: InputNameValueModel<T>[] | null, newValues?: string[]): InputNameValueModel<T>[] | null => {
    if (options === null) return null

    const newOptions: InputNameValueModel<T>[] = options.filter(option => uids.includes(option.value?.uid!))

    if (newValues) {
        newValues.filter(newValue => !options.map(option => option.name).includes(newValue)).forEach(newValue => {
            newOptions.push(new InputNameValueModel<T>(newValue, null))
        })
    }

    return newOptions
}