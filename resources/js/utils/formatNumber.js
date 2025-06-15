export const formatNumber = (num) => {
    if (num === null || num === undefined) return '';

    const units = ['', 'K', 'M', 'B', 'T'];
    const threshold = 1000;
    let unitIndex = 0;

    while (Math.abs(num) >= threshold && unitIndex < units.length - 1) {
        num /= threshold;
        unitIndex++;
    }

    return num.toFixed(1).replace(/\.0$/, '') + units[unitIndex];
}
