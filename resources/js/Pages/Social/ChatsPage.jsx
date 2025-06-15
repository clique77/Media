import React, { useCallback, useRef, useState, useEffect, memo } from 'react';
import {
    Box,
    Typography,
    Skeleton,
    useMediaQuery,
    useTheme,
    Container,
    CircularProgress,
    TextField,
    InputAdornment,
    Button,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useInfiniteQuery } from 'react-query';
import { Forum, Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { chatActions } from '@/api/actions';
import ChatCard from '@/Components/Social/ChatCard.jsx';

// Custom debounce hook
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

// Separate StarryBackground component
const StarryBackground = memo(() => {
    // Generate particle properties once on mount
    const particles = useRef(
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

// Ensure StarryBackground doesn't re-render unnecessarily
StarryBackground.displayName = 'StarryBackground';

const SkeletonChatCard = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                p: { xs: 1, sm: 2 },
                backgroundColor: 'rgba(10, 10, 15, 0.7)',
                borderRadius: 2,
                border: '1px solid rgba(156, 39, 176, 0.2)',
                mb: 1,
            }}
        >
            <Skeleton
                variant="circular"
                width={isMobile ? 40 : 48}
                height={isMobile ? 40 : 48}
                sx={{ mr: { xs: 1, sm: 2 }, bgcolor: 'rgba(255, 255, 255, 0.1)' }}
            />
            <Box sx={{ flexGrow: 1 }}>
                <Skeleton
                    variant="text"
                    width="60%"
                    height={isMobile ? 20 : 24}
                    sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)' }}
                />
                <Skeleton
                    variant="text"
                    width="80%"
                    height={isMobile ? 16 : 20}
                    sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)' }}
                />
            </Box>
            <Skeleton
                variant="text"
                width={isMobile ? 60 : 80}
                height={isMobile ? 16 : 20}
                sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)' }}
            />
        </Box>
    );
};

const EmptyChatsPlaceholder = ({ isError = false, error }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Box
            sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)',
                color: '#e0e0e0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                p: 3,
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.7)),
                    url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C27B0' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    opacity: 0.3,
                    zIndex: 0,
                },
            }}
        >
            <Box
                sx={{
                    position: 'relative',
                    zIndex: 1,
                    maxWidth: { xs: '100%', sm: '90%', md: '800px' },
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    mt: { xs: 14, sm: 18 },
                }}
            >
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6 }}
                >
                    <Forum
                        sx={{
                            fontSize: isMobile ? 100 : 150,
                            color: '#9c27b0',
                            mb: 3,
                            opacity: 0.9,
                        }}
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <Typography
                        variant={isMobile ? 'h3' : 'h2'}
                        sx={{
                            fontWeight: 700,
                            color: '#ffffff',
                            mb: 2,
                            lineHeight: 1.2,
                        }}
                    >
                        {isError ? 'Ой, щось пішло не так!' : 'Розпочніть розмову!'}
                    </Typography>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <Typography
                        variant={isMobile ? 'body1' : 'h6'}
                        sx={{
                            color: '#b0b0b0',
                            mb: 4,
                            maxWidth: '600px',
                            lineHeight: 1.6,
                        }}
                    >
                        {isError ? (
                            <>
                                Не вдалося завантажити чати.<br />
                                Спробуйте ще раз пізніше.
                            </>
                        ) : (
                            <>
                                Схоже, у вас ще немає чатів.<br />
                                Напишіть комусь першим і почніть спілкування!
                            </>
                        )}
                    </Typography>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}
                >
                    <Button
                        component={Link}
                        to="/users"
                        variant="contained"
                        sx={{
                            bgcolor: '#9c27b0',
                            color: '#ffffff',
                            fontWeight: 600,
                            px: 4,
                            py: 1.5,
                            borderRadius: '8px',
                            textTransform: 'none',
                            fontSize: isMobile ? '0.875rem' : '1rem',
                            minWidth: '200px',
                            '&:hover': {
                                bgcolor: '#7b1fa2',
                                boxShadow: '0 0 15px rgba(156, 39, 176, 0.5)',
                            },
                        }}
                    >
                        Знайти друзів
                    </Button>

                    <Button
                        component={Link}
                        to="/posts"
                        variant="outlined"
                        sx={{
                            borderColor: 'rgba(156, 39, 176, 0.5)',
                            color: '#e0e0e0',
                            fontWeight: 600,
                            px: 4,
                            py: 1.5,
                            borderRadius: '8px',
                            textTransform: 'none',
                            fontSize: isMobile ? '0.875rem' : '1rem',
                            minWidth: '200px',
                            '&:hover': {
                                borderColor: '#9c27b0',
                                backgroundColor: 'rgba(156, 39, 176, 0.1)',
                            },
                        }}
                    >
                        До постів
                    </Button>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                >
                    <Typography
                        variant="State"
                        sx={{
                            display: 'block',
                            mt: 4,
                            color: 'rgba(176, 176, 176, 0.5)',
                            fontFamily: 'monospace',
                        }}
                    >
                        {isError ? `// Помилка: ${error?.message || 'невідома'}` : '// Чатів: 0'}
                    </Typography>
                </motion.div>
            </Box>

            <StarryBackground />
        </Box>
    );
};

const fetchChats = async ({ pageParam = null, queryKey }) => {
    const [, username] = queryKey;
    const params = username ? { 'filter[userTwo.username]': username } : {};

    const response = pageParam
        ? await window.axios.get(pageParam)
        : await chatActions.getChats(params);

    return {
        chats: response.data.data,
        nextCursor: response.data.next_cursor,
        nextPageUrl: response.data.next_page_url,
        hasMore: !!response.data.next_page_url,
        totalChats: response.data.data.length,
    };
};

const ChatsPage = () => {
    const observer = useRef();
    const loadingRef = useRef(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isFetching,
        isError,
        error,
    } = useInfiniteQuery(
        ['chats', debouncedSearchTerm],
        fetchChats,
        {
            getNextPageParam: (lastPage) => lastPage.nextPageUrl || undefined,
            refetchOnWindowFocus: false,
            staleTime: 0,
            retry: 2,
        }
    );

    const lastChatRef = useCallback(
        (node) => {
            if (isFetchingNextPage || loadingRef.current) return;
            if (observer.current) observer.current.disconnect();

            observer.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasNextPage) {
                    loadingRef.current = true;
                    fetchNextPage().finally(() => {
                        loadingRef.current = false;
                    });
                }
            });

            if (node) observer.current.observe(node);
        },
        [isFetchingNextPage, hasNextPage, fetchNextPage]
    );

    const chats = data?.pages?.flatMap((page) => page.chats) || [];

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleResetFilter = () => {
        setSearchTerm('');
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                color: '#e0e0e0',
                bgcolor: 'transparent',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            <StarryBackground />
            <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3 } }}>
                {/* Search Input */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Box
                        sx={{
                            maxWidth: { xs: '100%', sm: 600 },
                            mx: 'auto',
                            mb: 2,
                            display: 'flex',
                            justifyContent: 'flex-end',
                        }}
                    >
                        <TextField
                            value={searchTerm}
                            onChange={handleSearchChange}
                            placeholder="Пошук за користувачем..."
                            variant="outlined"
                            size="small"
                            sx={{
                                width: 250,
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: 'rgba(10, 10, 15, 0.7)',
                                    color: '#e0e0e0',
                                    borderRadius: '8px',
                                    '& fieldset': {
                                        borderColor: 'rgba(156, 39, 176, 0.5)',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#9c27b0',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#9c27b0',
                                    },
                                },
                                '& .MuiInputBase-input': {
                                    fontSize: isMobile ? '0.75rem' : '0.8rem',
                                    padding: '6px 10px',
                                },
                                '& .MuiInputLabel-root': {
                                    color: '#b0b0b0',
                                    fontSize: isMobile ? '0.75rem' : '0.8rem',
                                },
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ color: '#9c27b0', fontSize: isMobile ? 18 : 20 }} />
                                    </InputAdornment>
                                ),
                                endAdornment: searchTerm && (
                                    <InputAdornment position="end">
                                        <ClearIcon
                                            sx={{
                                                color: '#b0b0b0',
                                                cursor: 'pointer',
                                                fontSize: isMobile ? 18 : 20,
                                                '&:hover': { color: '#9c27b0' },
                                            }}
                                            onClick={handleResetFilter}
                                        />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Box>
                </motion.div>

                {isFetching ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1,
                                maxWidth: { xs: '100%', sm: 600 },
                                mx: 'auto',
                            }}
                        >
                            {[...Array(4)].map((_, index) => (
                                <SkeletonChatCard key={index} />
                            ))}
                        </Box>
                    </motion.div>
                ) : isError ? (
                    <EmptyChatsPlaceholder isError={isError} error={error} />
                ) : chats.length === 0 ? (
                    searchTerm ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Box
                                sx={{
                                    maxWidth: { xs: '100%', sm: 600 },
                                    mx: 'auto',
                                    textAlign: 'center',
                                    py: 3,
                                }}
                            >
                                <Typography
                                    variant={isMobile ? 'body1' : 'h6'}
                                    sx={{
                                        color: '#b0b0b0',
                                        fontWeight: 500,
                                        lineHeight: 1.6,
                                    }}
                                >
                                    Чатів не знайдено
                                </Typography>
                            </Box>
                        </motion.div>
                    ) : (
                        <EmptyChatsPlaceholder isError={isError} error={error} />
                    )
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1,
                                maxWidth: { xs: '100%', sm: 600 },
                                mx: 'auto',
                            }}
                        >
                            {chats.map((chat, index) => (
                                <div
                                    key={chat.id}
                                    ref={index === chats.length - 1 ? lastChatRef : null}
                                >
                                    <ChatCard chat={chat} />
                                </div>
                            ))}
                        </Box>
                    </motion.div>
                )}
                {isFetchingNextPage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 6 }}>
                            <CircularProgress
                                size={40}
                                thickness={4}
                                sx={{ color: '#9c27b0' }}
                            />
                        </Box>
                    </motion.div>
                )}
            </Container>
        </Box>
    );
};

export default ChatsPage;
