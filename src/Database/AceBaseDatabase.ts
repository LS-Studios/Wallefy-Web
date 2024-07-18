const { AceBase } = require('acebase');
const db = AceBase.WithIndexedDB('wallefy-db', { multipleTabs: true, logLevel: "error" });

export const getAceBaseDatabase = () => {
    return db
}