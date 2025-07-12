export const a = ""
// const crypto = require('crypto')
//
// import {EncryptionDataModel} from "../Data/DataModels/EncryptionDataModel";
//
// export const getEncryptionData = (password: string): EncryptionDataModel => {
//     const passphrase = Buffer.from(password);
//
//     const salt = Buffer.alloc(128/8);
//     const iv = Buffer.alloc(128/8);
//
//     crypto.randomFillSync(salt);
//
//     crypto.randomFillSync(iv);
//
//     const key = crypto.scryptSync(passphrase, salt, 256/8)
//
//     return new EncryptionDataModel(
//         key.toString('base64'),
//         salt.toString('base64'),
//         iv.toString('base64')
//     )
// }
//
// export const encrypt = (data: any, encryptionData: EncryptionDataModel) => {
//     const cipher = crypto.createCipheriv('aes-256-gcm', encryptionData.key, encryptionData.iv);
//
//     const enc = Buffer.concat([
//         cipher.update(JSON.stringify(data), 'utf8'),
//         cipher.final()
//     ]);
//
//     return enc.toString('base64')
// }
//
// export const decrypt = (encryptedData: string, encryptionData: EncryptionDataModel): any => {
//     const encryptedDataBuffer = Buffer.from(encryptedData, 'base64');
//     const decipher = crypto.createDecipheriv('aes-256-gcm', encryptionData.key, encryptionData.iv);
//     const data = decipher.update(encryptedDataBuffer);
//     return JSON.parse(data.toString('base64'))
// }