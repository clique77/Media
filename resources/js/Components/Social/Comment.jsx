import React, { useState, memo } from 'react';
import {
    Box,
    Typography,
    Avatar,
    IconButton,
    Tooltip,
    Button,
    Dialog,
    DialogContent,
    useMediaQuery,
    useTheme,
    Menu,
    MenuItem,
    ListItemIcon,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
    Favorite,
    FavoriteBorder,
    Share,
    Add,
    ExpandMore,
    Reply,
    Close,
    MoreVert,
    Edit,
    Delete,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '../../../css/quill.css';
import { commentActions } from '@/api/actions';
import { likeActions } from '@/api/actions';
import { useAuth } from '@/Components/Auth/AuthProvider.jsx';
import { formatDate } from '@/utils/formatDate';
import {toast} from "react-toastify";

const quillModules = {
    toolbar: [
        ['bold', 'italic', 'underline'],
        ['link', 'blockquote', 'code-block'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['clean']
    ],
};

const quillFormats = [
    'header',
    'bold', 'italic', 'underline',
    'link', 'blockquote', 'code-block',
    'list', 'bullet',
];

const TreeLines = memo(({ depth, isLast, isRepliesOpen, repliesCount, isMobile }) => {
    if (depth === 0) return null;
    return (
        <>
            <motion.div
                key={`trunk-${depth}`}
                initial={{ height: 0 }}
                animate={{
                    height: isLast || !isRepliesOpen || repliesCount === 0 ? '40px' : '100%',
                }}
                transition={{ duration: 0.3 }}
                style={{
                    position: 'absolute',
                    left: `${(depth - 1) * 0.625 + 0.5}rem`,
                    top: 0,
                    width: '1px',
                    backgroundColor: '#2f3336',
                    borderRadius: '1px',
                    zIndex: 0,
                }}
            />
            <Box
                key={`branch-${depth}`}
                sx={{
                    position: 'absolute',
                    left: `${(depth - 1) * 0.625 + 0.5}rem`,
                    top: '20px',
                    width: isMobile ? '8px' : '10px',
                    height: '8px',
                    zIndex: 0,
                }}
            >
                <svg
                    width={isMobile ? 8 : 10}
                    height={8}
                    viewBox="0 0 10 8"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M0 4 C3 4 7 4 10 4"
                        stroke="#2f3336"
                        strokeWidth="1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </Box>
        </>
    );
});

const Comment = ({ comment, postSlug, depth = 0, maxDepth = 3, isLast = false, isRepliesOpen: initialRepliesOpen = false }) => {
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
    const [isRepliesOpen, setIsRepliesOpen] = useState(initialRepliesOpen);
    const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [newReply, setNewReply] = useState('');
    const [editContent, setEditContent] = useState(comment.content);
    const [menuAnchorEl, setMenuAnchorEl] = useState(null);

    const { data: replies = [], isLoading: isRepliesLoading, isError: isRepliesError, error: repliesError } = useQuery(
        ['comments', comment.id, 'replies'],
        () => commentActions.getReplies(comment.id).then(response => response.data.data),
        {
            enabled: isRepliesOpen && depth < maxDepth,
            staleTime: 1000 * 60 * 5,
            select: (data) =>
                data.map((reply) => ({
                    id: reply.id,
                    content: reply.content,
                    user: {
                        id: reply.user.id,
                        username: reply.user.username,
                        avatar: reply.user.avatar || `https://i.pravatar.cc/150?img=${reply.user.id}`,
                    },
                    likes_count: reply.likes_count || 0,
                    replies_count: reply.replies_count || 0,
                    created_at: reply.created_at,
                    parent_id: reply.parent_id,
                    commentable_id: reply.commentable_id,
                    commentable_type: reply.commentable_type,
                    user_liked: reply.user_liked || false,
                    like_id: reply.like_id || null,
                })),
        }
    );

    const likeMutation = useMutation(() => likeActions.createLike('comments', comment.id), {
        onMutate: async () => {
            await queryClient.cancelQueries(['comments', comment.commentable_id]);
            await queryClient.cancelQueries(['comments', comment.id, 'replies']);

            const previousCommentData = queryClient.getQueryData(['comments', comment.commentable_id]);
            const previousRepliesData = queryClient.getQueryData(['comments', comment.parent_id, 'replies']);

            queryClient.setQueryData(['comments', comment.commentable_id], (oldData) => {
                if (!oldData || !oldData.pages || !Array.isArray(oldData.pages)) {
                    return oldData;
                }
                return {
                    ...oldData,
                    pages: oldData.pages.map((page) => ({
                        ...page,
                        comments: page.comments.map((c) =>
                            c.id === comment.id
                                ? {
                                    ...c,
                                    user_liked: true,
                                    like_id: `temp-${comment.id}`,
                                    likes_count: (c.likes_count || 0) + 1,
                                }
                                : c
                        ),
                    })),
                };
            });
            if (comment.parent_id) {
                queryClient.setQueryData(['comments', comment.parent_id, 'replies'], (oldReplies) => {
                    if (!oldReplies || !Array.isArray(oldReplies)) {
                        return oldReplies;
                    }
                    return oldReplies.map((c) =>
                        c.id === comment.id
                            ? {
                                ...c,
                                user_liked: true,
                                like_id: `temp-${comment.id}`,
                                likes_count: (c.likes_count || 0) + 1,
                            }
                            : c
                    );
                });
            }

            return { previousCommentData, previousRepliesData };
        },
        onError: (err, variables, context) => {
            queryClient.setQueryData(['comments', comment.commentable_id], context.previousCommentData);
            queryClient.setQueryData(['comments', comment.parent_id, 'replies'], context.previousRepliesData);
            toast.error(`Помилка лайка: ${err.response?.data?.message || 'Щось пішло не так'}`);
        },
        onSettled: () => {
            queryClient.invalidateQueries(['post', postSlug]);
            queryClient.invalidateQueries(['comments', comment.commentable_id]);
            queryClient.invalidateQueries(['comments', comment.id, 'replies']);
            if (comment.parent_id) {
                queryClient.invalidateQueries(['comments', comment.parent_id, 'replies']);
            }
        },
    });

    const unlikeMutation = useMutation((likeId) => likeActions.deleteLike(likeId), {
        onMutate: async () => {
            await queryClient.cancelQueries(['comments', comment.commentable_id]);
            await queryClient.cancelQueries(['comments', comment.id, 'replies']);

            const previousCommentData = queryClient.getQueryData(['comments', comment.commentable_id]);
            const previousRepliesData = queryClient.getQueryData(['comments', comment.parent_id, 'replies']);

            queryClient.setQueryData(['comments', comment.commentable_id], (oldData) => {
                if (!oldData || !oldData.pages || !Array.isArray(oldData.pages)) {
                    return oldData;
                }
                return {
                    ...oldData,
                    pages: oldData.pages.map((page) => ({
                        ...page,
                        comments: page.comments.map((c) =>
                            c.id === comment.id
                                ? {
                                    ...c,
                                    user_liked: false,
                                    like_id: null,
                                    likes_count: (c.likes_count || 0) - 1,
                                }
                                : c
                        ),
                    })),
                };
            });

            if (comment.parent_id) {
                queryClient.setQueryData(['comments', comment.parent_id, 'replies'], (oldReplies) => {
                    if (!oldReplies || !Array.isArray(oldReplies)) {
                        return oldReplies;
                    }
                    return oldReplies.map((c) =>
                        c.id === comment.id
                            ? {
                                ...c,
                                user_liked: false,
                                like_id: null,
                                likes_count: (c.likes_count || 0) - 1,
                            }
                            : c
                    );
                });
            }

            return { previousCommentData, previousRepliesData };
        },
        onError: (err, variables, context) => {
            queryClient.setQueryData(['comments', comment.commentable_id], context.previousCommentData);
            queryClient.setQueryData(['comments', comment.parent_id, 'replies'], context.previousRepliesData);
            toast.error(`Помилка зняття лайка: ${err.response?.data?.message || 'Щось пішло не так'}`);
        },
        onSettled: () => {
            queryClient.invalidateQueries(['post', postSlug]);
            queryClient.invalidateQueries(['comments', comment.commentable_id]);
            queryClient.invalidateQueries(['comments', comment.id, 'replies']);
            if (comment.parent_id) {
                queryClient.invalidateQueries(['comments', comment.parent_id, 'replies']);
            }
        },
    });

    const createReplyMutation = useMutation(
        (payload) => commentActions.createComment('posts', comment.commentable_id, payload),
        {
            onSuccess: (response) => {
                const replyData = response.data.comment;
                if (!replyData?.id || !replyData?.content) {
                    return;
                }

                const newReplyData = {
                    id: replyData.id,
                    content: replyData.content,
                    user: {
                        id: user.id,
                        username: user.username,
                        avatar: user.avatar || `https://i.pravatar.cc/150?img=${user.id}`,
                    },
                    likes_count: replyData.likes_count || 0,
                    replies_count: replyData.replies_count || 0,
                    created_at: replyData.created_at || new Date().toISOString(),
                    parent_id: replyData.parent_id || comment.id,
                    commentable_id: replyData.commentable_id || comment.commentable_id,
                    commentable_type: replyData.commentable_type || comment.commentable_type,
                    user_liked: replyData.user_liked || false,
                    like_id: replyData.like_id || null,
                };

                queryClient.setQueryData(['comments', comment.commentable_id], (oldData) => {
                    if (!oldData || !oldData.pages || !Array.isArray(oldData.pages)) {
                        return oldData;
                    }
                    return {
                        ...oldData,
                        pages: oldData.pages.map((page) => ({
                            ...page,
                            comments: page.comments.map((c) =>
                                c.id === comment.id
                                    ? { ...c, replies_count: (c.replies_count || 0) + 1 }
                                    : c
                            ),
                        })),
                    };
                });

                queryClient.setQueryData(['comments', comment.id, 'replies'], (oldReplies) => {
                    return oldReplies && Array.isArray(oldReplies)
                        ? [...oldReplies, newReplyData]
                        : [newReplyData];
                });

                if (comment.parent_id) {
                    queryClient.setQueryData(['comments', comment.parent_id, 'replies'], (oldReplies) => {
                        if (!oldReplies || !Array.isArray(oldReplies)) {
                            return [{ ...comment, replies_count: (comment.replies_count || 0) + 1 }, newReplyData];
                        }
                        return oldReplies.map((c) =>
                            c.id === comment.id
                                ? { ...c, replies_count: (c.replies_count || 0) + 1 }
                                : c
                        ).concat([newReplyData]);
                    });
                }

                setTimeout(() => {
                    try {
                        queryClient.invalidateQueries(['comments', comment.commentable_id]);
                        if (comment.parent_id) {
                            queryClient.invalidateQueries(['comments', comment.parent_id, 'replies']);
                        }
                        queryClient.invalidateQueries(['comments', comment.id, 'replies']);
                    } catch (error) {
                        console.error('Error invalidating queries:', error);
                    }
                }, 100);

                setNewReply('');
                setIsReplyModalOpen(false);
                setIsRepliesOpen(true);
            },
            onError: (error) => {
                toast.error(`${error.response?.data?.error || 'Щось пішло не так'}`);
            },
        }
    );

    const editCommentMutation = useMutation(
        (payload) => commentActions.updateComment(comment.id, payload),
        {
            onSuccess: (response) => {
                const updatedComment = response.data.comment;
                if (!updatedComment?.id || !updatedComment?.content) {
                    return;
                }

                queryClient.setQueryData(['comments', comment.commentable_id], (oldData) => {
                    if (!oldData || !oldData.pages || !Array.isArray(oldData.pages)) {
                        return oldData;
                    }
                    return {
                        ...oldData,
                        pages: oldData.pages.map((page) => ({
                            ...page,
                            comments: page.comments.map((c) =>
                                c.id === comment.id
                                    ? { ...c, content: updatedComment.content }
                                    : c
                            ),
                        })),
                    };
                });

                if (comment.parent_id) {
                    queryClient.setQueryData(['comments', comment.parent_id, 'replies'], (oldReplies) => {
                        if (!oldReplies || !Array.isArray(oldReplies)) {
                            return oldReplies;
                        }
                        return oldReplies.map((c) =>
                            c.id === comment.id
                                ? { ...c, content: updatedComment.content }
                                : c
                        );
                    });
                }

                setTimeout(() => {
                    try {
                        queryClient.invalidateQueries(['comments', comment.commentable_id]);
                        if (comment.parent_id) {
                            queryClient.invalidateQueries(['comments', comment.parent_id, 'replies']);
                        }
                    } catch (error) {
                        console.error('Error invalidating queries:', error);
                    }
                }, 100);

                setEditContent(updatedComment.content);
                setIsEditModalOpen(false);
            },
            onError: (error) => {
                console.error('Error editing comment:', error);
                alert(`Помилка редагування коментаря: ${error.response?.data?.message || 'Щось пішло не так'}`);
            },
        }
    );

    const deleteCommentMutation = useMutation(
        () => commentActions.deleteComment(comment.id),
        {
            onSuccess: () => {
                queryClient.setQueryData(['comments', comment.commentable_id], (oldData) => {
                    if (!oldData || !oldData.pages || !Array.isArray(oldData.pages)) {
                        return oldData;
                    }
                    return {
                        ...oldData,
                        pages: oldData.pages.map((page) => ({
                            ...page,
                            comments: page.comments.filter((c) => c.id !== comment.id),
                            totalComments: (page.totalComments || 0) - 1,
                        })),
                    };
                });

                if (comment.parent_id) {
                    queryClient.setQueryData(['comments', comment.parent_id, 'replies'], (oldReplies) => {
                        if (!oldReplies || !Array.isArray(oldReplies)) {
                            return oldReplies;
                        }
                        return oldReplies
                            .map((c) =>
                                c.id === comment.id
                                    ? { ...c, replies_count: (c.replies_count || 0) - 1 }
                                    : c
                            )
                            .filter((c) => c.id !== comment.id);
                    });
                }

                setTimeout(() => {
                    try {
                        queryClient.invalidateQueries(['comments', comment.commentable_id]);
                        if (comment.parent_id) {
                            queryClient.invalidateQueries(['comments', comment.parent_id, 'replies']);
                        }
                    } catch (error) {
                        console.error('Error invalidating queries:', error);
                    }
                }, 100);
            },
            onError: (error) => {
                console.error('Error deleting comment:', error);
                alert(`Помилка видалення коментаря: ${error.response?.data?.message || 'Щось пішло не так'}`);
            },
        }
    );

    const handleLike = () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        if (comment.user_liked) {
            unlikeMutation.mutate(comment.like_id);
        } else {
            likeMutation.mutate();
        }
    };

    const handleShare = () => {
        const url = `${window.location.origin}/posts/${postSlug}/comments/${comment.id}`;
        navigator.clipboard.writeText(url).then(() => {
            toast.success('Посилання скопійовано!');
        }).catch(() => {
            toast.error('Помилка копіювання посилання');
        });
    };

    const handleToggleReplies = () => {
        setIsRepliesOpen(!isRepliesOpen);
    };

    const handleViewThread = () => {
        navigate(`/posts/${postSlug}/comments/${comment.id}`);
    };

    const handleToggleReplyModal = () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        setIsReplyModalOpen(!isReplyModalOpen);
    };

    const handleCreateReply = () => {
        if (newReply.trim() && newReply !== '<p><br></p>') {
            createReplyMutation.mutate({ content: newReply, parent_id: comment.id });
        }
    };

    const handleMenuOpen = (event) => {
        setMenuAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setMenuAnchorEl(null);
    };

    const handleEditOpen = () => {
        setEditContent(comment.content);
        setIsEditModalOpen(true);
        handleMenuClose();
    };

    const handleEditClose = () => {
        setIsEditModalOpen(false);
    };

    const handleEditSave = () => {
        if (editContent.trim() && editContent !== '<p><br></p>') {
            editCommentMutation.mutate({ content: editContent });
        }
    };

    const handleDelete = () => {
        if (window.confirm('Ви впевнені, що хочете видалити цей коментар?')) {
            deleteCommentMutation.mutate();
            handleMenuClose();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Box
                sx={{
                    position: 'relative',
                    pl: `${depth * 0.625 + 0.625}rem`,
                    pt: 0.5,
                    pb: 0.5,
                    minHeight: '48px',
                    boxSizing: 'border-box',
                    maxWidth: '100%',
                }}
            >
                <TreeLines
                    depth={depth}
                    isLast={isLast}
                    isRepliesOpen={isRepliesOpen}
                    repliesCount={comment.replies_count || 0}
                    isMobile={isMobile}
                />
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <Avatar
                        src={comment.user.avatar}
                        alt={comment.user.username}
                        sx={{
                            width: 32,
                            height: 32,
                            mr: isMobile ? 0.75 : 1,
                            mt: '6px',
                            zIndex: 1,
                        }}
                    />
                    <Box sx={{ flexGrow: 1, zIndex: 1, maxWidth: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.25 }}>
                            <Typography
                                variant="subtitle2"
                                sx={{ color: '#ffffff', fontWeight: 500, mr: 1 }}
                            >
                                {comment.user.username}
                            </Typography>
                            <Typography
                                variant="caption"
                                sx={{ color: '#b0b0b0' }}
                            >
                                {formatDate(comment.created_at)}
                            </Typography>
                        </Box>
                        <Box
                            sx={{
                                color: '#e0e0e0',
                                lineHeight: 1.5,
                                mb: 0.5,
                                maxWidth: '100%',
                                wordBreak: 'break-word',
                                overflowWrap: 'break-word',
                                whiteSpace: 'normal',
                                overflowX: 'hidden',
                                boxSizing: 'border-box',
                                '& p': { margin: 0 },
                                '& *': { fontSize: '0.875rem' },
                                '& h1': { fontSize: '1.125rem' },
                                '& h2': { fontSize: '1rem' },
                                '& ul, & ol': { paddingLeft: '1.5em', margin: 0 },
                            }}
                            dangerouslySetInnerHTML={{ __html: comment.content }}
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 }, mb: 0.5 }}>
                            <Tooltip title={comment.user_liked ? 'Прибрати лайк' : 'Лайк'}>
                                <IconButton
                                    size="small"
                                    onClick={handleLike}
                                    disabled={likeMutation.isLoading || unlikeMutation.isLoading}
                                    sx={{ color: comment.user_liked ? '#ff4081' : '#b0b0b0' }}
                                >
                                    {comment.user_liked ? (
                                        <Favorite fontSize="small" />
                                    ) : (
                                        <FavoriteBorder fontSize="small" />
                                    )}
                                    <Typography variant="caption" sx={{ ml: 0.5, color: '#e0e0e0' }}>
                                        {comment.likes_count}
                                    </Typography>
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Відповісти">
                                <IconButton
                                    size="small"
                                    onClick={handleToggleReplyModal}
                                    sx={{ color: '#b0b0b0' }}
                                >
                                    <Reply fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Поділитися">
                                <IconButton
                                    size="small"
                                    onClick={handleShare}
                                    sx={{ color: '#b0b0b0' }}
                                >
                                    <Share fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            {isAuthenticated && comment.user.id === user.id && (
                                <Tooltip title="Додаткові дії">
                                    <IconButton
                                        size="small"
                                        onClick={handleMenuOpen}
                                        sx={{ color: '#b0b0b0' }}
                                    >
                                        <MoreVert fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </Box>
                        <Menu
                            anchorEl={menuAnchorEl}
                            open={Boolean(menuAnchorEl)}
                            onClose={handleMenuClose}
                            PaperProps={{
                                sx: {
                                    backgroundColor: 'rgba(10, 10, 15, 0.9)',
                                    color: '#e0e0e0',
                                    border: '1px solid rgba(156, 39, 176, 0.3)',
                                },
                            }}
                        >
                            <MenuItem onClick={handleEditOpen}>
                                <ListItemIcon>
                                    <Edit fontSize="small" sx={{ color: '#9c27b0' }} />
                                </ListItemIcon>
                                Редагувати
                            </MenuItem>
                            <MenuItem onClick={handleDelete}>
                                <ListItemIcon>
                                    <Delete fontSize="small" sx={{ color: '#ff4081' }} />
                                </ListItemIcon>
                                Видалити
                            </MenuItem>
                        </Menu>
                        {comment.replies_count > 0 && (
                            <Box sx={{ pl: isMobile ? 0.5 : 0.625 }}>
                                {depth < maxDepth ? (
                                    <Tooltip title={isRepliesOpen ? 'Згорнути' : 'Показати відповіді'}>
                                        <Button
                                            size="small"
                                            startIcon={isRepliesOpen ? <ExpandMore /> : <Add />}
                                            onClick={handleToggleReplies}
                                            sx={{ color: '#9c27b0', textTransform: 'none', fontSize: '0.75rem' }}
                                        >
                                            {isRepliesOpen ? 'Згорнути' : `${comment.replies_count} відповід${comment.replies_count === 1 ? 'ь' : 'ей'}`}
                                        </Button>
                                    </Tooltip>
                                ) : (
                                    <Button
                                        size="small"
                                        startIcon={<Add />}
                                        onClick={handleViewThread}
                                        sx={{ color: '#9c27b0', textTransform: 'none', fontSize: '0.75rem' }}
                                    >
                                        Переглянути гілку ({comment.replies_count})
                                    </Button>
                                )}
                            </Box>
                        )}
                        {isRepliesOpen && depth < maxDepth && (
                            <Box sx={{ mt: 0.25 }}>
                                {isRepliesLoading ? (
                                    <Typography variant="caption" sx={{ color: '#b0b0b0' }}>
                                        Завантаження відповідей...
                                    </Typography>
                                ) : isRepliesError ? (
                                    <Typography variant="caption" color="error">
                                        Помилка: {repliesError.response?.data?.message || 'Не вдалося завантажити відповіді'}
                                    </Typography>
                                ) : replies.length > 0 ? (
                                    replies.map((reply, index) => (
                                        <Comment
                                            key={reply.id}
                                            comment={reply}
                                            postSlug={postSlug}
                                            depth={depth + 1}
                                            maxDepth={maxDepth}
                                            isLast={index === replies.length - 1}
                                        />
                                    ))
                                ) : (
                                    <Typography variant="caption" sx={{ color: '#b0b0b0' }}>
                                        Немає відповідей
                                    </Typography>
                                )}
                            </Box>
                        )}
                    </Box>
                </Box>
            </Box>
            <Dialog
                open={isReplyModalOpen}
                onClose={handleToggleReplyModal}
                maxWidth={isMobile ? 'xs' : isTablet ? 'sm' : 'md'}
                fullWidth
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(0, 0, 0, 0.7)',
                    '& .MuiDialog-paper': {
                        backgroundColor: 'rgba(10, 10, 15, 0.9)',
                        border: '1px solid transparent',
                        borderImage: 'linear-gradient(to right, #9c27b0, rgba(156, 39, 176, 0.3)) 1',
                        borderRadius: 2,
                        backdropFilter: 'blur(15px)',
                        boxShadow: '0 8px 32px rgba(156, 39, 176, 0.2)',
                        color: '#e0e0e0',
                        width: 600,
                        maxWidth: { xs: 480, sm: 900, md: 1600 },
                        maxHeight: { xs: '90vh', sm: '95vh', md: '95vh' },
                        m: { xs: 1, sm: 2 },
                    },
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: { xs: 1, sm: 2 } }}>
                    <Typography variant="h6" sx={{ color: '#ffffff' }}>
                        Відповісти на коментар
                    </Typography>
                    <IconButton
                        onClick={handleToggleReplyModal}
                        sx={{ color: '#b0b0b0', '&:hover': { color: '#9c27b0' } }}
                    >
                        <Close />
                    </IconButton>
                </Box>
                <Box
                    sx={{
                        height: 2,
                        background: 'linear-gradient(to right, #9c27b0, rgba(156, 39, 176, 0.3))',
                        mx: { xs: 1, sm: 2 },
                        mb: 2,
                    }}
                />
                <DialogContent sx={{ p: { xs: 1, sm: 2, md: 3 }, pt: 0 }}>
                    <ReactQuill
                        value={newReply}
                        onChange={setNewReply}
                        modules={quillModules}
                        formats={quillFormats}
                        placeholder="Напишіть вашу відповідь..."
                        theme="snow"
                    />
                    <Box sx={{ display: 'flex', gap: { xs: 1, sm: 2 }, mt: 2, justifyContent: 'flex-end' }}>
                        <Button
                            variant="contained"
                            onClick={handleCreateReply}
                            disabled={createReplyMutation.isLoading || !newReply.trim() || newReply === '<p><br></p>'}
                            sx={{
                                bgcolor: '#9c27b0',
                                '&:hover': {
                                    bgcolor: '#7b1fa2',
                                    boxShadow: '0 0 10px rgba(156, 39, 176, 0.5)',
                                },
                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                px: { xs: 1.5, sm: 2 },
                            }}
                        >
                            Відправити
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={handleToggleReplyModal}
                            sx={{
                                color: '#b0b0b0',
                                borderColor: 'rgba(156, 39, 176, 0.3)',
                                '&:hover': {
                                    borderColor: '#9c27b0',
                                    backgroundColor: 'rgba(156, 39, 176, 0.1)',
                                },
                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                px: { xs: 1.5, sm: 2 },
                            }}
                        >
                            Скасувати
                        </Button>
                    </Box>
                </DialogContent>
            </Dialog>
            <Dialog
                open={isEditModalOpen}
                onClose={handleEditClose}
                maxWidth={isMobile ? 'xs' : isTablet ? 'sm' : 'md'}
                fullWidth
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(0, 0, 0, 0.7)',
                    '& .MuiDialog-paper': {
                        backgroundColor: 'rgba(10, 10, 15, 0.9)',
                        border: '1px solid transparent',
                        borderImage: 'linear-gradient(to right, #9c27b0, rgba(156, 39, 176, 0.3)) 1',
                        borderRadius: 2,
                        backdropFilter: 'blur(15px)',
                        boxShadow: '0 8px 32px rgba(156, 39, 176, 0.2)',
                        color: '#e0e0e0',
                        width: 600,
                        maxWidth: { xs: 480, sm: 900, md: 1600 },
                        maxHeight: { xs: '90vh', sm: '95vh', md: '95vh' },
                        m: { xs: 1, sm: 2 },
                    },
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: { xs: 1, sm: 2 } }}>
                    <Typography variant="h6" sx={{ color: '#ffffff' }}>
                        Редагувати коментар
                    </Typography>
                    <IconButton
                        onClick={handleEditClose}
                        sx={{ color: '#b0b0b0', '&:hover': { color: '#9c27b0' } }}
                    >
                        <Close />
                    </IconButton>
                </Box>
                <Box
                    sx={{
                        height: 2,
                        background: 'linear-gradient(to right, #9c27b0, rgba(156, 39, 176, 0.3))',
                        mx: { xs: 1, sm: 2 },
                        mb: 2,
                    }}
                />
                <DialogContent sx={{ p: { xs: 1, sm: 2, md: 3 }, pt: 0 }}>
                    <ReactQuill
                        value={editContent}
                        onChange={setEditContent}
                        modules={quillModules}
                        formats={quillFormats}
                        placeholder="Редагуйте ваш коментар..."
                        theme="snow"
                    />
                    <Box sx={{ display: 'flex', gap: { xs: 1, sm: 2 }, mt: 2, justifyContent: 'flex-end' }}>
                        <Button
                            variant="contained"
                            onClick={handleEditSave}
                            disabled={editCommentMutation.isLoading || !editContent.trim() || editContent === '<p><br></p>'}
                            sx={{
                                bgcolor: '#9c27b0',
                                '&:hover': {
                                    bgcolor: '#7b1fa2',
                                    boxShadow: '0 0 10px rgba(156, 39, 176, 0.5)',
                                },
                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                px: { xs: 1.5, sm: 2 },
                            }}
                        >
                            Зберегти
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={handleEditClose}
                            sx={{
                                color: '#b0b0b0',
                                borderColor: 'rgba(156, 39, 176, 0.3)',
                                '&:hover': {
                                    borderColor: '#9c27b0',
                                    backgroundColor: 'rgba(156, 39, 176, 0.1)',
                                },
                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                px: { xs: 1.5, sm: 2 },
                            }}
                        >
                            Скасувати
                        </Button>
                    </Box>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
};

export default Comment;
