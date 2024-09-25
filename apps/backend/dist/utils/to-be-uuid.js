const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const toBeUuid = function (received) {
    const { isNot } = this !== null && this !== void 0 ? this : {};
    return {
        pass: received.match(UUID_REGEX) !== null,
        message: () => `${received} is${isNot ? ' a valid' : ' an invalid'} v4 UUID`
    };
};
export default toBeUuid;
