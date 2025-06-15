const BASE_URL = '/notifications';

const notificationUrls = {
    index: BASE_URL,
    markAllAsRead: `${BASE_URL}/mark-as-read`,
    markSingleAsRead: (notificationId) => `${BASE_URL}/${notificationId}/mark-as-read`,
    delete: (notificationId) => `${BASE_URL}/${notificationId}`,
};

export default notificationUrls;
