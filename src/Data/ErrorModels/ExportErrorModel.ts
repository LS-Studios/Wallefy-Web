export class ExportErrorModel {
    fileNameError: boolean = false;

    constructor(nameError: boolean = false) {
        this.fileNameError = nameError;
    }
}