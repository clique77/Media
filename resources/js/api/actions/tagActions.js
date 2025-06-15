import {tagUrls} from '@/api/urls';

const getTags = (query = null) => {
    if (typeof query === 'string' && query.trim() !== '') {
        const separator = tagUrls.index.includes('?') ? '&' : '?';
        return window.axios.get(`${tagUrls.index}${separator}${query}`);
    } else if (query && typeof query === 'object') {
        return window.axios.get(tagUrls.index, { params: query });
    }
    return window.axios.get(tagUrls.index);
};

export default {
    getTags,
};
