var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import appFactory from '@/app';
import resolveInternalEventPublisher from '@/resolve-internal-event-publisher';
import { Subject } from 'rxjs';
import { importJWK } from 'jose';
function initializeApp() {
    return __awaiter(this, void 0, void 0, function* () {
        const subject = new Subject();
        const app = appFactory({
            stage: process.env.STAGE,
            keySet: {
                publicKey: (yield importJWK(JSON.parse(process.env.JWT_PUBLIC_KEY), 'RS256')),
                privateKey: (yield importJWK(JSON.parse(process.env.JWT_PRIVATE_KEY), 'RS256'))
            },
            internalEventPublisher: resolveInternalEventPublisher(subject),
            internalEventSubscriber: subject
        });
        app.listen(process.env.PORT, () => {
            console.log(`Listening on port ${process.env.PORT}`);
        });
    });
}
initializeApp();
