"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const createDispatchNotification = (server) => {
    return async (notification) => {
        server
            .of('/notification')
            .to(notification.recipient)
            .emit(notification.type, notification.payload);
    };
};
exports.default = createDispatchNotification;
