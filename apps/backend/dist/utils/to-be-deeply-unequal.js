"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function checkIsPlainObjectOrArray(value) {
    return (Array.isArray(value) ||
        (value !== null &&
            typeof value === 'object' &&
            Object.getPrototypeOf(value) === Object.prototype));
}
function getObjectOrArrayValues(value) {
    return Object.values(value).reduce((accValues, currentValue) => {
        if (checkIsPlainObjectOrArray(currentValue)) {
            return [
                ...accValues,
                currentValue,
                ...getObjectOrArrayValues(currentValue)
            ];
        }
        return accValues;
    }, []);
}
function isDeeplyUnequal(valueOne, valueTwo) {
    if (!(checkIsPlainObjectOrArray(valueOne) &&
        checkIsPlainObjectOrArray(valueTwo))) {
        return true;
    }
    if (valueOne === valueTwo) {
        return false;
    }
    const objectOneValues = getObjectOrArrayValues(valueOne);
    const objectTwoValues = getObjectOrArrayValues(valueTwo);
    return objectOneValues.reduce((isUnequal, currValue) => isUnequal && !objectTwoValues.find((value) => value === currValue), true);
}
const toBeDeeplyUnequal = function (received, expected) {
    const isNot = this ?? {};
    return {
        pass: isDeeplyUnequal(received, expected),
        message: () => `Objects are deeply ${isNot ? 'un' : ''}equal`
    };
};
exports.default = toBeDeeplyUnequal;
