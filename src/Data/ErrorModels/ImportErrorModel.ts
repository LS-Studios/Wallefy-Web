export class ImportErrorModel {
    selectedFileError: boolean = false;

    constructor(selectedFileError: boolean = false) {
        this.selectedFileError = selectedFileError;
    }
}