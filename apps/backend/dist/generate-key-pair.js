var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { generateKeyPair, exportJWK } from 'jose';
const createKeyPair = () => __awaiter(void 0, void 0, void 0, function* () {
    const { publicKey, privateKey } = yield generateKeyPair('RS256');
    const publicJWK = yield exportJWK(publicKey);
    const privateJWK = yield exportJWK(privateKey);
    console.log('\nKey Pair:\n', JSON.stringify({
        publicKey: publicJWK,
        privateKey: privateJWK
    }));
});
createKeyPair();
