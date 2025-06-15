import { postViewUrls } from '@/api/urls';

const getPostViews = () => window.axios.get(postViewUrls.index);

export default {
    getPostViews,
};
