"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const resolveInternalEventPublisher = (subject) => {
    if (process.env.STAGE === 'DEV') {
        return (eventDetails) => Promise.resolve(subject.next(eventDetails));
    }
    else {
        throw new Error('Prod not implemented.');
    }
};
exports.default = resolveInternalEventPublisher;
