import React, {useEffect, useState} from 'react';
import {useAuth} from '@/Components/Auth/AuthProvider';
import {Badge, IconButton} from '@mui/material';
import {Notifications} from '@mui/icons-material';
import NotificationsModal from './NotificationsModal.jsx';
import {notificationActions} from '@/api/actions';
import {useQuery} from 'react-query';
import {toast} from "react-toastify";

const NotificationsBell = () => {
    const {user} = useAuth();
    const userId = user?.id;

    const [notifications, setNotifications] = useState([]);
    const [nextPageUrl, setNextPageUrl] = useState(null);

    const {data, isLoading, isError, error} = useQuery({
        queryKey: ['notifications', userId],
        queryFn: () => notificationActions.getNotifications({per_page: 20, only_unread: false}),
        select: (response) => ({
            notifications: response.data.data,
            nextPageUrl: response.data.next_page_url,
        }),
        enabled: !!userId && !!user.email_verified_at,
        refetchOnWindowFocus: false,
        retry: false,
    });

    useEffect(() => {
        if (data) {
            setNotifications(data.notifications || []);
            setNextPageUrl(data.nextPageUrl);
        }
    }, [data]);

    useEffect(() => {
        if (!userId) return;

        window.Echo.private(`notifications.${userId}`)
            .notification((notification) => {
                setNotifications((prev) => [notification, ...prev]);
            });

        return () => {
            window.Echo.leave(`notifications.${userId}`);
        };
    }, [userId]);

    const handleDelete = async (notificationId) => {
        try {
            const response = await notificationActions.deleteNotification(notificationId);
            setNotifications((prev) => prev.filter((notification) => notification.id !== notificationId));
            toast.success(response.message || 'Сповіщення успішно видалено.');
        } catch (err) {
            toast.error(err.message || 'Не вдалося видалити сповіщення.');
        }
    };

    const [open, setOpen] = React.useState(false);
    const handleOpen = async () => {
        setOpen(true);
        if (unreadCount > 0) {
            try {
                await notificationActions.markAllAsRead();
                setNotifications((prev) =>
                    prev.map((n) => ({
                        ...n,
                        read_at: n.read_at || new Date().toISOString(),
                    }))
                );
            } catch (error) {
                console.error('Помилка при позначенні сповіщень:', error);
            }
        }
    };
    const handleClose = () => setOpen(false);

    const loadMore = async () => {
        if (!nextPageUrl) return;

        try {
            const response = await window.axios.get(nextPageUrl);
            setNotifications((prev) => [...prev, ...response.data.data]);
            setNextPageUrl(response.data.next_page_url);
        } catch (error) {
            console.error('Помилка при завантаженні наступної сторінки:', error);
        }
    };

    const unreadCount = notifications.filter((n) => !n.read_at).length;

    return (
        <>
            <IconButton
                onClick={handleOpen}
                sx={{
                    color: '#ffffff',
                    '&:hover': {
                        backgroundColor: 'rgba(156, 39, 176, 0.2)'
                    }
                }
                }
            >
                <Badge
                    badgeContent={unreadCount}
                    color="error"
                    sx={{
                        '& .MuiBadge-badge': {
                            fontSize: '0.75rem',
                            height: '18px',
                            minWidth: '18px',
                            borderRadius: '9px',
                            padding: '0 4px',
                            transition: 'transform 0.3s',
                            transform: unreadCount > 0 ? 'scale(1)' : 'scale(0)',
                            top: '-5px',
                            right: '-3px',
                        }
                    }}
                >
                    <Notifications sx={{fontSize: {xs: '24px', sm: '28px'}}}/>
                </Badge>
            </IconButton>

            <NotificationsModal
                open={open}
                onClose={handleClose}
                notifications={notifications}
                loadMore={loadMore}
                hasMore={!!nextPageUrl}
                isLoading={isLoading}
                isError={isError}
                error={error}
                onDelete={handleDelete}
            />
        </>
    );
};

export default NotificationsBell;
