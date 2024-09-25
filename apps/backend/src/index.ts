import appFactory from '@/app';
import resolveInternalEventPublisher from '@/resolve-internal-event-publisher';
import { Stage } from '@/global';
import { InviteCreatedEvent } from '@/invite/create-invite-event-listener';
import { Subject } from 'rxjs';
import { importJWK, KeyLike } from 'jose';

async function initializeApp() {
    const subject = new Subject<InviteCreatedEvent>();
    const app = appFactory({
        stage: process.env.STAGE as Stage,
        keySet: {
            publicKey: (await importJWK(
                JSON.parse(process.env.JWT_PUBLIC_KEY),
                'RS256'
            )) as KeyLike,
            privateKey: (await importJWK(
                JSON.parse(process.env.JWT_PRIVATE_KEY),
                'RS256'
            )) as KeyLike
        },
        internalEventPublisher: resolveInternalEventPublisher(subject),
        internalEventSubscriber: subject
    });

    app.listen(process.env.PORT, () => {
        console.log(`Listening on port ${process.env.PORT}`);
    });
}

initializeApp();
