import { settingUrls } from '@/api/urls';

const getSettings = () => window.axios.get(settingUrls.get());
const updateNotification = (payload) => window.axios.post(settingUrls.updateNotifications(), payload);
const updateMessagePrivacy = (payload) => window.axios.post(settingUrls.updateMessagePrivacy(), payload);
const updateFriendRequestPrivacy = (payload) => window.axios.post(settingUrls.updateFriendRequestPrivacy(), payload);

export default {
    getSettings,
    updateNotification,
    updateMessagePrivacy,
    updateFriendRequestPrivacy,
};
