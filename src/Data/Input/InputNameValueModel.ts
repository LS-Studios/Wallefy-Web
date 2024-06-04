export class InputNameValueModel<T> {
    name: string
    value: T | null

    constructor(name: string, value: T | null) {
        this.name = name
        this.value = value
    }
}