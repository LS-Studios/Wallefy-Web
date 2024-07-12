export class AuthenticationErrorModel {
    userNotFound: boolean = false;
    nameError: boolean = false;
    emailError: boolean = false;
    emailAlreadyInUse: boolean = false;
    passwordError: boolean = false;
    repeatPasswordError: boolean = false;

    constructor(
        userNotFound: boolean = false,
        nameError: boolean = false,
        emailError: boolean = false,
        emailAlreadyInUse: boolean = false,
        passwordError: boolean = false,
        repeatPasswordError: boolean = false,
    ) {
        this.userNotFound = userNotFound
        this.nameError = nameError
        this.emailError = emailError
        this.emailAlreadyInUse = emailAlreadyInUse
        this.passwordError = passwordError
        this.repeatPasswordError = repeatPasswordError
    }
}