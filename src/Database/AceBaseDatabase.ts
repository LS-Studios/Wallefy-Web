const { AceBase } = require('acebase');
const db = AceBase.WithIndexedDB('wallefy-db', { multipleTabs: true, logLevel: "error" });

export const getDatabase = () => {
    return db
}