import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import {
    Box,
    Container,
    Grid,
    Typography,
    CircularProgress,
    Button,
    Divider,
    Paper,
    Skeleton,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import { commentActions, postActions } from '@/api/actions';
import PostCard from '@/Components/Social/PostCard.jsx';
import Comment from '@/Components/Social/Comment.jsx';
import ErrorMessage from "@/Components/Social/ErrorMessage.jsx";

const fetchPost = async (identifier) => {
    const response = await postActions.getPost(identifier);
    const post = response.data.data;
    return {
        id: post.id,
        title: post.title || 'Без назви',
        content: post.content || '',
        user: {
            id: post.user?.id || 'unknown',
            username: post.user?.username || 'Unknown User',
            avatar:
                post.user?.avatar ||
                `https://i.pravatar.cc/150?img=${post.user?.id || '0'}`,
        },
        attachments: post.attachments || [],
        likes_count: post.likes_count || 0,
        comments_count: post.comments_count || 0,
        views_count: post.views_count || 0,
        created_at: post.created_at || new Date().toISOString(),
        slug: post.slug,
        tags: post.tags ? post.tags.map((tag) => tag.name) : [],
        visibility: post.visibility || 'public',
        comments_enabled: post.comments_enabled ?? true,
        user_liked: post.user_liked || false,
        like_id: post.like_id || null,
    };
};

const fetchComment = async (commentId) => {
    const response = await commentActions.getComment(commentId);
    const comment = response.data;
    return {
        id: comment.id,
        content: comment.content,
        user: {
            id: comment.user?.id || 'unknown',
            username: comment.user?.username || 'Unknown User',
            avatar:
                comment.user?.avatar ||
                `https://i.pravatar.cc/150?img=${comment.user?.id || '0'}`,
        },
        likes_count: comment.likes_count || 0,
        replies_count: comment.replies_count || 0,
        created_at: comment.created_at || new Date().toISOString(),
        parent_id: comment.parent_id || null,
        commentable_id: comment.commentable_id,
        commentable_type: comment.commentable_type || 'posts',
        user_liked: comment.user_liked || false,
        like_id: comment.like_id || null,
        replies: comment.replies?.map((reply) => ({
            id: reply.id,
            content: reply.content,
            user: {
                id: reply.user?.id || 'unknown',
                username: reply.user?.username || 'Unknown User',
                avatar:
                    reply.user?.avatar ||
                    `https://i.pravatar.cc/150?img=${reply.user?.id || '0'}`,
            },
            likes_count: reply.likes_count || 0,
            replies_count: reply.replies_count || 0,
            created_at: reply.created_at || new Date().toISOString(),
            parent_id: reply.parent_id || comment.id,
            commentable_id: reply.commentable_id || comment.commentable_id,
            commentable_type: reply.commentable_type || comment.commentable_type,
            user_liked: reply.user_liked || false,
            like_id: reply.like_id || null,
        })) || [],
    };
};

const PostCommentsThreadPage = () => {
    const { identifier, commentId } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const {
        data: post,
        isLoading: isPostLoading,
        isError: isPostError,
        error: postError,
    } = useQuery(['post', identifier], () => fetchPost(identifier), {
        staleTime: 1000 * 60,
        enabled: !!identifier,
        retry: false,
        refetchOnWindowFocus: false,
    });

    const {
        data: comment,
        isLoading: isCommentLoading,
        isError: isCommentError,
        error: commentError,
    } = useQuery(['comment', commentId], () => fetchComment(commentId), {
        staleTime: 1000 * 60,
        enabled: !!commentId,
        retry: false,
        refetchOnWindowFocus: false,
    });

    if (isPostError) {
        const errorMessage = postError.response?.data?.error || 'Цей пост приватний або у вас немає прав для перегляду';
        return <ErrorMessage message={errorMessage} isMobile={isMobile} />;
    }

    const handleBack = () => {
        navigate(`/posts/${identifier}`);
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                color: '#e0e0e0',
                pt: 2,
                pb: 8,
                bgcolor: 'transparent',
            }}
        >
            <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
                <Grid container spacing={3} justifyContent="center">
                    <Grid item xs={12} sm={10} md={8}>
                        {/* Кнопка "Назад" */}
                        <Button
                            variant="outlined"
                            onClick={handleBack}
                            sx={{
                                color: '#9c27b0',
                                borderColor: 'rgba(156, 39, 176, 0.3)',
                                textTransform: 'none',
                                mb: 3,
                                '&:hover': {
                                    borderColor: '#9c27b0',
                                    backgroundColor: 'rgba(156, 39, 176, 0.1)',
                                },
                            }}
                        >
                            Назад до поста
                        </Button>

                        {/* Відображення поста */}
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
                        ) : isPostError ? (
                            <Typography variant="body2" color="error">
                                Помилка завантаження поста: {postError?.response?.data?.error || 'Щось пішло не так'}
                            </Typography>
                        ) : post ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Box sx={{ mb: 3 }}>
                                    <PostCard post={post} isClickable={false} />
                                </Box>
                            </motion.div>
                        ) : (
                            <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                                Пост не знайдено
                            </Typography>
                        )}

                        <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.12)', my: 3, width: '100%' }} />

                        {/* Відображення коментаря */}
                        <Typography variant="h6" sx={{ color: '#ffffff', mb: 2 }}>
                            Коментар
                        </Typography>
                        {isCommentLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                                <CircularProgress size={40} thickness={4} sx={{ color: '#9c27b0' }} />
                            </Box>
                        ) : isCommentError ? (
                            <Typography variant="body2" color="error">
                                Помилка завантаження коментаря: {commentError?.response?.data?.message || 'Щось пішло не так'}
                            </Typography>
                        ) : comment ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Comment
                                    comment={comment}
                                    postSlug={identifier}
                                    depth={0}
                                    maxDepth={3}
                                    isRepliesOpen={true} // Відразу відображаємо відповіді
                                />
                            </motion.div>
                        ) : (
                            <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                                Коментар не знайдено
                            </Typography>
                        )}
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default PostCommentsThreadPage;
