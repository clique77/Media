import React from 'react';
import { Box, Avatar, Typography, Paper, Chip, Tooltip, Divider } from '@mui/material';
import { motion } from 'framer-motion';
import {
    Person,
    Email,
    Cake,
    Public,
    Wc,
    Lock,
    CheckCircle,
    Cancel,
    MoreVert
} from '@mui/icons-material';
import { useIsUserOnline } from "@/Components/Social/OnlineUsersProvider.jsx";
import { useNavigate } from "react-router-dom";

const UserCard = ({ user, sx, onClick }) => {
    const isOnline = useIsUserOnline(user.id);
    const navigate = useNavigate();

    if (!user) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
            >
                <Paper
                    sx={{
                        p: 3,
                        backgroundColor: 'rgba(10, 10, 15, 0.8)',
                        borderRadius: 3,
                        border: '1px solid rgba(156, 39, 176, 0.3)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                        maxWidth: 600,
                        mx: 'auto',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: '0 12px 40px rgba(156, 39, 176, 0.3)'
                        },
                        ...sx,
                    }}
                    onClick={onClick}
                >
                    <Typography variant="h6" sx={{ color: '#ff4081', fontWeight: 500 }}>
                        Користувача не знайдено
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#b0b0b0', mt: 1 }}>
                        Спробуйте інші параметри пошуку
                    </Typography>
                </Paper>
            </motion.div>
        );
    }

    const fullName = user.first_name || user.last_name
        ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
        : user.username;

    const getRoleColor = () => {
        switch(user.role) {
            case 'admin': return { bg: '#d32f2f', text: '#ffffff' };
            case 'moderator': return { bg: '#1976d2', text: '#ffffff' };
            default: return { bg: '#4caf50', text: '#ffffff' };
        }
    };

    const getGenderIcon = () => {
        switch(user.gender) {
            case 'male': return <Wc sx={{ color: '#2196f3', fontSize: 18 }} />;
            case 'female': return <Wc sx={{ color: '#e91e63', fontSize: 18 }} />;
            default: return <Wc sx={{ color: '#9c27b0', fontSize: 18 }} />;
        }
    };

    const formatLastSeen = () => {
        if (isOnline) return 'Онлайн';
        if (!user.last_seen_at) return 'Невідомо';

        const lastSeen = new Date(user.last_seen_at);
        const now = new Date();
        const diffHours = Math.floor((now - lastSeen) / (1000 * 60 * 60));

        if (diffHours < 1) return 'Був(ла) нещодавно';
        if (diffHours < 24) return `Був(ла) ${diffHours} год. тому`;
        return `Був(ла) ${Math.floor(diffHours / 24)} дн. тому`;
    };

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else {
            navigate(`/users/${user.username}`);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
        >
            <Paper
                sx={{
                    p: 2,
                    backgroundColor: 'rgba(10, 10, 15, 0.8)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 3,
                    border: '1px solid rgba(156, 39, 176, 0.3)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 2,
                    maxWidth: 600,
                    mx: 'auto',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 12px 40px rgba(156, 39, 176, 0.3)',
                        borderColor: 'rgba(156, 39, 176, 0.5)'
                    },
                    ...sx,
                }}
                onClick={handleClick}
            >
                <Avatar
                    src={user.avatar}
                    alt={user.username}
                    sx={{
                        width: 64,
                        height: 64,
                        border: '2px solid #9c27b0',
                        boxShadow: '0 0 20px rgba(156, 39, 176, 0.4)',
                        '&:hover': {
                            filter: 'brightness(1.2)',
                            transition: 'filter 0.2s ease',
                        },
                    }}
                />

                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography
                            variant="h6"
                            sx={{
                                color: '#ffffff',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {fullName}
                            {user.is_blocked && (
                                <Tooltip title="Заблокований">
                                    <Lock sx={{ color: '#f44336', fontSize: 18 }} />
                                </Tooltip>
                            )}
                        </Typography>

                        <Chip
                            label={`@${user.username}`}
                            size="small"
                            sx={{
                                bgcolor: 'rgba(156, 39, 176, 0.2)',
                                color: '#e0e0e0',
                                fontSize: '0.75rem',
                                height: 20,
                                ml: 'auto',
                                maxWidth: '150px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}
                        />
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Chip
                            label={user.role === 'admin' ? 'Адмін' : user.role === 'moderator' ? 'Модератор' : 'Користувач'}
                            size="small"
                            sx={{
                                bgcolor: getRoleColor().bg,
                                color: getRoleColor().text,
                                fontSize: '0.7rem',
                                height: 20,
                                fontWeight: 600
                            }}
                        />

                        {isOnline ? (
                            <Chip
                                icon={<CheckCircle sx={{ fontSize: '16px !important' }} />}
                                label="Онлайн"
                                size="small"
                                sx={{
                                    bgcolor: 'rgba(76, 175, 80, 0.2)',
                                    color: '#4caf50',
                                    fontSize: '0.7rem',
                                    height: 20
                                }}
                            />
                        ) : (
                            <Tooltip title={formatLastSeen()}>
                                <Chip
                                    icon={<Cancel sx={{ fontSize: '16px !important' }} />}
                                    label="Офлайн"
                                    size="small"
                                    sx={{
                                        bgcolor: 'rgba(244, 67, 54, 0.1)',
                                        color: '#f44336',
                                        fontSize: '0.7rem',
                                        height: 20
                                    }}
                                />
                            </Tooltip>
                        )}
                    </Box>

                    {user.biography ? (
                        <Typography
                            variant="body2"
                            dangerouslySetInnerHTML={{ __html: user.biography }}
                            sx={{
                                color: '#e0e0e0',
                                fontStyle: 'italic',
                                mb: 1,
                                lineHeight: 1.4,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                '& p': {
                                    marginBottom: 0,
                                    marginTop: 0,
                                }
                            }}
                        />
                    ) : (
                        <Typography
                            variant="body2"
                            sx={{
                                color: 'rgba(255, 255, 255, 0.5)',
                                fontStyle: 'italic',
                                mb: 1
                            }}
                        >
                            Користувач ще не додав інформацію про себе
                        </Typography>
                    )}

                    <Divider sx={{ my: 1, bgcolor: 'rgba(156, 39, 176, 0.2)' }} />

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {user.country && (
                            <Tooltip title="Країна">
                                <Chip
                                    icon={<Public sx={{ fontSize: '16px !important' }} />}
                                    label={user.country}
                                    size="small"
                                    sx={{
                                        bgcolor: 'rgba(30, 136, 229, 0.1)',
                                        color: '#e0e0e0',
                                        fontSize: '0.7rem',
                                        maxWidth: '150px',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}
                                />
                            </Tooltip>
                        )}

                        {user.gender && (
                            <Tooltip title="Стать">
                                <Chip
                                    icon={getGenderIcon()}
                                    label={user.gender === 'male' ? 'Чоловік' : user.gender === 'female' ? 'Жінка' : 'Інше'}
                                    size="small"
                                    sx={{
                                        bgcolor: 'rgba(156, 39, 176, 0.1)',
                                        color: '#e0e0e0',
                                        fontSize: '0.7rem',
                                        maxWidth: '150px',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}
                                />
                            </Tooltip>
                        )}

                        {user.birthday && (
                            <Tooltip title="Дата народження">
                                <Chip
                                    icon={<Cake sx={{ fontSize: '16px !important' }} />}
                                    label={new Date(user.birthday).toLocaleDateString()}
                                    size="small"
                                    sx={{
                                        bgcolor: 'rgba(255, 152, 0, 0.1)',
                                        color: '#e0e0e0',
                                        fontSize: '0.7rem',
                                        maxWidth: '150px',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}
                                />
                            </Tooltip>
                        )}

                        {user.email && (
                            <Tooltip title="Email">
                                <Chip
                                    icon={<Email sx={{ fontSize: '16px !important' }} />}
                                    label={user.email}
                                    size="small"
                                    sx={{
                                        bgcolor: 'rgba(0, 150, 136, 0.1)',
                                        color: '#e0e0e0',
                                        fontSize: '0.7rem',
                                        maxWidth: '150px',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}
                                />
                            </Tooltip>
                        )}
                    </Box>
                </Box>
            </Paper>
        </motion.div>
    );
};

export default UserCard;
