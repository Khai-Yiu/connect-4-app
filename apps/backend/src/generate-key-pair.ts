import { generateKeyPair, exportJWK } from 'jose';

const createKeyPair = async () => {
    const { publicKey, privateKey } = await generateKeyPair('RS256');

    const publicJWK = await exportJWK(publicKey);
    const privateJWK = await exportJWK(privateKey);

    console.log(
        '\nKey Pair:\n',
        JSON.stringify({
            publicKey: publicJWK,
            privateKey: privateJWK
        })
    );
};

createKeyPair();
