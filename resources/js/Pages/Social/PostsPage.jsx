import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useInfiniteQuery, useQuery } from 'react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Box,
    Container,
    Grid,
    Typography,
    CircularProgress,
    Skeleton,
    Divider,
    IconButton,
    Paper,
    Button,
    Drawer,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import {
    KeyboardArrowUp,
    FilterList,
    Whatshot,
    PostAdd,
    SentimentDissatisfied,
} from '@mui/icons-material';
import {Link} from 'react-router-dom';
import PostCard from '@/Components/Social/PostCard.jsx';
import PostsFilter from '@/Components/Social/PostsFilter.jsx';
import { postActions } from '@/api/actions';
import InlinePostCard from '@/Components/Social/InlinePostCard.jsx';

const fetchPosts = async ({ pageParam = null, query = '' }) => {
    const response = pageParam
        ? await window.axios.get(pageParam)
        : await postActions.getPosts(query);

    return {
        posts: response.data.data.map((post) => ({
            id: post.id,
            title: post.title,
            content: post.content,
            user: {
                id: post.user?.id,
                username: post.user?.username || 'Anonymous',
                avatar: post.user?.avatar || `https://i.pravatar.cc/150?img=${post.user?.id || 0}`,
            },
            attachments: post.attachments || [],
            likes_count: post.likes_count || 0,
            comments_count: post.comments_count || 0,
            views_count: post.views_count || 0,
            created_at: post.created_at,
            slug: post.slug,
            tags: post.tags ? post.tags.map((tag) => tag.name) : [],
            visibility: post.visibility || 'public',
            comments_enabled: post.comments_enabled ?? true,
            user_liked: post.user_liked || false,
            like_id: post.like_id || null
        })),
        nextCursor: response.data.next_cursor,
        nextPageUrl: response.data.next_page_url,
        hasMore: !!response.data.next_page_url,
        totalPosts: response.data.data.length,
    };
};

const fetchTopPosts = async () => {
    const response = await postActions.getPosts('sort=-comments_count&perPage=10&filter[visibility]=public');
    return {
        posts: response.data.data.map((post) => ({
            id: post.id,
            title: post.title,
            slug: post.slug,
            tags: post.tags || [],
            likes_count: post.likes_count || 0,
            comments_count: post.comments_count || 0,
            attachments: post.attachments || [],
        })),
        totalPosts: response.data.data.length,
    };
};

const EmptyPostsPlaceholder = () => (
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
                marginBottom: 3,
            }}
        >
            <PostAdd sx={{ fontSize: 60, color: '#9c27b0', mb: 2, opacity: 0.8 }} />
            <Typography variant="h5" sx={{ mb: 2, color: '#ffffff', fontWeight: 500 }}>
                Постів не знайдено
            </Typography>
            <Typography
                variant="body1"
                sx={{ color: '#b0b0b0', mb: 3, maxWidth: '400px', margin: '0 auto' }}
            >
                Тут виглядає тихо. Будьте першим, хто поділиться чимось із спільнотою!
            </Typography>
            <Button
                variant="contained"
                startIcon={<PostAdd />}
                component={Link}
                to="/posts/create"
                sx={{
                    bgcolor: '#9c27b0',
                    marginTop: '16px',
                    '&:hover': {
                        bgcolor: '#7b1fa2',
                        boxShadow: '0 0 10px rgba(156, 39, 176, 0.5)',
                    },
                }}
            >
                Створити перший пост
            </Button>
        </Paper>
    </motion.div>
);

const EmptyTopPostsPlaceholder = () => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
    >
        <Paper
            sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 2,
                p: 3,
                textAlign: 'center',
                border: '1px dashed rgba(156, 39, 176, 0.3)',
            }}
        >
            <SentimentDissatisfied
                sx={{ fontSize: 40, color: '#9c27b0', mb: 1, opacity: 0.7 }}
            />
            <Typography variant="body1" sx={{ color: '#b0b0b0', fontStyle: 'italic' }}>
                Поки що немає популярних публікацій
            </Typography>
            <Typography variant="caption" sx={{ color: '#b0b0b0', display: 'block', mt: 1 }}>
                Популярні публікації з'являтимуться тут
            </Typography>
        </Paper>
    </motion.div>
);

const PostsPage = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'lg'));
    const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
    const isLargeScreen = useMediaQuery(theme.breakpoints.up('md'));
    const [query, setQuery] = useState('sort=-created_at&perPage=10');
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const observer = useRef();
    const loadingRef = useRef(false);

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
        error,
    } = useInfiniteQuery(
        ['posts', query],
        ({ pageParam }) => fetchPosts({ pageParam, query }),
        {
            getNextPageParam: (lastPage) => lastPage.nextPageUrl || undefined,
            refetchOnWindowFocus: false,
            staleTime: 0,
            keepPreviousData: true,
        }
    );

    const {
        data: topPostsData,
        isLoading: isTopPostsLoading,
        isError: isTopPostsError,
        error: topPostsError,
    } = useQuery('topPosts', fetchTopPosts, {
        staleTime: 1000 * 60,
    });

    const lastPostRef = useCallback(
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

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    const handleApplyFilters = (queryString) => {
        setQuery(queryString || 'sort=-created_at');
        scrollToTop();
    };

    useEffect(() => {
        const handleScroll = () => {
            if (window.pageYOffset > 300) {
                setShowScrollTop(true);
            } else {
                setShowScrollTop(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const posts = data?.pages?.flatMap((page) => page.posts) || [];
    const totalPosts = data?.pages?.reduce((sum, page) => sum + (page.totalPosts || 0), 0) || 0;
    const topPosts = topPostsData?.posts || [];
    const totalTopPosts = topPostsData?.totalPosts || 0;

    const toggleFilters = () => {
        setShowFilters(!showFilters);
    };

    const FilterButton = () => (
        <Button
            startIcon={<FilterList />}
            onClick={toggleFilters}
            sx={{
                mb: 2,
                ml: 1,
                color: '#e0e0e0',
                border: '1px solid rgba(156, 39, 176, 0.5)',
                '&:hover': {
                    backgroundColor: 'rgba(156, 39, 176, 0.1)',
                    boxShadow: '0 0 10px rgba(156, 39, 176, 0.3)',
                },
            }}
        >
            Filters
        </Button>
    );

    const TopPostsSidebar = () => (
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
                    p: 2,
                    border: '1px solid rgba(156, 39, 176, 0.2)',
                    background: 'rgba(10, 10, 15, 0.7)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                    minWidth: 250,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Whatshot sx={{ mr: 1, color: '#ff4081' }} />
                    <Typography variant="h6" sx={{ color: '#ffffff' }}>
                        Топ пости
                    </Typography>
                </Box>
                <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.12)', mb: 2 }} />

                {isTopPostsLoading ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Box key={`top-skeleton-${i}`} sx={{ display: 'flex' }}>
                                <Skeleton
                                    variant="rectangular"
                                    width={60}
                                    height={60}
                                    sx={{
                                        borderRadius: 1,
                                        mr: 2,
                                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                                    }}
                                />
                                <Box sx={{ flexGrow: 1 }}>
                                    <Skeleton
                                        width="80%"
                                        height={20}
                                        sx={{ mb: 1, bgcolor: 'rgba(255, 255, 255, 0.1)' }}
                                    />
                                    <Skeleton
                                        width="60%"
                                        height={16}
                                        sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)' }}
                                    />
                                </Box>
                            </Box>
                        ))}
                    </Box>
                ) : isTopPostsError ? (
                    <Typography color="error" variant="body2">
                        Error loading top posts: {topPostsError.message}
                    </Typography>
                ) : totalTopPosts === 0 ? (
                    <EmptyTopPostsPlaceholder />
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {topPosts?.map((post) => (
                            <InlinePostCard key={post.id} post={post} />
                        ))}
                    </Box>
                )}
            </Paper>
        </Box>
    );

    return (
        <Box
            sx={{
                minHeight: '100vh',
                color: '#e0e0e0',
                pt: 2,
                pb: 8,
            }}
        >
            <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
                {isMobile && <FilterButton />}

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
                            px: 2,
                            pt: 2,
                            pb: 4,
                        },
                    }}
                >
                    <PostsFilter
                        isMobile={isMobile}
                        onClose={toggleFilters}
                        onApplyFilters={handleApplyFilters}
                    />
                </Drawer>

                <Grid container spacing={3}>
                    {/* Left sidebar - Filters */}
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
                                transition={{ duration: 0.3 }}
                            >
                                <Box
                                    sx={{
                                        maxHeight: 'calc(100vh - 40px)',
                                        overflowY: 'auto',
                                    }}
                                >
                                    <PostsFilter onApplyFilters={handleApplyFilters} />
                                </Box>
                            </motion.div>
                        </Grid>
                    )}

                    {/* Main content - Posts */}
                    <Grid
                        item
                        xs={12}
                        md={isMobile ? 12 : isTablet ? 7 : isDesktop ? 6 : 12}
                    >
                        {isLoading && (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
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
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                <Skeleton
                                                    variant="circular"
                                                    width={40}
                                                    height={40}
                                                    sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)' }}
                                                />
                                                <Box sx={{ ml: 2, flexGrow: 1 }}>
                                                    <Skeleton
                                                        width="60%"
                                                        height={20}
                                                        sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)' }}
                                                    />
                                                    <Skeleton
                                                        width="40%"
                                                        height={16}
                                                        sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)' }}
                                                    />
                                                </Box>
                                            </Box>
                                            <Skeleton
                                                width="90%"
                                                height={24}
                                                sx={{ mb: 1, bgcolor: 'rgba(255, 255, 255, 0.1)' }}
                                            />
                                            <Skeleton
                                                width="80%"
                                                height={18}
                                                sx={{ mb: 2, bgcolor: 'rgba(255, 255, 255, 0.1)' }}
                                            />
                                            <Skeleton
                                                variant="rectangular"
                                                width="100%"
                                                height={300}
                                                sx={{
                                                    borderRadius: 1,
                                                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                                                }}
                                            />
                                            <Box sx={{ display: 'flex', mt: 2 }}>
                                                <Skeleton
                                                    width={80}
                                                    height={36}
                                                    sx={{
                                                        mr: 1,
                                                        borderRadius: 18,
                                                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                                                    }}
                                                />
                                                <Skeleton
                                                    width={80}
                                                    height={36}
                                                    sx={{
                                                        mr: 1,
                                                        borderRadius: 18,
                                                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                                                    }}
                                                />
                                                <Skeleton
                                                    width={80}
                                                    height={36}
                                                    sx={{
                                                        borderRadius: 18,
                                                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                                                    }}
                                                />
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
                                        p: 3,
                                        textAlign: 'center',
                                        border: '1px solid rgba(156, 39, 176, 0.2)',
                                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                                    }}
                                >
                                    <Typography variant="h6" color="error" sx={{ mb: 2 }}>
                                        Error loading posts
                                    </Typography>
                                    <Typography variant="body2" sx={{ mb: 2, color: '#e0e0e0' }}>
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
                                        }}
                                        onClick={() => window.location.reload()}
                                    >
                                        Retry
                                    </Button>
                                </Paper>
                            </motion.div>
                        )}

                        {!isLoading && !isError && totalPosts === 0 ? (
                            <EmptyPostsPlaceholder />
                        ) : (
                            <AnimatePresence>
                                {posts.map((post, index) => (
                                    <motion.div
                                        key={post.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        ref={index === posts.length - 1 ? lastPostRef : null}
                                    >
                                        <Box sx={{ mb: 3 }}>
                                            <PostCard
                                                post={post}
                                            />
                                        </Box>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
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
                    </Grid>

                    {/* Right sidebar - Top Posts */}
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
                                <TopPostsSidebar />
                            </motion.div>
                        </Grid>
                    )}
                </Grid>
            </Container>

            {/* Action buttons (Scroll to top and Create post) */}
            <Box
                sx={{
                    position: 'fixed',
                    bottom: 24,
                    right: 24,
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
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
                                    width: 48,
                                    height: 48,
                                }}
                            >
                                <KeyboardArrowUp />
                            </IconButton>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {isLargeScreen ? (
                        <Button
                            component={Link}
                            to="/posts/create"
                            variant="contained"
                            startIcon={<PostAdd sx={{ fontSize: 24 }} />}
                            sx={{
                                position: 'relative',
                                background:
                                    'linear-gradient(135deg, rgba(74, 20, 140, 0.9), rgba(40, 26, 100, 0.9))',
                                backdropFilter: 'blur(10px)',
                                color: '#ffffff',
                                fontWeight: 600,
                                px: 3,
                                py: 1.5,
                                mb: 0.2,
                                borderRadius: '24px',
                                textTransform: 'none',
                                fontSize: '0.9rem',
                                minWidth: '180px',
                                overflow: 'hidden',
                                '&:hover': {
                                    background:
                                        'linear-gradient(135deg, rgba(106, 27, 154, 1), rgba(61, 40, 143, 1))',
                                    boxShadow: '0 0 12px rgba(74, 20, 140, 0.5)',
                                    '&::before': {
                                        opacity: 1,
                                    },
                                },
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    borderRadius: '24px',
                                    padding: '1px',
                                    background:
                                        'linear-gradient(135deg, rgba(106, 27, 154, 0.5), rgba(61, 40, 143, 0.5))',
                                    WebkitMask:
                                        'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                                    WebkitMaskComposite: 'xor',
                                    maskComposite: 'exclude',
                                    opacity: 0.3,
                                    transition: 'opacity 0.3s',
                                },
                                transition: 'all 0.3s ease',
                            }}
                        >
                            Створити пост
                        </Button>
                    ) : (
                        <IconButton
                            component={Link}
                            to="/posts/create"
                            sx={{
                                position: 'relative',
                                background:
                                    'linear-gradient(135deg, rgba(74, 20, 140, 0.9), rgba(40, 26, 100, 0.9))',
                                backdropFilter: 'blur(10px)',
                                color: '#ffffff',
                                width: 52,
                                height: 52,
                                borderRadius: '14px',
                                overflow: 'hidden',
                                '&:hover': {
                                    background:
                                        'linear-gradient(135deg, rgba(106, 27, 154, 1), rgba(61, 40, 143, 1))',
                                    boxShadow: '0 0 12px rgba(74, 20, 140, 0.5)',
                                    '&::before': {
                                        opacity: 1,
                                    },
                                },
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    borderRadius: '14px',
                                    padding: '1px',
                                    background:
                                        'linear-gradient(135deg, rgba(106, 27, 154, 0.5), rgba(61, 40, 143, 0.5))',
                                    WebkitMask:
                                        'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                                    WebkitMaskComposite: 'xor',
                                    maskComposite: 'exclude',
                                    opacity: 0.3,
                                    transition: 'opacity 0.3s',
                                },
                                transition: 'all 0.3s ease',
                            }}
                        >
                            <PostAdd sx={{ fontSize: 28 }} />
                        </IconButton>
                    )}
                </motion.div>
            </Box>
        </Box>
    );
};

export default PostsPage;
