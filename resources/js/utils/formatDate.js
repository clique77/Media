export const formatDate = (
    inputDate,
    locale = navigator.language,
    { short = false } = {}
) => {
    const date = new Date(inputDate);
    const now = new Date();
    const diff = (now - date) / 1000;

    const rtf = new Intl.RelativeTimeFormat(locale, {
        numeric: 'auto',
        style: short ? 'narrow' : 'long',
    });

    if (diff < 60) return rtf.format(-Math.floor(diff), 'second');
    if (diff < 3600) return rtf.format(-Math.floor(diff / 60), 'minute');
    if (diff < 86400) return rtf.format(-Math.floor(diff / 3600), 'hour');
    if (diff < 2592000) return rtf.format(-Math.floor(diff / 86400), 'day');

    return new Intl.DateTimeFormat(locale, {
        day: 'numeric',
        month: short ? 'short' : 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: short ? undefined : 'short',
    }).format(date);
};
