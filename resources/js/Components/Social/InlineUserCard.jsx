import React from 'react';
import { Box, Avatar, Typography, Paper, Chip, Tooltip } from '@mui/material';
import { motion } from 'framer-motion';
import { Favorite, Comment, Person } from '@mui/icons-material';
import { formatNumber } from '@/utils/formatNumber';
import {useNavigate} from "react-router-dom";

const InlineUserCard = ({ user, sx, onClick }) => {
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
                        p: 1,
                        backgroundColor: 'rgba(10, 10, 15, 0.8)',
                        borderRadius: 2,
                        border: '1px solid rgba(156, 39, 176, 0.3)',
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
                        width: '100%',
                        boxSizing: 'border-box',
                        mx: 'auto',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            transform: 'translateY(-3px)',
                            boxShadow: '0 8px 24px rgba(156, 39, 176, 0.3)',
                            borderColor: 'rgba(156, 39, 176, 0.5)',
                        },
                        ...sx,
                    }}
                    onClick={onClick}
                >
                    <Typography variant="body2" sx={{ color: '#ff4081', fontWeight: 500 }}>
                        Користувача не знайдено
                    </Typography>
                </Paper>
            </motion.div>
        );
    }

    const fullName = user.first_name || user.last_name
        ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
        : user.username;

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
                    p: 1,
                    backgroundColor: 'rgba(10, 10, 15, 0.8)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 2,
                    border: '1px solid rgba(156, 39, 176, 0.3)',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    flexWrap: 'wrap',
                    width: '100%',
                    boxSizing: 'border-box',
                    mx: 'auto',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: '0 8px 24px rgba(156, 39, 176, 0.3)',
                        borderColor: 'rgba(156, 39, 176, 0.5)',
                    },
                    ...sx,
                }}
                onClick={handleClick}
            >
                <Avatar
                    src={user.avatar}
                    alt={user.username}
                    sx={{
                        width: 36,
                        height: 36,
                        border: '1px solid #9c27b0',
                        boxShadow: '0 0 10px rgba(156, 39, 176, 0.3)',
                        flexShrink: 0,
                        '&:hover': {
                            filter: 'brightness(1.2)',
                            transition: 'filter 0.2s ease',
                        },
                    }}
                />

                <Box sx={{ flexGrow: 1, minWidth: 0, maxWidth: { xs: 'calc(100% - 90px)', sm: 'calc(100% - 120px)' } }}>
                    <Typography
                        variant="body2"
                        sx={{
                            color: '#ffffff',
                            fontWeight: 500,
                            lineHeight: 1.2,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {fullName}
                    </Typography>
                    <Tooltip title="Ім'я користувача">
                        <Chip
                            icon={<Person sx={{ fontSize: '12px !important', color: '#9c27b0' }} />}
                            label={`@${user.username}`}
                            size="small"
                            sx={{
                                bgcolor: 'rgba(156, 39, 176, 0.1)',
                                color: '#e0e0e0',
                                fontSize: '0.65rem',
                                height: 18,
                                mt: 0.5,
                                maxWidth: '100%',
                                '& .MuiChip-label': {
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    pr: 0.5,
                                },
                                '& .MuiChip-icon': {
                                    ml: 0.5,
                                },
                            }}
                        />
                    </Tooltip>
                </Box>

                <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 1, flexWrap: 'wrap' }}>
                    <Tooltip title="Поставлені лайки">
                        <Chip
                            icon={<Favorite sx={{ fontSize: '12px !important', color: '#e91e63' }} />}
                            label={formatNumber(user.likes_given)}
                            size="small"
                            sx={{
                                bgcolor: 'rgba(156, 39, 176, 0.1)',
                                color: '#e0e0e0',
                                fontSize: '0.65rem',
                                height: 18,
                                maxWidth: 80,
                                '& .MuiChip-label': {
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    pr: 0.5,
                                },
                                '& .MuiChip-icon': {
                                    ml: 0.5,
                                },
                            }}
                        />
                    </Tooltip>
                    <Tooltip title="Залишені коментарі">
                        <Chip
                            icon={<Comment sx={{ fontSize: '12px !important', color: '#2196f3' }} />}
                            label={formatNumber(user.comments_given)}
                            size="small"
                            sx={{
                                bgcolor: 'rgba(156, 39, 176, 0.1)',
                                color: '#e0e0e0',
                                fontSize: '0.65rem',
                                height: 18,
                                maxWidth: 80,
                                '& .MuiChip-label': {
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    pr: 0.5,
                                },
                                '& .MuiChip-icon': {
                                    ml: 0.5,
                                },
                            }}
                        />
                    </Tooltip>
                </Box>
            </Paper>
        </motion.div>
    );
};

export default InlineUserCard;
