import {InputValueIdModel} from "../Data/Input/InputValueIdModel";

export const getInputValueUidByUid = (uid: string | null, options: InputValueIdModel[] | null, newValue?: string | null): InputValueIdModel | null => {
    if (options === null) return null
    if (!uid && newValue) return new InputValueIdModel(newValue, null)
    else return options.find(option => option.uid === uid) || null
}

export const getInputValueUidsByUids = (uids: string[], options: InputValueIdModel[] | null, newValues?: string[]): InputValueIdModel[] | null => {
    if (options === null) return null

    const newOptions: InputValueIdModel[] = options.filter(option => uids.includes(option.uid!))

    if (newValues) {
        newValues.forEach((newValue) => {
            newOptions.push(new InputValueIdModel(newValue, null))
        })
    }

    return newOptions
}