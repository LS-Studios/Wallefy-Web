const { AceBase } = require('acebase');
const db = AceBase.WithIndexedDB('wallefy-db', { multipleTabs: true });

export const getDatabase = () => {
    return db
}