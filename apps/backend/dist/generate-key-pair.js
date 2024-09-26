"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jose_1 = require("jose");
const createKeyPair = async () => {
    const { publicKey, privateKey } = await (0, jose_1.generateKeyPair)('RS256');
    const publicJWK = await (0, jose_1.exportJWK)(publicKey);
    const privateJWK = await (0, jose_1.exportJWK)(privateKey);
    console.log('\nKey Pair:\n', JSON.stringify({
        publicKey: publicJWK,
        privateKey: privateJWK
    }));
};
createKeyPair();
