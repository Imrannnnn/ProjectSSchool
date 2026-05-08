const extractNumber = (str) => {
    const match = str.match(/\d+$/);
    return match ? parseInt(match[0], 10) : null;
};

const getPrefix = (str) => {
    return str.replace(/\d+$/, '');
};

const isIdentifierInRange = (identifier, range) => {
    const num = extractNumber(identifier);
    const prefix = getPrefix(identifier);

    if (range.prefix && range.prefix !== prefix) {
        return false;
    }

    if (num !== null && range.startNum !== null && range.endNum !== null) {
        return num >= range.startNum && num <= range.endNum;
    }

    // Fallback to lexicographical comparison
    return identifier >= range.startIdentifier && identifier <= range.endIdentifier;
};

module.exports = { extractNumber, getPrefix, isIdentifierInRange };
