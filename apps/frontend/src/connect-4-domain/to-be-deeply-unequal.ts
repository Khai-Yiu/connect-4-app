import { MatcherResult } from '@/vitest';

function checkIsPlainObjectOrArray(value: any): boolean {
    return (
        Array.isArray(value) ||
        (value !== null &&
            typeof value === 'object' &&
            Object.getPrototypeOf(value) === Object.prototype)
    );
}

function getObjectOrArrayValues(value: [] | {}): Array<any> {
    return Object.values(value).reduce(
        (accValues: Array<any>, currentValue): Array<any> => {
            if (checkIsPlainObjectOrArray(currentValue)) {
                return [
                    ...accValues,
                    currentValue,
                    ...getObjectOrArrayValues(currentValue)
                ];
            }

            return accValues;
        },
        [] as Array<any>
    );
}

function isDeeplyUnequal(valueOne: any, valueTwo: any): boolean {
    if (
        !(
            checkIsPlainObjectOrArray(valueOne) &&
            checkIsPlainObjectOrArray(valueTwo)
        )
    ) {
        return true;
    }

    if (valueOne === valueTwo) {
        return false;
    }

    const objectOneValues = getObjectOrArrayValues(valueOne);
    const objectTwoValues = getObjectOrArrayValues(valueTwo);

    return objectOneValues.reduce(
        (isUnequal, currValue) =>
            isUnequal && !objectTwoValues.find((value) => value === currValue),
        true
    );
}

function toBeDeeplyUnequal(
    this: { isNot: boolean } | void,
    received: object,
    expected: object
): MatcherResult {
    const isNot = this ?? {};

    return {
        pass: isDeeplyUnequal(received, expected),
        message: () => `Objects are deeply ${isNot ? 'un' : ''}equal`
    };
}

export default toBeDeeplyUnequal;
