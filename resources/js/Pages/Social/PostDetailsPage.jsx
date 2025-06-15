import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Box,
    Container,
    Grid,
    Typography,
    CircularProgress,
    Skeleton,
    Divider,
    Paper,
    useMediaQuery,
    useTheme,
    Chip,
    Button
} from '@mui/material';
import {
    Favorite,
    ChatBubbleOutline,
    SentimentDissatisfied,
    PostAdd
} from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import PostCard from '@/Components/Social/PostCard.jsx';
import { postActions } from '@/api/actions';
import InlinePostCard from "@/Components/Social/InlinePostCard.jsx";
import PostCommentsSection from "@/Components/Social/PostCommentsSection.jsx";
import ErrorMessage from "@/Components/Social/ErrorMessage.jsx";

const fetchPost = async (slug) => {
    const response = await postActions.getPost(slug);
    const post = response.data;
    return {
        id: post.data.id,
        title: post.data.title,
        content: post.data.content,
        user: {
            id: post.data.user?.id,
            username: post.data.user?.username || 'Anonymous',
            avatar: post.data.user?.avatar || `https://i.pravatar.cc/150?img=${post.data.user?.id || 0}`
        },
        attachments: post.data.attachments || [],
        likes_count: post.data.likes_count || 0,
        comments_count: post.data.comments_count || 0,
        views_count: post.data.views_count || 0,
        created_at: post.data.created_at,
        slug: post.data.slug,
        tags: post.data.tags ? post.data.tags.map(tag => tag.name) : [],
        visibility: post.data.visibility || 'public',
        comments_enabled: post.data.comments_enabled ?? true,
        user_liked: post.data.user_liked || false,
        like_id: post.data.like_id || null
    };
};

const fetchSimilarPosts = async (tags) => {
    const query = (tags.length > 0 ? `filter[tags]=${tags.join(',')}&perPage=5` : 'perPage=5') + '&filter[visibility]=public';
    const response = await postActions.getPosts(query);
    return {
        posts: response.data.data.map((post) => ({
            id: post.id,
            title: post.title,
            tags: post.tags ? post.tags.map(tag => tag) : [],
            likes_count: post.likes_count || 0,
            attachments: post.attachments || [],
            comments_count: post.comments_count || 0,
            slug: post.slug
        })),
        totalPosts: response.data.data.length
    };
};

const fetchUserPosts = async (username) => {
    const query = `filter[user.username]=${username}&perPage=5`;
    const response = await postActions.getPosts(query);
    return {
        posts: response.data.data.map((post) => ({
            id: post.id,
            title: post.title,
            tags: post.tags ? post.tags.map(tag => tag.name) : [],
            likes_count: post.likes_count || 0,
            comments_count: post.comments_count || 0,
            slug: post.slug
        })),
        totalPosts: response.data.data.length
    };
};

const EmptySimilarPostsPlaceholder = ({ message = 'Схожих постів немає' }) => (
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
                border: '1px dashed rgba(156, 39, 176, 0.3)'
            }}
        >
            <SentimentDissatisfied
                sx={{ fontSize: 40, color: '#9c27b0', mb: 1, opacity: 0.7 }}
            />
            <Typography variant="body1" sx={{ color: '#b0b0b0', fontStyle: 'italic' }}>
                {message}
            </Typography>
        </Paper>
    </motion.div>
);

const PostDetailsPage = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
    const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));
    const isMediumScreen = useMediaQuery(theme.breakpoints.between('md', 'lg'));
    const { identifier } = useParams();

    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: 'instant',
        });
    }, []);

    const {
        data: post,
        isLoading: isPostLoading,
        isError: isPostError,
        error: postError
    } = useQuery(['post', identifier], () => fetchPost(identifier), {
        staleTime: 0,
        retry: false,
        refetchOnWindowFocus: false
    });

    const {
        data: similarPostsData,
        isLoading: isSimilarPostsLoading,
        isError: isSimilarPostsError
    } = useQuery(['similarPosts', post?.tags], () => fetchSimilarPosts(post?.tags || []), {
        enabled: !!post,
        staleTime: 1000 * 60,
        refetchOnWindowFocus: false,
        retry: false
    });

    const {
        data: userPostsData,
        isLoading: isUserPostsLoading,
        isError: isUserPostsError
    } = useQuery(['userPosts', post?.user.id], () => fetchUserPosts(post?.user.username), {
        enabled: !!post,
        staleTime: 1000 * 60,
        retry: false
    });

    if (isPostError) {
        const errorMessage = postError.response?.data?.error || 'Цей пост приватний або у вас немає прав для перегляду';
        return <ErrorMessage message={errorMessage} isMobile={isMobile} />;
    }

    const similarPosts = similarPostsData?.posts || [];
    const totalSimilarPosts = similarPostsData?.totalPosts || 0;
    const userPosts = userPostsData?.posts.filter(p => p.id !== post?.id) || [];
    const totalUserPosts = userPosts.length;
    const SimilarPostsSidebar = () => (
        <Paper
            sx={{
                backdropFilter: 'blur(10px)',
                borderRadius: 2,
                p: 2,
                border: '1px solid rgba Voter(156, 39, 176, 0.2)',
                background: 'rgba(10, 10, 15, 0.7)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                position: 'sticky',
                top: 20,
                minWidth: { md: 280, lg: 300, xl: 320 }
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PostAdd sx={{ mr: 1, color: '#ff4081' }} />
                <Typography variant="h6" sx={{ color: '#ffffff' }}>
                    Схожі пости
                </Typography>
            </Box>
            <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.12)', mb: 2 }} />

            {isSimilarPostsLoading ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Box key={`similar-skeleton-${i}`} sx={{ display: 'flex' }}>
                            <Skeleton
                                variant="rectangular"
                                width={60}
                                height={60}
                                sx={{
                                    borderRadius: 1,
                                    mr: 2,
                                    bgcolor: 'rgba(255, 255, 255, 0.1)'
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
            ) : isSimilarPostsError ? (
                <Typography color="error" variant="body2">
                    Помилка завантаження схожих постів
                </Typography>
            ) : totalSimilarPosts === 0 ? (
                <EmptySimilarPostsPlaceholder />
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {similarPosts.map((post) => (
                        <InlinePostCard key={post.id} post={post} />
                    ))}
                </Box>
            )}
        </Paper>
    );

    const UserPostsSidebar = () => (
        <Paper
            sx={{
                backdropFilter: 'blur(10px)',
                borderRadius: 2,
                p: 2,
                border: '1px solid rgba(156, 39, 176, 0.2)',
                background: 'rgba(10, 10, 15, 0.7)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                position: 'sticky',
                top: 20,
                minWidth: { lg: 220, xl: 260 }
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PostAdd sx={{ mr: 1, color: '#ff4081' }} />
                <Typography variant="h6" sx={{ color: '#ffffff' }}>
                    Пости користувача
                </Typography>
            </Box>
            <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.12)', mb: 2 }} />

            {isUserPostsLoading ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Box key={`user-skeleton-${i}`} sx={{ display: 'flex' }}>
                            <Skeleton
                                variant="rectangular"
                                width={60}
                                height={60}
                                sx={{
                                    borderRadius: 1,
                                    mr: 2,
                                    bgcolor: 'rgba(255, 255, 255, 0.1)'
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
            ) : isUserPostsError ? (
                <Typography color="error" variant="body2">
                    Помилка завантаження постів користувача
                </Typography>
            ) : totalUserPosts === 0 ? (
                <EmptySimilarPostsPlaceholder message={'Користувач більше не має постів'} />
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {userPosts.map((post) => (
                        <motion.div
                            key={post.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => window.location.href = `/posts/${post.slug}`}
                        >
                            <Paper
                                sx={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                    borderRadius: 1,
                                    p: 1.5,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        backgroundColor: 'rgba(156, 39, 176, 0.1)',
                                        boxShadow: '0 0 10px rgba(156, 39, 176, 0.2)'
                                    }
                                }}
                            >
                                <Typography
                                    variant="subtitle2"
                                    sx={{
                                        fontWeight: 600,
                                        mb: 0.5,
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                        color: '#ffffff'
                                    }}
                                >
                                    {post.title}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                    {post.tags?.length > 0 && (
                                        <Chip
                                            label={`# ${post.tags[0]}`}
                                            size="small"
                                            sx={{
                                                mr: 1,
                                                bgcolor: 'rgba(156, 39, 176, 0.2)',
                                                color: '#e0e0e0'
                                            }}
                                        />
                                    )}
                                    <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
                                        <Favorite
                                            sx={{ fontSize: 16, color: '#ff4081', mr: 0.5 }}
                                        />
                                        <Typography variant="caption" sx={{ mr: 1, color: '#e0e0e0' }}>
                                            {post.likes_count.toLocaleString()}
                                        </Typography>
                                        <ChatBubbleOutline
                                            sx={{ fontSize: 16, color: '#b0b0b0', mr: 0.5 }}
                                        />
                                        <Typography variant="caption" sx={{ color: '#e0e0e0' }}>
                                            {post.comments_count.toLocaleString()}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Paper>
                        </motion.div>
                    ))}
                </Box>
            )}
        </Paper>
    );

    return (
        <Box
            sx={{
                minHeight: '100vh',
                color: '#e0e0e0',
                pt: 2,
                pb: 8
            }}
        >
            <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
                <Grid container spacing={3}>
                    {/* Ліва колонка - Пости користувача */}
                    {isLargeScreen && (
                        <Grid
                            item
                            xs={12}
                            lg={2.5}
                            sx={{
                                display: { xs: 'none', lg: 'flex' },
                                flexDirection: 'column',
                                position: 'sticky',
                                top: 20,
                                alignSelf: 'flex-start',
                                height: 'fit-content'
                            }}
                        >
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <UserPostsSidebar />
                            </motion.div>
                        </Grid>
                    )}

                    {/* Центральна частина - Пост і коментарі */}
                    <Grid
                        item
                        xs={12}
                        sm={12}
                        md={isMediumScreen ? 8 : 12}
                        lg={isLargeScreen ? 6 : isMediumScreen ? 8 : 12}
                        sx={{
                            flexGrow: 1,
                            maxWidth: isLargeScreen ? 'calc(50% - 24px)' : isMediumScreen ? 'calc(66.67% - 16px)' : '100%'
                        }}
                    >
                        {isPostLoading ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Paper
                                    sx={{
                                        backgroundColor: 'rgba(10, 10, 15, 0.7)',
                                        borderRadius: 2,
                                        p: 2,
                                        border: '1px solid rgba(156, 39, 176, 0.2)',
                                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
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
                                            bgcolor: 'rgba(255, 255, 255, 0.1)'
                                        }}
                                    />
                                    <Box sx={{ display: 'flex', mt: 2 }}>
                                        <Skeleton
                                            width={80}
                                            height={36}
                                            sx={{
                                                mr: 1,
                                                borderRadius: 18,
                                                bgcolor: 'rgba(255, 255, 255, 0.1)'
                                            }}
                                        />
                                        <Skeleton
                                            width={80}
                                            height={36}
                                            sx={{
                                                mr: 1,
                                                borderRadius: 18,
                                                bgcolor: 'rgba(255, 255, 255, 0.1)'
                                            }}
                                        />
                                        <Skeleton
                                            width={80}
                                            height={36}
                                            sx={{
                                                borderRadius: 18,
                                                bgcolor: 'rgba(255, 255, 255, 0.1)'
                                            }}
                                        />
                                    </Box>
                                </Paper>
                            </motion.div>
                        ) : isPostError ? (
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
                                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
                                    }}
                                >
                                    <Typography variant="h6" color="error" sx={{ mb: 2 }}>
                                        Помилка завантаження поста
                                    </Typography>
                                    <Typography variant="body2" sx={{ mb: 2, color: '#e0e0e0' }}>
                                        {postError.message}
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        sx={{
                                            bgcolor: '#9c27b0',
                                            '&:hover': {
                                                bgcolor: '#7b1fa2',
                                                boxShadow: '0 0 10px rgba(156, 39, 176, 0.5)'
                                            }}
                                        }
                                        onClick={() => window.location.reload()}
                                    >
                                        Спробувати знову
                                    </Button>
                                </Paper>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Box sx={{ mb: 3 }}>
                                    <PostCard
                                        post={post}
                                        isClickable={false}
                                    />
                                </Box>
                                <PostCommentsSection post={post} />
                            </motion.div>
                        )}
                    </Grid>

                    {/* Права колонка - Схожі пости */}
                    {(isMediumScreen || isLargeScreen) && (
                        <Grid
                            item
                            xs={12}
                            md={4}
                            lg={3.5}
                            sx={{
                                display: { xs: 'none', md: 'flex' },
                                flexDirection: 'column',
                                position: 'sticky',
                                top: 20,
                                alignSelf: 'flex-start',
                                height: 'fit-content'
                            }}
                        >
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <SimilarPostsSidebar />
                            </motion.div>
                        </Grid>
                    )}
                </Grid>
            </Container>
        </Box>
    );
};

export default PostDetailsPage;
