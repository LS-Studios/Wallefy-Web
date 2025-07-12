export class CreateAccountInputErrorModel {
    nameError: boolean = false;

    constructor(nameError: boolean = false) {
        this.nameError = nameError;
    }
}