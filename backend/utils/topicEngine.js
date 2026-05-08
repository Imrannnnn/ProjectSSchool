/**
 * Topic Engine Utility
 * Handles normalization and similarity checking for project topics.
 */

/**
 * Normalizes a topic title for comparison.
 * Lowercases, removes special characters, and trims whitespace.
 * @param {string} title 
 * @returns {string}
 */
const normalizeTopic = (title) => {
    if (!title) return '';
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '') // Remove special characters
        .replace(/\s+/g, ' ')       // Normalize spaces
        .trim();
};

/**
 * Checks if two topic titles are considered duplicates.
 * @param {string} title1 
 * @param {string} title2 
 * @returns {boolean}
 */
const areDuplicates = (title1, title2) => {
    const n1 = normalizeTopic(title1);
    const n2 = normalizeTopic(title2);
    
    // Direct match after normalization
    if (n1 === n2) return true;
    
    // Check keyword similarity
    const words1 = new Set(n1.split(' ').filter(w => w.length > 3)); // Filter out small words like 'the', 'and'
    const words2 = new Set(n2.split(' ').filter(w => w.length > 3));
    
    if (words1.size === 0 || words2.size === 0) return false;
    
    let intersection = 0;
    words1.forEach(word => {
        if (words2.has(word)) intersection++;
    });
    
    // If more than 80% of significant words match, consider it a potential duplicate
    const similarity = intersection / Math.max(words1.size, words2.size);
    if (similarity > 0.8) return true;
    
    return false;
};

module.exports = {
    normalizeTopic,
    areDuplicates
};
