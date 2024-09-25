import { expect } from '@jest/globals';
import toBeUuid from './src/utils/to-be-uuid';
import toBeDeeplyUnequal from './src/utils/to-be-deeply-unequal';

expect.extend({
    toBeUuid,
    toBeDeeplyUnequal
});
