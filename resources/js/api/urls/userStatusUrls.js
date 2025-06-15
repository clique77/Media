const BASE_URL = '/user/status';

const userStatusUrls = {
    setOnline: () => `${BASE_URL}/online`,
    setOffline: () => `${BASE_URL}/offline`,
    getOnlineUserIds: () => `${BASE_URL}/online-ids`,
};

export default userStatusUrls;
