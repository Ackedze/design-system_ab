export const formatNumber = (number: string, mask: string) => {
    if (!number) {
        return '';
    }

    let formattedNumber = '';
    let numberIndex = 0;

    for (let i = 0; i < mask.length; i++) {
        if (mask[i] === 'x' && numberIndex < number.length) {
            formattedNumber += number[numberIndex];
            numberIndex += 1;
        } else {
            formattedNumber += '\u205f';
        }
    }

    return formattedNumber;
};
