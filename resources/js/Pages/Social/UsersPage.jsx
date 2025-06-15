import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Box,
    Container,
    Grid,
    CircularProgress,
    Paper,
    Button,
    Drawer,
    IconButton,
    useMediaQuery,
    useTheme,
    Skeleton,
    Typography,
} from '@mui/material';
import { FilterList, KeyboardArrowUp, PersonAdd } from '@mui/icons-material';
import { useInfiniteQuery, useQuery, useQueryClient } from 'react-query';
import UserCard from '@/Components/Social/UserCard.jsx';
import UsersFilter from '@/Components/Social/UsersFilter.jsx';
import { userActions } from '@/api/actions';
import InlineUserCard from "@/Components/Social/InlineUserCard.jsx";

const fetchUsers = async ({ pageParam = null, query = '' }) => {
    const response = pageParam
        ? await window.axios.get(pageParam)
        : await userActions.getUsers(query);

    return {
        users: response.data.data.map((user) => ({
            id: user.id,
            username: user.username || 'Anonymous',
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            avatar: user.avatar || `https://i.pravatar.cc/150?img=${user.id || 0}`,
            biography: user.biography || 'Користувач ще не додав біографію',
            country: user.country || '',
            role: user.role || 'user',
            is_online: user.is_online || false,
            last_seen_at: user.last_seen_at || '',
        })),
        nextCursor: response.data.next_cursor,
        nextPageUrl: response.data.next_page_url,
        hasMore: !!response.data.next_page_url,
        totalUsers: response.data.data.length,
    };
};

const fetchTopUsers = async () => {
    const response = await userActions.getTopUsers();
    return {
        users: response.data.data.map((user) => ({
            id: user.id,
            username: user.username || 'Anonymous',
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            avatar: user.avatar || `https://i.pravatar.cc/150?img=${user.id || 0}`,
            biography: user.biography || 'Користувач ще не додав біографію',
            country: user.country || '',
            is_online: user.is_online || false,
            last_seen_at: user.last_seen_at || '',
            comments_given: user.comments_given || 0,
            likes_given: user.likes_given || 0
        })),
        totalUsers: response.data.data.length,
    };
};

const EmptyUsersPlaceholder = () => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
    >
        <Paper
            sx={{
                backgroundColor: 'rgba(10, 10, 15, 0.7)',
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
                border: '1px solid rgba(156, 39, 176, 0.2)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                maxWidth: 600,
                mx: 'auto',
                my: 3,
            }}
        >
            <PersonAdd sx={{ fontSize: 80, color: '#9c27b0', mb: 2, opacity: 0.8 }} />
            <Typography variant="h4" sx={{ mb: 2, color: '#ffffff', fontWeight: 500 }}>
                Користувачів не знайдено
            </Typography>
            <Typography
                variant="body1"
                sx={{ color: '#b0b0b0', mb: 3, maxWidth: '500px', margin: '0 auto' }}
            >
                Здається, тут порожньо. Спробуйте змінити фільтри або запросіть друзів!
            </Typography>
        </Paper>
    </motion.div>
);

const TopUsersSidebar = () => {
    const { data: topUsers, isLoading } = useQuery('topUsers', fetchTopUsers, {
        staleTime: 1000 * 6,
    });

    return (
        <Box
            sx={{
                maxHeight: 'calc(100vh - 40px)',
                overflowY: 'auto',
            }}
        >
            <Paper
                sx={{
                    backdropFilter: 'blur(10px)',
                    borderRadius: 2,
                    p: 3,
                    border: '1px solid rgba(156, 39, 176, 0.2)',
                    background: 'rgba(10, 10, 15, 0.7)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                    minWidth: 250,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Typography
                        variant="h5"
                        sx={{
                            color: '#ffffff',
                            background: 'linear-gradient(45deg, #9c27b0, #ff4081)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        Топ активних користувачів
                    </Typography>
                </Box>
                {isLoading ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton
                                key={`top-skeleton-${i}`}
                                variant="rectangular"
                                width="100%"
                                height={80}
                                sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)' }}
                            />
                        ))}
                    </Box>
                ) : (topUsers?.users || []).length === 0 ? (
                    <Typography sx={{ color: '#b0b0b0', textAlign: 'center' }}>
                        Немає активних користувачів
                    </Typography>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {(topUsers?.users || []).map((user, index) => (
                            <motion.div
                                key={user.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                            >
                                <InlineUserCard
                                    user={user}
                                    sx={{
                                        maxWidth: '100%',
                                        p: 2,
                                        '& .MuiTypography-root': { fontSize: '1rem' },
                                    }}
                                />
                            </motion.div>
                        ))}
                    </Box>
                )}
            </Paper>
        </Box>
    );
};

// Головний компонент
const UsersPage = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md')); // ≤900px
    const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg')); // 900px-1200px
    const isDesktop = useMediaQuery(theme.breakpoints.up('lg')); // ≥1200px
    const [query, setQuery] = useState('sort=-created_at');
    const [showFilters, setShowFilters] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [showFilterButton, setShowFilterButton] = useState(isMobile);
    const observer = useRef();
    const loadingRef = useRef(false);
    const queryClient = useQueryClient();

    useEffect(() => {
        let timeout;
        if (isMobile) {
            timeout = setTimeout(() => {
                setShowFilterButton(true);
            }, 300); // Затримка 300ms (тривалість анімації колонки)
        } else {
            setShowFilterButton(false);
        }
        return () => clearTimeout(timeout);
    }, [isMobile]);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, []);

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
        error,
    } = useInfiniteQuery(
        ['users', query],
        ({ pageParam }) => fetchUsers({ pageParam, query }),
        {
            getNextPageParam: (lastPage) => lastPage.nextPageUrl || undefined,
            refetchOnWindowFocus: false,
            staleTime: 1000,
            keepPreviousData: false,
        }
    );

    const lastUserRef = useCallback(
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

    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.pageYOffset > 300);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleApplyFilters = (queryString) => {
        console.log('Applying filters with query:', queryString);
        queryClient.removeQueries(['users']);
        setQuery(queryString || 'sort=-created_at');
    };

    const toggleFilters = () => {
        setShowFilters(!showFilters);
    };

    const users = data?.pages?.flatMap((page) => page.users) || [];
    const totalUsers = data?.pages?.reduce((sum, page) => sum + (page.totalUsers || 0), 0) || 0;

    const FilterButton = () => (
        <Button
            startIcon={<FilterList />}
            onClick={toggleFilters}
            sx={{
                mb: 2,
                ml: 1,
                color: '#e0e0e0',
                border: '1px solid rgba(156, 39, 176, 0.5)',
                background: 'rgba(10, 10, 15, 0.7)',
                backdropFilter: 'blur(10px)',
                '&:hover': {
                    backgroundColor: 'rgba(156, 39, 176, 0.1)',
                    boxShadow: '0 0 10px rgba(156, 39, 176, 0.3)',
                },
                fontSize: '1rem',
                py: 1,
            }}
        >
            Фільтри
        </Button>
    );

    return (
        <Box
            sx={{
                minHeight: '100vh',
                color: '#e0e0e0',
                pt: 2,
                pb: 8,
                bgcolor: '#0a0a0f',
            }}
        >
            <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
                <AnimatePresence>
                    {isMobile && showFilterButton && !showFilters && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <FilterButton />
                        </motion.div>
                    )}
                </AnimatePresence>

                <Drawer
                    anchor="bottom"
                    open={showFilters && isMobile}
                    onClose={toggleFilters}
                    sx={{
                        '& .MuiDrawer-paper': {
                            backgroundColor: 'rgba(10, 10, 15, 0.9)',
                            borderTop: '1px solid rgba(156, 39, 176, 0.3)',
                            backdropFilter: 'blur(12px)',
                            borderRadius: '12px 12px 0 0',
                            px: 3,
                            pt: 3,
                            pb: 4,
                            maxHeight: '80vh',
                        }}
                    }
                >
                    <UsersFilter
                        isMobile={isMobile}
                        onClose={toggleFilters}
                        onApplyFilters={handleApplyFilters}
                    />
                </Drawer>

                <Grid container spacing={3}>
                    {/* Ліва колонка - Фільтри */}
                    {!isMobile && (
                        <Grid
                            item
                            xs={12}
                            md={3}
                            lg={2.5}
                            sx={{
                                position: 'sticky',
                                top: 20,
                                alignSelf: 'flex-start',
                                maxHeight: 'calc(100vh - 40px)',
                            }}
                        >
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Box
                                    sx={{
                                        maxHeight: 'calc(100vh - 40px)',
                                        overflowY: 'auto',
                                    }}
                                >
                                    <UsersFilter onApplyFilters={handleApplyFilters} />
                                </Box>
                            </motion.div>
                        </Grid>
                    )}

                    {/* Центральна колонка - Список користувачів */}
                    <Grid
                        item
                        xs={12}
                        md={isMobile ? 12 : isTablet ? 7 : isDesktop ? 6 : 12}
                        sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                    >
                        {isLoading && (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <motion.div
                                        key={`skeleton-${i}`}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                    >
                                        <Paper
                                            sx={{
                                                backgroundColor: 'rgba(10, 10, 15, 0.7)',
                                                borderRadius: 2,
                                                p: 2,
                                                border: '1px solid rgba(156, 39, 176, 0.2)',
                                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                                                maxWidth: 600,
                                                mx: 'auto',
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Skeleton
                                                    variant="circular"
                                                    width={56}
                                                    height={56}
                                                    sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)' }}
                                                />
                                                <Box sx={{ flexGrow: 1 }}>
                                                    <Skeleton
                                                        width="60%"
                                                        height={24}
                                                        sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)' }}
                                                    />
                                                    <Skeleton
                                                        width="80%"
                                                        height={16}
                                                        sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)', mt: 1 }}
                                                    />
                                                </Box>
                                            </Box>
                                        </Paper>
                                    </motion.div>
                                ))}
                            </Box>
                        )}

                        {isError && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <Paper
                                    sx={{
                                        backgroundColor: 'rgba(10, 10, 15, 0.7)',
                                        borderRadius: 2,
                                        p: 4,
                                        textAlign: 'center',
                                        border: '1px solid rgba(156, 39, 176, 0.2)',
                                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                                        maxWidth: 600,
                                        mx: 'auto',
                                    }}
                                >
                                    <Typography variant="h5" color="error" sx={{ mb: 2 }}>
                                        Помилка завантаження користувачів
                                    </Typography>
                                    <Typography variant="body1" sx={{ mb: 2, color: '#e0e0e0' }}>
                                        {error.message}
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        sx={{
                                            bgcolor: '#9c27b0',
                                            '&:hover': {
                                                bgcolor: '#7b1fa2',
                                                boxShadow: '0 0 10px rgba(156, 39, 176, 0.5)',
                                            },
                                            fontSize: '1rem',
                                            py: 1.5,
                                        }}
                                        onClick={() => window.location.reload()}
                                    >
                                        Спробувати знову
                                    </Button>
                                </Paper>
                            </motion.div>
                        )}

                        {!isLoading && !isError && totalUsers === 0 ? (
                            <EmptyUsersPlaceholder />
                        ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {users.map((user, index) => (
                                    <motion.div
                                        key={user.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        ref={index === users.length - 1 ? lastUserRef : null}
                                    >
                                        <UserCard user={user} />
                                    </motion.div>
                                ))}
                            </Box>
                        )}

                        {isFetchingNextPage && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 6 }}>
                                    <CircularProgress
                                        size={24}
                                        thickness={4}
                                        sx={{ color: '#9c27b0' }}
                                    />
                                </Box>
                            </motion.div>
                        )}
                    </Grid>

                    {/* Права колонка - Топ активних користувачів */}
                    {isDesktop && (
                        <Grid
                            item
                            lg={3.5}
                            sx={{
                                position: 'sticky',
                                top: 20,
                                alignSelf: 'flex-start',
                                maxHeight: 'calc(100vh - 40px)',
                            }}
                        >
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <TopUsersSidebar />
                            </motion.div>
                        </Grid>
                    )}
                </Grid>
            </Container>

            {/* Кнопка "Вгору" */}
            <Box
                sx={{
                    position: 'fixed',
                    bottom: 24,
                    right: 24,
                    zIndex: 1000,
                }}
            >
                <AnimatePresence>
                    {showScrollTop && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <IconButton
                                onClick={scrollToTop}
                                sx={{
                                    backgroundColor: 'rgba(156, 39, 176, 0.8)',
                                    color: 'white',
                                    '&:hover': {
                                        backgroundColor: 'rgba(156, 39, 176, 1)',
                                        boxShadow: '0 0 15px rgba(156, 39, 176, 0.5)',
                                    },
                                    width: 56,
                                    height: 56,
                                }}
                            >
                                <KeyboardArrowUp sx={{ fontSize: 32 }} />
                            </IconButton>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Box>
        </Box>
    );
};

export default UsersPage;
