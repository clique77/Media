import { userStatusUrls } from '@/api/urls';

const setUserOnline = () => window.axios.post(userStatusUrls.setOnline());
const setUserOffline = () => window.axios.post(userStatusUrls.setOffline());
const getOnlineUserIds = () => window.axios.get(userStatusUrls.getOnlineUserIds());

export default {
    setUserOnline,
    setUserOffline,
    getOnlineUserIds,
};
