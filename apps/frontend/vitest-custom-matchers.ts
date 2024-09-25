import { expect } from 'vitest';
import toBeUuid from './src/connect-4-ui/toBeUuid';
import toBeDeeplyUnequal from './src/connect-4-domain/to-be-deeply-unequal';

expect.extend({
    toBeUuid,
    toBeDeeplyUnequal
});
