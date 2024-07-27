export const test = () => {
    window.crypto.subtle.generateKey(
        {
            name: "RSA-OAEP",
            modulusLength: 2048, // can be 1024, 2048, or 4096
            publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
            hash: { name: "SHA-256" }, // can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
        },
        true, // whether the key is extractable (i.e. can be used in exportKey)
        ["encrypt", "decrypt"] // can be any combination of "encrypt" and "decrypt"
    ).then(keys => {
        const { publicKey, privateKey } = keys

        console.log("publicKey", publicKey, "privateKey", privateKey)
        const encoder = new TextEncoder()
        window.crypto.subtle.encrypt(
            {
                name: "RSA-OAEP",
            },
            publicKey, // from generateKey or importKey above
            encoder.encode("Hello, World!")
        ).then(encryptedData => {
            const decoder = new TextDecoder()
            console.log("encryptedData", encryptedData)
            window.crypto.subtle.decrypt(
                {
                    name: "RSA-OAEP",
                },
                privateKey, // from generateKey or importKey above
                encryptedData // ArrayBuffer of the data
            ).then(decryptedData => {
                console.log("decryptedData", decoder.decode(decryptedData))
            })
        })
    })
}