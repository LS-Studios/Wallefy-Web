export class EncryptionDataModel {
    key: string;
    iv: string;
    salt: string;

    constructor(key: string, iv: string, salt: string) {
        this.key = key;
        this.iv = iv;
        this.salt = salt;
    }

    toBuffer() {
        return {
            key: Buffer.from(this.key, 'base64'),
            iv: Buffer.from(this.iv, 'base64'),
            salt: Buffer.from(this.salt, 'base64')
        }
    }
}