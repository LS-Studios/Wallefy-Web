export class InputValueIdModel {
    name: string = ""
    uid: string | null = null

    constructor(value: string, uid: string | null) {
        this.name = value
        this.uid = uid
    }
}