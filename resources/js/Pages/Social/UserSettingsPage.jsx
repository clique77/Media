import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Container,
    Divider,
    FormControl,
    Grid,
    MenuItem,
    Select,
    Snackbar,
    Switch,
    Tab,
    Tabs,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import {
    CheckCircle as CheckCircleIcon,
    Comment as CommentIcon,
    Group as GroupIcon,
    Lock as LockIcon,
    Message as MessageIcon,
    Notifications as NotificationsIcon,
    PersonAdd as PersonAddIcon,
    Reply as ReplyIcon,
    Settings as SettingsIcon,
    ThumbUp as ThumbUpIcon,
} from '@mui/icons-material';
import { useMutation, useQuery } from 'react-query';
import { useAuth } from "@/Components/Auth/AuthProvider.jsx";
import { settingActions } from '@/api/actions';

const UserSettingsPage = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
    const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));
    const { isAuthenticated } = useAuth();
    const [activeTab, setActiveTab] = useState(0);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const [notificationSettings, setNotificationSettings] = useState({
        friend_request: true,
        new_message: true,
        post_comment: true,
        post_like: true,
        comment_reply: true,
    });
    const [messagePrivacy, setMessagePrivacy] = useState('everyone');
    const [friendRequestPrivacy, setFriendRequestPrivacy] = useState('everyone');
    const [pendingChanges, setPendingChanges] = useState({});

    const { data: settings, isLoading, isError, error } = useQuery('userSettings', settingActions.getSettings, {
        enabled: isAuthenticated,
        staleTime: 1000 * 60 * 5,
        onSuccess: (response) => {
            const data = response.data;
            setNotificationSettings({
                friend_request: data.notifications_enabled?.friend_request ?? true,
                new_message: data.notifications_enabled?.new_message ?? true,
                post_comment: data.notifications_enabled?.post_comment ?? true,
                post_like: data.notifications_enabled?.post_like ?? true,
                comment_reply: data.notifications_enabled?.comment_reply ?? true,
            });
            setMessagePrivacy(data.message_privacy || 'everyone');
            setFriendRequestPrivacy(data.friend_request_privacy || 'everyone');
        },
    });

    const updateNotificationMutation = useMutation(
        ({ type, enabled }) => settingActions.updateNotification({ type, enabled }),
        {
            onSuccess: () => {
                setSnackbarMessage('Налаштування сповіщень збережено!');
                setSnackbarOpen(true);
            },
            onError: () => {
                setSnackbarMessage('Помилка збереження налаштувань сповіщень');
                setSnackbarOpen(true);
            },
        }
    );

    const updateMessagePrivacyMutation = useMutation(
        (privacy) => settingActions.updateMessagePrivacy({ privacy }),
        {
            onSuccess: () => {
                setSnackbarMessage('Налаштування конфіденційності повідомлень збережено!');
                setSnackbarOpen(true);
            },
            onError: () => {
                setSnackbarMessage('Помилка збереження налаштувань конфіденційності');
                setSnackbarOpen(true);
            },
        }
    );

    const updateFriendRequestPrivacyMutation = useMutation(
        (privacy) => settingActions.updateFriendRequestPrivacy({ privacy }),
        {
            onSuccess: () => {
                setSnackbarMessage('Налаштування конфіденційності запитів на дружбу збережено!');
                setSnackbarOpen(true);
            },
            onError: () => {
                setSnackbarMessage('Помилка збереження налаштувань конфіденційності');
                setSnackbarOpen(true);
            },
        }
    );

    const handleNotificationChange = (type) => (event) => {
        const enabled = event.target.checked;
        setNotificationSettings((prev) => ({ ...prev, [type]: enabled }));
        setPendingChanges((prev) => ({ ...prev, [`notification_${type}`]: { type, enabled } }));
    };

    const handleMessagePrivacyChange = (event) => {
        const privacy = event.target.value;
        setMessagePrivacy(privacy);
        setPendingChanges((prev) => ({ ...prev, message_privacy: privacy }));
    };

    const handleFriendRequestPrivacyChange = (event) => {
        const privacy = event.target.value;
        setFriendRequestPrivacy(privacy);
        setPendingChanges((prev) => ({ ...prev, friend_request_privacy: privacy }));
    };

    const handleApplyChanges = async () => {
        try {
            const promises = Object.entries(pendingChanges).map(([key, value]) => {
                if (key.startsWith('notification_')) {
                    return updateNotificationMutation.mutateAsync(value);
                } else if (key === 'message_privacy') {
                    return updateMessagePrivacyMutation.mutateAsync(value);
                } else if (key === 'friend_request_privacy') {
                    return updateFriendRequestPrivacyMutation.mutateAsync(value);
                }
                return Promise.resolve();
            });

            await Promise.all(promises);
            setPendingChanges({});
        } catch (err) {
            setSnackbarMessage('Помилка збереження налаштувань');
            setSnackbarOpen(true);
        }
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    if (!isAuthenticated) {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ color: '#ffffff', mb: 2 }}>
                        Будь ласка, увійдіть, щоб отримати доступ до налаштувань
                    </Typography>
                    <Button
                        variant="contained"
                        href="/login"
                        sx={{
                            bgcolor: '#9c27b0',
                            '&:hover': {
                                bgcolor: '#7b1fa2',
                                boxShadow: '0 0 10px rgba(156, 39, 176, 0.5)',
                            },
                        }}
                    >
                        Перейти до входу
                    </Button>
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', pt: 4, pb: 8, position: 'relative', overflow: 'hidden' }}>
            {/* Starry background animation */}
            {[...Array(20)].map((_, i) => (
                <motion.div
                    key={i}
                    style={{
                        position: 'absolute',
                        backgroundColor: '#fff',
                        borderRadius: '50%',
                        width: `${Math.random() * 3 + 1}px`,
                        height: `${Math.random() * 3 + 1}px`,
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        opacity: 0,
                    }}
                    animate={{
                        opacity: [0, 0.8, 0],
                        scale: [1, 1.5, 1],
                    }}
                    transition={{
                        duration: Math.random() * 3 + 2,
                        repeat: Infinity,
                        repeatType: 'reverse',
                        delay: Math.random() * 5,
                    }}
                />
            ))}

            <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Typography
                        variant={isMobile ? 'h5' : 'h3'}
                        sx={{
                            mb: 4,
                            fontWeight: 700,
                            color: '#ffffff',
                            textAlign: 'center',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: { xs: 0.5, md: 1 },
                            position: 'relative',
                            '&:after': {
                                content: '""',
                                position: 'absolute',
                                bottom: -8,
                                width: '120px',
                                height: '3px',
                                bgcolor: '#9c27b0',
                                borderRadius: '2px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                            },
                        }}
                    >
                        <SettingsIcon sx={{ color: '#9c27b0', fontSize: isMobile ? 28 : 40 }} />
                        Налаштування користувача
                    </Typography>

                    {isLoading && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                            <CircularProgress sx={{ color: '#9c27b0' }} />
                        </Box>
                    )}

                    {isError && (
                        <Alert severity="error" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
                            Помилка завантаження налаштувань: {error.message}
                        </Alert>
                    )}

                    {!isLoading && !isError && (
                        <Grid container spacing={4}>
                            {/* Left Sidebar - Tabs */}
                            <Grid item xs={12} md={3} lg={2} sx={{ ml: { md: 2 } }}>
                                <Tabs
                                    orientation={isMobile ? 'horizontal' : 'vertical'}
                                    value={activeTab}
                                    onChange={handleTabChange}
                                    sx={{
                                        '& .MuiTab-root': {
                                            color: '#e0e0e0',
                                            textAlign: 'left',
                                            fontWeight: 500,
                                            textTransform: 'none',
                                            borderRadius: 2,
                                            mb: 1,
                                            py: 1.5,
                                            justifyContent: 'flex-start',
                                            transition: 'all 0.3s',
                                            '&:hover': {
                                                bgcolor: 'rgba(156, 39, 176, 0.1)',
                                                color: '#9c27b0',
                                            },
                                            '&.Mui-selected': {
                                                color: '#9c27b0',
                                                bgcolor: 'rgba(156, 39, 176, 0.2)',
                                                boxShadow: '0 0 10px rgba(156, 39, 176, 0.3)',
                                            },
                                        },
                                        '& .MuiTabs-indicator': {
                                            backgroundColor: '#9c27b0',
                                            width: 4,
                                        },
                                    }}
                                >
                                    <Tab
                                        label="Сповіщення"
                                        icon={<NotificationsIcon />}
                                        iconPosition="start"
                                        sx={{ minHeight: 48 }}
                                    />
                                    <Tab
                                        label="Конфіденційність"
                                        icon={<LockIcon />}
                                        iconPosition="start"
                                        sx={{ minHeight: 48 }}
                                    />
                                </Tabs>
                            </Grid>

                            {/* Main Content */}
                            <Grid item xs={12} md={9} lg={8.5} sx={{ ml: { md: 4 } }}>
                                {activeTab === 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Typography
                                            variant={isMobile ? 'h6' : 'h5'}
                                            sx={{
                                                color: '#ffffff',
                                                mb: 3,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1,
                                            }}
                                        >
                                            <NotificationsIcon sx={{ color: '#9c27b0', fontSize: 28 }} />
                                            Налаштування сповіщень
                                        </Typography>
                                        <Divider sx={{ bgcolor: 'rgba(156, 39, 176, 0.2)', mb: 4 }} />

                                        {/* Notification settings in pyramid layout */}
                                        <Box sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            maxWidth: { xs: '100%', md: 840 },
                                            mx: 'auto',
                                            gap: { xs: 1, md: 2 },
                                            justifyContent: { xs: 'center' },
                                        }}>
                                            {/* First row - 2 items */}
                                            <Box sx={{
                                                display: 'flex',
                                                flexDirection: { xs: 'column', sm: 'row' },
                                                gap: { xs: 1, md: 2 },
                                                width: '100%',
                                                justifyContent: { xs: 'center', sm: 'center' },
                                                mx: { xs: 'auto' },
                                            }}>
                                                {['friend_request', 'new_message'].map((type) => {
                                                    const item = {
                                                        friend_request: {
                                                            label: 'Сповіщення про запити на дружбу',
                                                            icon: <PersonAddIcon />,
                                                        },
                                                        new_message: {
                                                            label: 'Сповіщення про нові повідомлення',
                                                            icon: <MessageIcon />,
                                                        },
                                                    }[type];

                                                    return (
                                                        <Box
                                                            key={type}
                                                            sx={{
                                                                width: { xs: '100%', sm: '50%' },
                                                                maxWidth: 400,
                                                                bgcolor: 'rgba(255, 255, 255, 0.05)',
                                                                p: { xs: 1.5, md: 2 },
                                                                borderRadius: 3,
                                                                border: '1px solid rgba(156, 39, 176, 0.3)',
                                                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                                                                transition: 'all 0.3s',
                                                                '&:hover': {
                                                                    bgcolor: 'rgba(156, 39, 176, 0.15)',
                                                                    boxShadow: '0 6px 16px rgba(156, 39, 176, 0.4)',
                                                                    transform: 'translateY(-2px)',
                                                                },
                                                                boxSizing: 'border-box',
                                                                mx: { xs: 'auto', sm: 0 },
                                                            }}
                                                        >
                                                            <Box sx={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'space-between',
                                                            }}>
                                                                <Box sx={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: 1.5,
                                                                }}>
                                                                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                                                        {React.cloneElement(item.icon, {
                                                                            sx: { color: '#9c27b0', fontSize: 24 },
                                                                        })}
                                                                    </motion.div>
                                                                    <Typography sx={{
                                                                        color: '#e0e0e0',
                                                                        fontWeight: 500,
                                                                        fontSize: { xs: '0.9rem', md: '0.95rem' },
                                                                    }}>
                                                                        {item.label}
                                                                    </Typography>
                                                                </Box>
                                                                <Switch
                                                                    checked={notificationSettings[type]}
                                                                    onChange={handleNotificationChange(type)}
                                                                    sx={{
                                                                        '& .MuiSwitch-switchBase.Mui-checked': {
                                                                            color: '#9c27b0',
                                                                        },
                                                                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                                                            backgroundColor: '#9c27b0',
                                                                        },
                                                                    }}
                                                                />
                                                            </Box>
                                                        </Box>
                                                    );
                                                })}
                                            </Box>

                                            {/* Second row - 2 items */}
                                            <Box sx={{
                                                display: 'flex',
                                                flexDirection: { xs: 'column', sm: 'row' },
                                                gap: { xs: 1, md: 2 },
                                                width: '100%',
                                                justifyContent: { xs: 'center', sm: 'center' },
                                                mx: { xs: 'auto' },
                                            }}>
                                                {['post_comment', 'post_like'].map((type) => {
                                                    const item = {
                                                        post_comment: {
                                                            label: 'Сповіщення про коментарі до постів',
                                                            icon: <CommentIcon />,
                                                        },
                                                        post_like: {
                                                            label: 'Сповіщення про вподобання постів',
                                                            icon: <ThumbUpIcon />,
                                                        },
                                                    }[type];

                                                    return (
                                                        <Box
                                                            key={type}
                                                            sx={{
                                                                width: { xs: '100%', sm: '50%' },
                                                                maxWidth: 400,
                                                                bgcolor: 'rgba(255, 255, 255, 0.05)',
                                                                p: { xs: 1.5, md: 2 },
                                                                borderRadius: 3,
                                                                border: '1px solid rgba(156, 39, 176, 0.3)',
                                                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                                                                transition: 'all 0.3s',
                                                                '&:hover': {
                                                                    bgcolor: 'rgba(156, 39, 176, 0.15)',
                                                                    boxShadow: '0 6px 16px rgba(156, 39, 176, 0.4)',
                                                                    transform: 'translateY(-2px)',
                                                                },
                                                                boxSizing: 'border-box',
                                                                mx: { xs: 'auto', sm: 0 },
                                                            }}
                                                        >
                                                            <Box sx={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'space-between',
                                                            }}>
                                                                <Box sx={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: 1.5,
                                                                }}>
                                                                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                                                        {React.cloneElement(item.icon, {
                                                                            sx: { color: '#9c27b0', fontSize: 24 },
                                                                        })}
                                                                    </motion.div>
                                                                    <Typography sx={{
                                                                        color: '#e0e0e0',
                                                                        fontWeight: 500,
                                                                        fontSize: { xs: '0.9rem', md: '0.95rem' },
                                                                    }}>
                                                                        {item.label}
                                                                    </Typography>
                                                                </Box>
                                                                <Switch
                                                                    checked={notificationSettings[type]}
                                                                    onChange={handleNotificationChange(type)}
                                                                    sx={{
                                                                        '& .MuiSwitch-switchBase.Mui-checked': {
                                                                            color: '#9c27b0',
                                                                        },
                                                                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                                                            backgroundColor: '#9c27b0',
                                                                        },
                                                                    }}
                                                                />
                                                            </Box>
                                                        </Box>
                                                    );
                                                })}
                                            </Box>

                                            {/* Third row - 1 item */}
                                            <Box sx={{
                                                width: '100%',
                                                maxWidth: 400,
                                                bgcolor: 'rgba(255, 255, 255, 0.05)',
                                                p: { xs: 1.5, md: 2 },
                                                borderRadius: 3,
                                                border: '1px solid rgba(156, 39, 176, 0.3)',
                                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                                                transition: 'all 0.3s',
                                                '&:hover': {
                                                    bgcolor: 'rgba(156, 39, 176, 0.15)',
                                                    boxShadow: '0 6px 16px rgba(156, 39, 176, 0.4)',
                                                    transform: 'translateY(-2px)',
                                                },
                                                mx: 'auto',
                                            }}>
                                                <Box sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                                            <ReplyIcon sx={{ color: '#9c27b0', fontSize: 24 }} />
                                                        </motion.div>
                                                        <Typography sx={{
                                                            color: '#e0e0e0',
                                                            fontWeight: 500,
                                                            fontSize: { xs: '0.9rem', md: '0.95rem' },
                                                        }}>
                                                            Сповіщення про відповіді на коментарі
                                                        </Typography>
                                                    </Box>
                                                    <Switch
                                                        checked={notificationSettings.comment_reply}
                                                        onChange={handleNotificationChange('comment_reply')}
                                                        sx={{
                                                            '& .MuiSwitch-switchBase.Mui-checked': {
                                                                color: '#9c27b0',
                                                            },
                                                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                                                backgroundColor: '#9c27b0',
                                                            },
                                                        }}
                                                    />
                                                </Box>
                                            </Box>
                                        </Box>
                                    </motion.div>
                                )}

                                {activeTab === 1 && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Typography
                                            variant={isMobile ? 'h6' : 'h5'}
                                            sx={{
                                                color: '#ffffff',
                                                mb: 3,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1,
                                            }}
                                        >
                                            <LockIcon sx={{ color: '#9c27b0', fontSize: 28 }} />
                                            Налаштування конфіденційності
                                        </Typography>
                                        <Divider sx={{ bgcolor: 'rgba(156, 39, 176, 0.2)', mb: 4 }} />
                                        <Box sx={{
                                            maxWidth: { xs: '100%', md: 400 },
                                            mx: 'auto',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: { xs: 3, md: 4 },
                                        }}>
                                            <FormControl fullWidth>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                                                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                                        <MessageIcon sx={{ color: '#9c27b0', fontSize: 24 }} />
                                                    </motion.div>
                                                    <Typography sx={{
                                                        color: '#e0e0e0',
                                                        fontWeight: 500,
                                                        fontSize: { xs: '0.9rem', md: '1rem' },
                                                    }}>
                                                        Конфіденційність повідомлень
                                                    </Typography>
                                                </Box>
                                                <Select
                                                    value={messagePrivacy}
                                                    onChange={handleMessagePrivacyChange}
                                                    sx={{
                                                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                                        color: '#e0e0e0',
                                                        '& .MuiSelect-icon': { color: '#9c27b0' },
                                                        '& .MuiOutlinedInput-notchedOutline': {
                                                            borderColor: 'rgba(156, 39, 176, 0.3)',
                                                        },
                                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                                            borderColor: '#9c27b0',
                                                        },
                                                        borderRadius: 3,
                                                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                                                        transition: 'all 0.3s',
                                                        '&:hover': {
                                                            boxShadow: '0 4px 12px rgba(156, 39, 176, 0.4)',
                                                        },
                                                    }}
                                                >
                                                    <MenuItem value="everyone">Усі</MenuItem>
                                                    <MenuItem value="friends_only">Тільки друзі</MenuItem>
                                                    <MenuItem value="no_one">Ніхто</MenuItem>
                                                </Select>
                                            </FormControl>
                                            <FormControl fullWidth>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                                                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                                        <GroupIcon sx={{ color: '#9c27b0', fontSize: 24 }} />
                                                    </motion.div>
                                                    <Typography sx={{
                                                        color: '#e0e0e0',
                                                        fontWeight: 500,
                                                        fontSize: { xs: '0.9rem', md: '1rem' },
                                                    }}>
                                                        Конфіденційність запитів на дружбу
                                                    </Typography>
                                                </Box>
                                                <Select
                                                    value={friendRequestPrivacy}
                                                    onChange={handleFriendRequestPrivacyChange}
                                                    sx={{
                                                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                                        color: '#e0e0e0',
                                                        '& .MuiSelect-icon': { color: '#9c27b0' },
                                                        '& .MuiOutlinedInput-notchedOutline': {
                                                            borderColor: 'rgba(156, 39, 176, 0.3)',
                                                        },
                                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                                            borderColor: '#9c27b0',
                                                        },
                                                        borderRadius: 3,
                                                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                                                        transition: 'all 0.3s',
                                                        '&:hover': {
                                                            boxShadow: '0 4px 12px rgba(156, 39, 176, 0.4)',
                                                        },
                                                    }}
                                                >
                                                    <MenuItem value="everyone">Усі</MenuItem>
                                                    <MenuItem value="no_one">Ніхто</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Box>
                                    </motion.div>
                                )}

                                {/* Apply Changes Button - Centered at the bottom */}
                                <Box
                                    sx={{
                                        mt: { xs: 3, md: 4 },
                                        display: 'flex',
                                        justifyContent: 'center',
                                        width: '100%',
                                    }}
                                >
                                    <Button
                                        variant="contained"
                                        startIcon={<CheckCircleIcon />}
                                        onClick={handleApplyChanges}
                                        disabled={Object.keys(pendingChanges).length === 0}
                                        sx={{
                                            bgcolor: '#9c27b0',
                                            color: '#ffffff',
                                            fontWeight: 600,
                                            px: 4,
                                            py: 1.5,
                                            borderRadius: 3,
                                            textTransform: 'none',
                                            transition: 'all 0.3s',
                                            '&:hover': {
                                                bgcolor: '#7b1fa2',
                                                boxShadow: '0 0 15px rgba(156, 39, 176, 0.5)',
                                                transform: 'translateY(-2px)',
                                            },
                                            '&:disabled': {
                                                bgcolor: 'rgba(156, 39, 176, 0.3)',
                                                color: 'rgba(255, 255, 255, 0.5)',
                                            },
                                        }}
                                    >
                                        Застосувати зміни
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    )}
                </motion.div>

                {/* Snackbar for feedback */}
                <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={3000}
                    onClose={handleSnackbarClose}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                    <Alert
                        onClose={handleSnackbarClose}
                        severity={snackbarMessage.includes('Помилка') ? 'error' : 'success'}
                        sx={{
                            bgcolor: snackbarMessage.includes('Помилка') ? 'rgba(211, 47, 47, 0.9)' : 'rgba(76, 175, 80, 0.9)',
                            color: '#ffffff',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                        }}
                    >
                        {snackbarMessage}
                    </Alert>
                </Snackbar>
            </Container>
        </Box>
    );
};

export default UserSettingsPage;
