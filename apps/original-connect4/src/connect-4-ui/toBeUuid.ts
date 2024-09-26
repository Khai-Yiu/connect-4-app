import { MatcherResult } from '@/vitest';

const UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

function toBeUuid(
    this: { isNot: boolean } | void,
    received: string
): MatcherResult {
    const { isNot } = this ?? {};

    return {
        pass: received.match(UUID_REGEX) !== null,
        message: () =>
            `${received} is${isNot ? ' a valid' : ' an invalid'} v4 UUID`
    };
}

export default toBeUuid;
