const BASE_URL = '/friendships';

const friendshipUrls = {
    send: `${BASE_URL}/send`,
    accept: (id) => `${BASE_URL}/${id}/accept`,
    reject: (id) => `${BASE_URL}/${id}/reject`,
    cancel: (id) => `${BASE_URL}/${id}/cancel`,
    remove: (id) => `${BASE_URL}/${id}/remove`,

    friends: (userId) => `${BASE_URL}/${userId}/friends`,
    sentRequests: (userId) => `${BASE_URL}/${userId}/sent-requests`,
    receivedRequests: (userId) => `${BASE_URL}/${userId}/received-requests`,
};

export default friendshipUrls;
