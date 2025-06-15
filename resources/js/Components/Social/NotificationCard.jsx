import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { motion } from 'framer-motion';
import {Link, useNavigate} from 'react-router-dom';
import {Favorite, Comment, Notifications, Delete, GroupAdd, GroupRemove } from '@mui/icons-material';
import { formatDate } from '@/utils/formatDate.js';
import parse from 'html-react-parser';

const NotificationCard = ({ notification, onDelete, onClose }) => {
    const navigate = useNavigate();

    const handleDelete = (e) => {
        e.stopPropagation();
        onDelete(notification.id);
    };

    const iconMap = {
        like: Favorite,
        comment: Comment,
        friend_removed: GroupRemove,
        friend_add: GroupAdd,
    };

    const getIcon = (type) => {
        const IconComponent = iconMap[type] || Notifications;
        return <IconComponent sx={{ fontSize: 20, color: '#ff4081' }} />;
    };

    const renderMessage = () => {
        const { message } = notification.data;
        try {
            return (
                <Typography
                    sx={{
                        color: '#ffffff',
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        fontWeight: 400,
                        lineHeight: 1.5,
                    }}
                >
                    {parse(message, {
                        replace: (domNode) => {
                            if (domNode.name === 'a' && domNode.attribs?.href) {
                                const href = domNode.attribs.href;
                                const children = domNode.children[0]?.data || '';
                                const isUserLink = href.includes('/users/');
                                const isPostLink = href.includes('/posts/');
                                return (
                                    <motion.span
                                        whileHover={{
                                            scale: 1.05,
                                            textShadow: `0 0 6px rgba(${
                                                isUserLink ? '255, 64, 129' : isPostLink ? '233, 30, 99' : '156, 39, 176'
                                            }, 0.6)`,
                                        }}
                                    >
                                        <Link
                                            to={href}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onClose();
                                            }}
                                            sx={{
                                                color: isUserLink
                                                    ? '#ff4081'
                                                    : isPostLink
                                                        ? '#e91e63'
                                                        : '#9c27b0',
                                                textDecoration: 'none !important',
                                                textDecorationSkipInk: 'none',
                                                fontWeight: 600,
                                                '&:hover': {
                                                    color: isUserLink
                                                        ? '#ff80ab'
                                                        : isPostLink
                                                            ? '#ff6090'
                                                            : '#ba68c8',
                                                    textDecoration: 'none !important',
                                                },
                                                '&:focus': {
                                                    textDecoration: 'none !important',
                                                },
                                            }}
                                            style={{ textDecoration: 'none' }}
                                        >
                                            {children}
                                        </Link>
                                    </motion.span>
                                );
                            }
                        },
                    })}
                </Typography>
            );
        } catch (error) {
            return (
                <Typography
                    sx={{
                        color: '#ffffff',
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        fontWeight: 400,
                        lineHeight: 1.5,
                    }}
                >
                    {message}
                </Typography>
            );
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    bgcolor: 'rgba(20, 20, 25, 0.85)',
                    mb: 1,
                    borderRadius: '12px',
                    border: '1px solid rgba(156, 39, 176, 0.2)',
                    backdropFilter: 'blur(16px)',
                    boxShadow: '0 0 8px rgba(156, 39, 176, 0.2)',
                    transition: 'all 0.3s ease',
                    py: { xs: 1, sm: 1.5 },
                    px: { xs: 1.5, sm: 2 },
                    '&:hover': {
                        bgcolor: 'rgba(25, 25, 30, 0.85)',
                        boxShadow: '0 0 12px rgba(156, 39, 176, 0.3)',
                        transform: 'translateY(-1px)',
                        cursor: 'pointer',
                    },
                    minHeight: { xs: 64, sm: 72 },
                }}
            >
                {/* Іконка */}
                <motion.div
                    initial={{ scale: 1 }}
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    whileHover={{ scale: 1.05 }}
                >
                    <Box
                        sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            bgcolor: 'rgba(255, 64, 129, 0.15)',
                            border: '1px solid rgba(255, 64, 129, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: { xs: 1, sm: 1.5 },
                        }}
                    >
                        {getIcon(notification.data?.type)}
                    </Box>
                </motion.div>

                {/* Контент */}
                <Box sx={{ flex: 1 }}>
                    {renderMessage()}
                    <Typography
                        sx={{
                            color: '#b0b0b0',
                            fontSize: { xs: '0.625rem', sm: '0.75rem' },
                            mt: 0.25,
                        }}
                    >
                        {formatDate(notification.created_at)}
                    </Typography>
                </Box>

                {/* Кнопка видалення */}
                <IconButton
                    onClick={handleDelete}
                    sx={{
                        color: '#ff4081',
                        padding: { xs: '6px', sm: '8px' },
                        '&:hover': {
                            backgroundColor: 'rgba(255, 64, 129, 0.2)',
                            transform: 'scale(1.1)',
                        },
                    }}
                >
                    <Delete sx={{ fontSize: { xs: 20, sm: 22 } }} />
                </IconButton>
            </Box>
        </motion.div>
    );
};

export default NotificationCard;
