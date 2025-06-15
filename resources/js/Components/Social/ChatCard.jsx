import React from 'react';
import {
    Box,
    Typography,
    Avatar,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import {AttachFile, Image, Videocam} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/Components/Auth/AuthProvider.jsx';
import {formatDate} from "@/utils/formatDate.js";

const ChatCard = ({ chat }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const interlocutor = chat?.user_one?.id === user?.id ? chat?.user_two : chat?.user_one;
    const displayName = interlocutor?.first_name && interlocutor?.last_name
        ? `${interlocutor.first_name} ${interlocutor.last_name}`
        : interlocutor?.username || 'Невідомий користувач';

    const lastMessage = chat.last_message;
    let messagePreview = 'Немає повідомлень';
    let messageIcon = null;

    if (lastMessage) {
        if (lastMessage && lastMessage !== '<p><br></p>' && !lastMessage.includes('attachments/')) {
            messagePreview = lastMessage.replace(/<[^>]+>/g, '').trim();
        } else if (lastMessage && typeof lastMessage === 'string' && lastMessage.length > 0) {
            const extension = lastMessage.toLowerCase().split('.').pop();
            const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
            const videoExtensions = ['mp4', 'mov', 'avi', 'mkv', 'webm'];

            if (imageExtensions.includes(extension)) {
                messagePreview = 'Зображення';
                messageIcon = <Image sx={{ fontSize: isMobile ? 16 : 18, color: '#9c27b0' }} />;
            } else if (videoExtensions.includes(extension)) {
                messagePreview = 'Відео';
                messageIcon = <Videocam sx={{ fontSize: isMobile ? 16 : 18, color: '#9c27b0' }} />;
            } else {
                messagePreview = 'Файл';
                messageIcon = <AttachFile sx={{ fontSize: isMobile ? 16 : 18, color: '#9c27b0' }} />;
            }
        }
    }

    const handleClick = () => {
        navigate(`/chats/${chat.id}`);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: { xs: 1, sm: 2 },
                    backgroundColor: 'rgba(10, 10, 15, 0.7)',
                    borderRadius: 2,
                    border: '1px solid rgba(156, 39, 176, 0.2)',
                    mb: 1,
                    cursor: 'pointer',
                    transition: 'background-color 0.3s ease, border-color 0.3s ease',
                    '&:hover': {
                        backgroundColor: 'rgba(20, 20, 30, 0.8)',
                        borderColor: '#9c27b0',
                    },
                }}
                onClick={handleClick}
            >
                <Avatar
                    src={interlocutor?.avatar}
                    alt={displayName}
                    sx={{
                        width: isMobile ? 40 : 48,
                        height: isMobile ? 40 : 48,
                        mr: { xs: 1, sm: 2 },
                    }}
                />
                <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                    <Typography
                        variant="subtitle2"
                        sx={{
                            color: '#ffffff',
                            fontWeight: 500,
                            fontSize: isMobile ? '0.875rem' : '1rem',
                        }}
                    >
                        {displayName}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {messageIcon}
                        <Typography
                            variant="body2"
                            sx={{
                                color: '#b0b0b0',
                                fontSize: isMobile ? '0.75rem' : '0.875rem',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                            }}
                        >
                            {messagePreview}
                        </Typography>
                    </Box>
                </Box>
                <Typography
                    variant="caption"
                    sx={{
                        color: '#b0b0b0',
                        fontSize: isMobile ? '0.625rem' : '0.75rem',
                        minWidth: isMobile ? 60 : 80,
                        textAlign: 'right',
                    }}
                >
                    {lastMessage ? formatDate(chat.last_message_at) : ''}
                </Typography>
            </Box>
        </motion.div>
    );
};

export default ChatCard;
