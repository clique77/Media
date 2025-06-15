import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import echoAxios from "@/config/echoAxios.js";

window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    wsHost: import.meta.env.VITE_PUSHER_HOST || 'ws-eu.pusher.com',
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    wsPort: import.meta.env.VITE_PUSHER_PORT ?? 80,
    wssPort: import.meta.env.VITE_PUSHER_PORT ?? 443,
    forceTLS: (import.meta.env.VITE_PUSHER_SCHEME ?? 'https') === 'https',
    enabledTransports: ['ws', 'wss'],
    auth: {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            Accept: 'application/json',
        },
    },
    authorizer: (channel, options) => {
        return {
            authorize: (socketId, callback) => {
                echoAxios
                    .post('/broadcasting/auth', {
                        socket_id: socketId,
                        channel_name: channel.name,
                    })
                    .then((response) => {
                        callback(null, response.data);
                    })
                    .catch((error) => {
                        callback(error);
                    });
            },
        };
    },
});
