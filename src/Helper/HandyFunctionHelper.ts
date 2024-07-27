import {InputNameValueModel} from "../Data/DataModels/Input/InputNameValueModel";
import {DBItem} from "../Data/DatabaseModels/DBItem";
import {ListDiffType} from "../Data/EnumTypes/ListDiffType";

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

export function findRemovedElements(a: any[], b: any[]) {
    const removedElements = [];
    for (let item of a) {
        if (!b.includes(item)) {
            removedElements.push(item);
        }
    }
    return removedElements;
}

export function deepEqual(obj1: any, obj2: any): boolean {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
}

export function getListDiff<T>(oldList: T[], newList: T[], result: { (type: ListDiffType, items: T[]): void}) {
    const addedItems = newList.filter(newItem => !oldList.some(oldItem => deepEqual(oldItem, newItem)));
    const changedItems = newList.filter(newItem => !oldList.some(oldItem => deepEqual(oldItem, newItem)));
    const deletedItems = oldList.filter(oldItem => !newList.some(newItem => deepEqual(oldItem, newItem)));

    if (addedItems.length > 0) {
        if (oldList.length === newList.length) {
            if (changedItems.length > 0) {
                result(ListDiffType.Changed, changedItems);
                return;
            } else {
                result(ListDiffType.Nothing, []);
                return;
            }
        } else {
            result(ListDiffType.Added, addedItems);
            return;
        }
    } else if (deletedItems.length > 0) {
        result(ListDiffType.Deleted, deletedItems);
        return;
    }

    result(ListDiffType.Nothing, []);
}

export function toHash(value: string | null) {
    let hash = 0,
        i, chr;
    if (!value || value.length === 0) return hash;
    for (i = 0; i < value.length; i++) {
        chr = value.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0;
    }
    return hash;
}