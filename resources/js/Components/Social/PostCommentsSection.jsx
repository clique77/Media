import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Box,
    Typography,
    CircularProgress,
    Button,
    Divider,
    Dialog,
    DialogContent,
    IconButton,
    useMediaQuery,
    useTheme,
    TextField,
    Menu,
    MenuItem,
    InputAdornment,
    Slider,
} from '@mui/material';
import { motion } from 'framer-motion';
import { AddComment, Close, Sort as SortIcon, FilterList as FilterListIcon, Search as SearchIcon } from '@mui/icons-material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '../../../css/quill.css';
import { commentActions } from '@/api/actions';
import Comment from './Comment';
import { useAuth } from '@/Components/Auth/AuthProvider.jsx';
import { useNavigate } from 'react-router-dom';
import { useInfiniteQuery, useMutation, useQueryClient } from 'react-query';
import debounce from 'lodash.debounce';
import {toast} from "react-toastify";

// Налаштування Quill
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
    'link', 'blockquote', 'color',
    'list', 'bullet',
];

const fetchComments = async ({ pageParam = null, postId, query = '' }) => {
    const response = pageParam
        ? await window.axios.get(pageParam)
        : await commentActions.getComments('posts', postId, query);

    return {
        comments: response.data.data.map((comment) => ({
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
            commentable_id: comment.commentable_id || postId,
            commentable_type: comment.commentable_type || 'posts',
            user_liked: comment.user_liked || false,
            like_id: comment.like_id || null,
        })),
        nextCursor: response.data.next_cursor,
        nextPageUrl: response.data.next_page_url,
        hasMore: !!response.data.next_page_url,
        totalComments: response.data.data.length,
    };
};

const PostCommentsSection = ({ post }) => {
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [newComment, setNewComment] = useState('');
    const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [sortAnchorEl, setSortAnchorEl] = useState(null);
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({
        username: '',
        content: '',
        created_at_from: '',
        created_at_to: '',
        likes_count: [0, 100000],
    });
    const [tempFilters, setTempFilters] = useState(filters);
    const [sort, setSort] = useState('-created_at');
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
    const observer = useRef();
    const loadingRef = useRef(false);
    const queryStringRef = useRef('');

    const buildQueryString = () => {
        const params = new URLSearchParams();

        if (sort) {
            params.append('sort', sort);
        }

        if (filters.username) {
            params.append('filter[user.username]', filters.username);
        }
        if (filters.content) {
            params.append('filter[content]', filters.content);
        }
        if (filters.created_at_from) {
            params.append('filter[created_at][from]', filters.created_at_from);
        }
        if (filters.created_at_to) {
            params.append('filter[created_at][to]', filters.created_at_to);
        }
        if (filters.likes_count[0] > 0) {
            params.append('filter[likes_count][from]', filters.likes_count[0]);
        }
        if (filters.likes_count[1] <= 100000) {
            params.append('filter[likes_count][to]', filters.likes_count[1]);
        }

        if (search) {
            params.append('filter[content]', search);
        }

        return params.toString();
    };

    const debouncedSearch = useCallback(
        debounce((value) => {
            setSearch(value);
        }, 500),
        []
    );

    const queryString = buildQueryString();
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
        error,
    } = useInfiniteQuery(
        ['comments', post.id, queryString],
        ({ pageParam }) => fetchComments({ pageParam, postId: post.id, query: queryString }),
        {
            getNextPageParam: (lastPage) => lastPage.nextPageUrl || undefined,
            initialPageParam: null,
            refetchOnWindowFocus: false,
            staleTime: 0,
        }
    );

    useEffect(() => {
        queryClient.invalidateQueries(['comments', post.id]);
        return () => {
            queryClient.removeQueries(['comments', post.id]);
        };
    }, [queryClient, post.id]);

    useEffect(() => {
        if (!isLoading && !isFetchingNextPage) {
            queryStringRef.current = queryString;
        }
    }, [queryString, isLoading, isFetchingNextPage]);

    const lastCommentRef = useCallback(
        (node) => {
            if (isFetchingNextPage || loadingRef.current || isLoading) return;
            if (observer.current) observer.current.disconnect();

            observer.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasNextPage && queryString === queryStringRef.current) {
                    loadingRef.current = true;
                    fetchNextPage().finally(() => {
                        loadingRef.current = false;
                    });
                }
            });

            if (node) observer.current.observe(node);
        },
        [isFetchingNextPage, hasNextPage, fetchNextPage, isLoading, queryString]
    );

    // Мутація для створення коментаря
    const createCommentMutation = useMutation(
        (payload) =>
            commentActions.createComment('posts', post.id, payload).then((response) => {
                return response.data.data || response.data.comment;
            }),
        {
            onSuccess: (newComment) => {
                queryClient.setQueryData(['comments', post.id, queryString], (oldData) => {
                    const formattedComment = {
                        id: newComment.id,
                        content: newComment.content,
                        user: {
                            id: newComment.user?.id || user?.id || 'unknown',
                            username: newComment.user?.username || user?.username || 'Unknown User',
                            avatar:
                                newComment.user?.avatar ||
                                user?.avatar ||
                                `https://i.pravatar.cc/150?img=${newComment.user?.id || user?.id || '0'}`,
                        },
                        likes_count: newComment.likes_count || 0,
                        replies_count: newComment.replies_count || 0,
                        created_at: newComment.created_at || new Date().toISOString(),
                        parent_id: newComment.parent_id || null,
                        commentable_id: newComment.commentable_id || post.id,
                        commentable_type: newComment.commentable_type || 'posts',
                        user_liked: newComment.user_liked || false,
                        like_id: newComment.like_id || null,
                    };

                    if (!oldData || !oldData.pages || !Array.isArray(oldData.pages) || oldData.pages.length === 0) {
                        return {
                            pages: [{ comments: [formattedComment], totalComments: 1, nextPageUrl: null, hasMore: false }],
                            pageParams: [null],
                        };
                    }

                    const firstPage = oldData.pages[0]?.comments || [];
                    const newPages = [
                        {
                            ...oldData.pages[0],
                            comments: [formattedComment, ...firstPage],
                            totalComments: (oldData.pages[0]?.totalComments || 0) + 1,
                        },
                        ...oldData.pages.slice(1),
                    ];

                    return {
                        pages: newPages,
                        pageParams: oldData.pageParams || [null],
                    };
                });

                queryClient.invalidateQueries(['comments', post.id]);

                setNewComment('');
                setIsCommentModalOpen(false);
            },
            onError: (error) => {
                toast.error(`${error.response?.data?.error || Object.values(error.response?.data?.errors || {}).flat().join('\n') || 'Щось пішло не так'}`);
            },
        }
    );

    // Обробники
    const handleToggleCommentModal = () => {
        setIsCommentModalOpen(!isCommentModalOpen);
    };

    const handleCreateComment = () => {
        if (newComment.trim() && newComment !== '<p><br></p>') {
            createCommentMutation.mutate({ content: newComment });
        }
    };

    const handleSortClick = (event) => {
        setSortAnchorEl(event.currentTarget);
    };

    const handleSortSelect = (sortValue) => {
        queryClient.resetQueries(['comments', post.id]);
        setSort(sortValue);
        setSortAnchorEl(null);
    };

    const handleFilterChange = (field, value) => {
        setTempFilters((prev) => ({ ...prev, [field]: value }));
    };

    const handleLikesRangeChange = (event, newValue) => {
        setTempFilters((prev) => ({ ...prev, likes_count: newValue }));
    };

    const handleApplyFilters = () => {
        setFilters(tempFilters);
        queryClient.resetQueries(['comments', post.id]);
        setIsFilterModalOpen(false);
    };

    const handleResetFilters = () => {
        const initialFilters = {
            username: '',
            content: '',
            created_at_from: '',
            created_at_to: '',
            likes_count: [0, 1000],
        };
        setTempFilters(initialFilters);
        setFilters(initialFilters);
        queryClient.resetQueries(['comments', post.id]);
        setIsFilterModalOpen(false);
    };

    const handleSearchChange = (event) => {
        debouncedSearch(event.target.value);
    };

    const allComments = data?.pages?.flatMap((page) => page.comments) || [];
    const totalComments = data?.pages?.reduce((sum, page) => sum + (page.totalComments || 0), 0) || 0;

    return (
        <Box
            sx={{
                mt: 3,
                mx: { xs: 1, sm: 2, md: 3 },
                maxWidth: { xs: '100%', md: 960 },
                width: { xs: '100%', sm: 700 },
                backgroundColor: 'transparent',
                boxSizing: 'border-box',
            }}
        >
            <Typography variant="h6" sx={{ color: '#ffffff', mb: 2 }}>
                Коментарі
            </Typography>

            {/* Панель керування */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1, flexWrap: 'wrap' }}>
                {/* Кнопка додавання коментаря */}
                <Button
                    variant="outlined"
                    startIcon={<AddComment />}
                    onClick={handleToggleCommentModal}
                    disabled={post.comments_enabled !== true}
                    sx={{
                        display: 'inline-flex',
                        color: '#9c27b0',
                        borderColor: 'rgba(156, 39, 176, 0.3)',
                        textTransform: 'none',
                        '&:hover': {
                            borderColor: '#9c27b0',
                            backgroundColor: 'rgba(156, 39, 176, 0.1)',
                        },
                        '&.Mui-disabled': {
                            color: 'rgba(156, 39, 176, 0.3)',
                            borderColor: 'rgba(156, 39, 176, 0.3)',
                            opacity: 0.5,
                            display: 'inline-flex',
                        },
                    }}
                >
                    Додати коментар
                </Button>

                {/* Пошук і іконки */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
                    <TextField
                        placeholder="Пошук..."
                        variant="outlined"
                        size="small"
                        onChange={handleSearchChange}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: '#b0b0b0', fontSize: 18 }} />
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            maxWidth: { xs: 150, sm: 200 },
                            '& .MuiOutlinedInput-root': {
                                backgroundColor: 'rgba(10, 10, 15, 0.9)',
                                color: '#e0e0e0',
                                borderRadius: 1,
                                fontSize: '0.875rem',
                                height: 32,
                                '& fieldset': {
                                    borderColor: 'rgba(156, 39, 176, 0.3)',
                                },
                                '&:hover fieldset': {
                                    borderColor: '#9c27b0',
                                },
                            },
                        }}
                    />

                    <IconButton
                        onClick={handleSortClick}
                        sx={{
                            color: '#9c27b0',
                            '&:hover': { backgroundColor: 'rgba(156, 39, 176, 0.1)' },
                        }}
                    >
                        <SortIcon />
                    </IconButton>
                    <Menu
                        anchorEl={sortAnchorEl}
                        open={Boolean(sortAnchorEl)}
                        onClose={() => setSortAnchorEl(null)}
                        PaperProps={{
                            sx: {
                                backgroundColor: 'rgba(10, 10, 15, 0.9)',
                                color: '#e0e0e0',
                                border: '1px solid rgba(156, 39, 176, 0.3)',
                            },
                        }}
                    >
                        <MenuItem onClick={() => handleSortSelect('-created_at')}>
                            За датою (спочатку нові)
                        </MenuItem>
                        <MenuItem onClick={() => handleSortSelect('created_at')}>
                            За датою (спочатку старі)
                        </MenuItem>
                        <MenuItem onClick={() => handleSortSelect('-likes_count')}>
                            За лайками (зростання)
                        </MenuItem>
                        <MenuItem onClick={() => handleSortSelect('likes_count')}>
                            За лайками (спадання)
                        </MenuItem>
                    </Menu>

                    <IconButton
                        onClick={() => setIsFilterModalOpen(true)}
                        sx={{
                            color: '#9c27b0',
                            '&:hover': { backgroundColor: 'rgba(156, 39, 176, 0.1)' },
                        }}
                    >
                        <FilterListIcon />
                    </IconButton>
                </Box>
            </Box>

            {/* Модалка для фільтрів */}
            <Dialog
                open={isFilterModalOpen}
                onClose={() => setIsFilterModalOpen(false)}
                maxWidth="sm"
                fullWidth
                sx={{
                    '& .MuiDialog-paper': {
                        backgroundColor: 'rgba(10, 10, 15, 0.9)',
                        border: '1px solid rgba(156, 39, 176, 0.3)',
                        borderRadius: 2,
                        backdropFilter: 'blur(15px)',
                        color: '#e0e0e0',
                    },
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
                    <Typography variant="h6" sx={{ color: '#ffffff' }}>
                        Фільтри
                    </Typography>
                    <IconButton
                        onClick={() => setIsFilterModalOpen(false)}
                        sx={{ color: '#b0b0b0', '&:hover': { color: '#9c27b0' } }}
                    >
                        <Close />
                    </IconButton>
                </Box>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="Нік користувача"
                            value={tempFilters.username}
                            onChange={(e) => handleFilterChange('username', e.target.value)}
                            fullWidth
                            variant="outlined"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: 'rgba(10, 10, 15, 0.9)',
                                    color: '#e0e0e0',
                                    '& fieldset': { borderColor: 'rgba(156, 39, 176, 0.3)' },
                                    '&:hover fieldset': { borderColor: '#9c27b0' },
                                },
                                '& .MuiInputLabel-root': { color: '#b0b0b0' },
                            }}
                        />
                        <TextField
                            label="Вміст коментаря"
                            value={tempFilters.content}
                            onChange={(e) => handleFilterChange('content', e.target.value)}
                            fullWidth
                            variant="outlined"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: 'rgba(10, 10, 15, 0.9)',
                                    color: '#e0e0e0',
                                    '& fieldset': { borderColor: 'rgba(156, 39, 176, 0.3)' },
                                    '&:hover fieldset': { borderColor: '#9c27b0' },
                                },
                                '& .MuiInputLabel-root': { color: '#b0b0b0' },
                            }}
                        />
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                label="Дата від"
                                type="date"
                                value={tempFilters.created_at_from}
                                onChange={(e) => handleFilterChange('created_at_from', e.target.value)}
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        backgroundColor: 'rgba(10, 10, 15, 0.9)',
                                        color: '#e0e0e0',
                                        '& fieldset': { borderColor: 'rgba(156, 39, 176, 0.3)' },
                                        '&:hover fieldset': { borderColor: '#9c27b0' },
                                    },
                                    '& .MuiInputLabel-root': { color: '#b0b0b0' },
                                }}
                            />
                            <TextField
                                label="Дата до"
                                type="date"
                                value={tempFilters.created_at_to}
                                onChange={(e) => handleFilterChange('created_at_to', e.target.value)}
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        backgroundColor: 'rgba(10, 10, 15, 0.9)',
                                        color: '#e0e0e0',
                                        '& fieldset': { borderColor: 'rgba(156, 39, 176, 0.3)' },
                                        '&:hover fieldset': { borderColor: '#9c27b0' },
                                    },
                                    '& .MuiInputLabel-root': { color: '#b0b0b0' },
                                }}
                            />
                        </Box>
                        <Box sx={{ px: 2 }}>
                            <Typography sx={{ color: '#b0b0b0', mb: 1 }}>
                                Кількість лайків: {tempFilters.likes_count[0]} - {tempFilters.likes_count[1]}
                            </Typography>
                            <Slider
                                value={tempFilters.likes_count}
                                onChange={handleLikesRangeChange}
                                valueLabelDisplay="auto"
                                min={0}
                                max={100000}
                                sx={{
                                    color: '#9c27b0',
                                    '& .MuiSlider-thumb': {
                                        '&:hover, &.Mui-focusVisible': {
                                            boxShadow: '0 0 0 8px rgba(156, 39, 176, 0.16)',
                                        },
                                    },
                                    '& .MuiSlider-track': {
                                        backgroundColor: '#9c27b0',
                                    },
                                    '& .MuiSlider-rail': {
                                        backgroundColor: 'rgba(156, 39, 176, 0.3)',
                                    },
                                }}
                            />
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                            <Button
                                variant="contained"
                                onClick={handleApplyFilters}
                                sx={{
                                    bgcolor: '#9c27b0',
                                    '&:hover': {
                                        bgcolor: '#7b1fa2',
                                        boxShadow: '0 0 10px rgba(156, 39, 176, 0.5)',
                                    },
                                }}
                            >
                                Застосувати
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={handleResetFilters}
                                sx={{
                                    color: '#b0b0b0',
                                    borderColor: 'rgba(156, 39, 176, 0.3)',
                                    '&:hover': {
                                        borderColor: '#9c27b0',
                                        backgroundColor: 'rgba(156, 39, 176, 0.1)',
                                    },
                                }}
                            >
                                Скинути
                            </Button>
                        </Box>
                    </Box>
                </DialogContent>
            </Dialog>

            {/* Модалка для створення коментаря */}
            <Dialog
                open={isCommentModalOpen}
                onClose={handleToggleCommentModal}
                maxWidth={isMobile ? 'xs' : isTablet ? 'sm' : 'md'}
                fullWidth
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: 5,
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
                        width: '600px',
                        maxWidth: { xs: 480, sm: 900, md: 1600 },
                        maxHeight: { xs: '90vh', sm: '95vh', md: '95vh' },
                        m: { xs: 1, sm: 2 },
                    },
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: { xs: 1, sm: 2 } }}>
                    <Typography variant="h6" sx={{ color: '#ffffff' }}>
                        Новий коментар
                    </Typography>
                    <IconButton
                        onClick={handleToggleCommentModal}
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
                        value={newComment}
                        onChange={setNewComment}
                        modules={quillModules}
                        formats={quillFormats}
                        placeholder="Напишіть ваш коментар..."
                        theme="snow"
                    />
                    <Box sx={{ display: 'flex', gap: { xs: 1, sm: 2 }, mt: 2, justifyContent: 'flex-end' }}>
                        <Button
                            variant="contained"
                            onClick={handleCreateComment}
                            disabled={createCommentMutation.isLoading || !newComment.trim() || newComment === '<p><br></p>'}
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
                            onClick={handleToggleCommentModal}
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

            <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.12)', mb: 2, width: '100%' }} />

            {/* Список коментарів */}
            {isLoading && !data ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                    <CircularProgress size={24} thickness={4} sx={{ color: '#9c27b0' }} />
                </Box>
            ) : isError ? (
                <Typography variant="body2" color="error">
                    Помилка завантаження коментарів: {error.response?.data?.error || 'Щось пішло не так'}
                </Typography>
            ) : totalComments === 0 ? (
                <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                    Коментарів поки немає
                </Typography>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {allComments.map((comment, index) => (
                        <motion.div
                            key={comment.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            ref={index === allComments.length - 1 ? lastCommentRef : null}
                        >
                            <Comment
                                comment={comment}
                                postSlug={post.slug}
                                depth={0}
                                maxDepth={3}
                            />
                        </motion.div>
                    ))}
                    {isFetchingNextPage && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 6 }}>
                                <CircularProgress size={24} thickness={4} sx={{ color: '#9c27b0' }} />
                            </Box>
                        </motion.div>
                    )}
                </Box>
            )}
        </Box>
    );
};

export default PostCommentsSection;
