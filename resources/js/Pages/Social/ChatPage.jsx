import React, { memo } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import ChatComponent from '@/Components/Social/Chat.jsx';
import ErrorMessage from '@/Components/Social/ErrorMessage.jsx';
import { chatActions } from '@/api/actions';
import { useAuth } from '@/Components/Auth/AuthProvider.jsx';

// Constants for styling
const COLORS = {
    background: 'rgba(10, 10, 15, 0.98)',
    accent: '#9c27b0',
};

const SIZES = {
    padding: { xs: '0px', sm: '0px' },
    borderRadius: { xs: 0, sm: '12px' },
    navbarHeight: { xs: '56px', sm: '64px' },
};

// StarryBackground component
const StarryBackground = memo(() => {
    // Generate particle properties once on mount
    const particles = React.useRef(
        [...Array(20)].map(() => ({
            width: `${Math.random() * 3 + 1}px`,
            height: `${Math.random() * 3 + 1}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            duration: Math.random() * 3 + 2,
            delay: Math.random() * 5,
        }))
    ).current;

    return (
        <>
            {particles.map((particle, i) => (
                <motion.div
                    key={i}
                    style={{
                        position: 'absolute',
                        backgroundColor: '#fff',
                        borderRadius: '50%',
                        width: particle.width,
                        height: particle.height,
                        left: particle.left,
                        top: particle.top,
                        opacity: 0,
                        zIndex: -1, // Ensure particles are behind content
                    }}
                    animate={{
                        opacity: [0, 0.8, 0],
                        scale: [1, 1.5, 1],
                    }}
                    transition={{
                        duration: particle.duration,
                        repeat: Infinity,
                        repeatType: 'reverse',
                        delay: particle.delay,
                    }}
                />
            ))}
        </>
    );
});

StarryBackground.displayName = 'StarryBackground';

const ChatPage = () => {
    const { chatId } = useParams();
    const { user } = useAuth();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const navbarHeight = isMobile ? SIZES.navbarHeight.xs : SIZES.navbarHeight.sm;

    const {
        data: chatData,
        isLoading: isChatLoading,
        isError: isChatError,
        error: chatError,
    } = useQuery(
        ['chat', chatId],
        async () => {
            const response = await chatActions.getChat(chatId);
            return response.data;
        },
        {
            enabled: !!chatId,
            staleTime: 1000 * 60,
            retry: false,
            refetchOnWindowFocus: false,
            onError: () => {
                toast.error('Не вдалося завантажити дані чату');
            },
        }
    );

    if (isChatError) {
        const errorMessage = 'Ви не маєте доступу до цього чату. Перевірте правильність посилання або увійдіть до системи.';
        return <ErrorMessage message={errorMessage} isMobile={isMobile} />;
    }

    const chatUser = chatData
        ? chatData?.user_one_id === user?.id
            ? chatData?.user_two
            : chatData?.user_one
        : null;

    return (
        <Box
            sx={{
                height: `calc(100vh - ${navbarHeight})`,
                width: '100%',
                bgcolor: COLORS.background,
                backdropFilter: 'blur(10px)',
                position: 'relative',
                overflow: 'hidden', // Changed to hidden to contain particles
                display: 'flex',
                flexDirection: 'column',
                p: SIZES.padding,
                m: 0,
                boxSizing: 'border-box',
                minHeight: '-webkit-fill-available',
            }}
        >
            <StarryBackground />
            {/* Gradient Line (Top) */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '1px',
                    background: `linear-gradient(90deg, transparent, ${COLORS.accent}, transparent)`,
                    zIndex: 1,
                }}
            />
            {/* Gradient Line (Bottom) */}
            <Box
                sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '1px',
                    background: `linear-gradient(90deg, transparent, ${COLORS.accent}, transparent)`,
                    zIndex: 1,
                }}
            />
            {/* Chat Container */}
            <Box
                sx={{
                    width: { xs: '100%', md: '800px' },
                    height: '100%',
                    borderRadius: SIZES.borderRadius,
                    boxShadow: '0px 10px 25px rgba(0, 0, 0, 0.5)',
                    transition: 'all 0.3s ease',
                    alignSelf: 'center',
                    flexGrow: 1,
                    zIndex: 1,
                    '&:hover': {
                        boxShadow: '0px 15px 35px rgba(0, 0, 0, 0.6), 0 0 15px rgba(156, 39, 176, 0.3)',
                    },
                }}
            >
                <ChatComponent
                    chatUser={chatUser}
                    isLoading={isChatLoading}
                />
            </Box>
        </Box>
    );
};

export default ChatPage;
