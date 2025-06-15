import { friendshipUrls } from '@/api/urls';

const sendFriendRequest = (payload) => window.axios.post(friendshipUrls.send, payload);
const acceptFriendRequest = (friendshipId) => window.axios.post(friendshipUrls.accept(friendshipId));
const rejectFriendRequest = (friendshipId) => window.axios.post(friendshipUrls.reject(friendshipId));
const cancelFriendRequest = (friendshipId) => window.axios.delete(friendshipUrls.cancel(friendshipId));
const removeFriend = (friendshipId) => window.axios.delete(friendshipUrls.remove(friendshipId));

const getFriends = (userId) => window.axios.get(friendshipUrls.friends(userId));
const getSentFriendRequests = (userId) => window.axios.get(friendshipUrls.sentRequests(userId));
const getReceivedFriendRequests = (userId) => window.axios.get(friendshipUrls.receivedRequests(userId));

export default {
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    cancelFriendRequest,
    removeFriend,
    getFriends,
    getSentFriendRequests,
    getReceivedFriendRequests,
};
