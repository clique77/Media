import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Box,
    Button,
    Chip,
    Divider,
    IconButton,
    Paper,
    Typography,
    TextField,
    Switch,
    Slider,
    FormControlLabel,
    Grid,
    InputAdornment,
    Radio,
    RadioGroup,
    FormControl,
} from '@mui/material';
import {
    FilterList,
    Whatshot,
    NewReleases,
    TrendingUp,
    Close,
    CheckCircle,
    Search,
    Description,
    Person,
    Visibility
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format } from 'date-fns';
import {useInfiniteQuery} from "react-query";
import {tagActions} from "@/api/actions/index.js";

const PostsFilter = ({ isMobile, onClose, onApplyFilters }) => {
    const [sort, setSort] = useState('-created_at');
    const [tags, setTags] = useState([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [username, setUsername] = useState('');
    const [visibility, setVisibility] = useState('public');
    const [commentsEnabled, setCommentsEnabled] = useState(true);
    const [likesCount, setLikesCount] = useState([0, 1000]);
    const [commentsCount, setCommentsCount] = useState([0, 500]);
    const [viewsCount, setViewsCount] = useState([0, 10000]);
    const [createdAt, setCreatedAt] = useState([null, null]);

    const {
        data: tagsData,
        fetchNextPage,
        hasNextPage,
        isLoading: isTagsLoading,
        isError: isTagsError,
        error: tagsError,
        isFetchingNextPage,
    } = useInfiniteQuery(
        ['tags'],
        ({ pageParam = 1 }) => tagActions.getTags({ page: pageParam }).then((response) => response.data),
        {
            getNextPageParam: (lastPage) => {
                const { current_page, last_page } = lastPage;
                return current_page < last_page ? current_page + 1 : undefined;
            },
            staleTime: 1000 * 60 * 5,
        }
    );

    const availableTags = tagsData?.pages.flatMap((page) => page.data.map((tag) => tag.name)).sort() || [];

    const handleTagToggle = (tag) => {
        setTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        );
    };

    const handleResetFilters = () => {
        setSort('-created_at');
        setTags([]);
        setTitle('');
        setContent('');
        setUsername('');
        setVisibility('public');
        setCommentsEnabled(true);
        setLikesCount([0, 1000]);
        setCommentsCount([0, 500]);
        setViewsCount([0, 10000]);
        setCreatedAt([null, null]);
        onApplyFilters('');
        if (isMobile && onClose) {
            onClose();
        }
    };

    const handleApplyFilters = () => {
        const queryParams = [];
        if (sort) {
            queryParams.push(`sort=-${sort}`);
        }
        if (tags.length > 0) {
            tags.forEach(tag => queryParams.push(`filter[tags][]=${encodeURIComponent(tag)}`));
        }
        if (title) {
            queryParams.push(`filter[title]=${encodeURIComponent(title)}`);
        }
        if (content) {
            queryParams.push(`filter[content]=${encodeURIComponent(content)}`);
        }
        if (username) {
            queryParams.push(`filter[user.username]=${encodeURIComponent(username)}`);
        }
        queryParams.push(`filter[visibility]=${visibility}`);
        queryParams.push(`filter[comments_enabled]=${commentsEnabled ? 1 : 0}`);
        if (likesCount[0] !== 0 || likesCount[1] !== 1000) {
            queryParams.push(`filter[likes_count][from]=${likesCount[0]}`);
            queryParams.push(`filter[likes_count][to]=${likesCount[1]}`);
        }
        if (commentsCount[0] !== 0 || commentsCount[1] !== 500) {
            queryParams.push(`filter[comments_count][from]=${commentsCount[0]}`);
            queryParams.push(`filter[comments_count][to]=${commentsCount[1]}`);
        }
        if (viewsCount[0] !== 0 || viewsCount[1] !== 10000) {
            queryParams.push(`filter[views_count][from]=${viewsCount[0]}`);
            queryParams.push(`filter[views_count][to]=${viewsCount[1]}`);
        }
        if (createdAt[0]) {
            queryParams.push(`filter[created_at][from]=${format(createdAt[0], 'yyyy-MM-dd')}`);
        }
        if (createdAt[1]) {
            queryParams.push(`filter[created_at][to]=${format(createdAt[1], 'yyyy-MM-dd')}`);
        }

        const queryString = queryParams.join('&');
        onApplyFilters(queryString);
        if (isMobile && onClose) {
            onClose();
        }
    };

    return (
        <Paper
            sx={{
                backdropFilter: 'blur(12px)',
                borderRadius: 2,
                p: isMobile ? 1 : 2,
                mb: isMobile ? 0 : 2,
                border: isMobile ? 'none' : '1px solid rgba(156, 39, 176, 0.2)',
                background: 'rgba(10, 10, 15, 0.9)',
                boxShadow: isMobile ? '0 2px 10px rgba(0, 0, 0, 0.2)' : '0 4px 20px rgba(0, 0, 0, 0.3)',
                width: isMobile ? '100%' : 'auto',
                maxWidth: isMobile ? '100%' : 320,
                mx: isMobile ? 'auto' : 0,
                boxSizing: 'border-box',
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': { display: 'none' },
            }}
        >
            <Box sx={{ background: 'rgba(10, 10, 15, 1)', pt: 1, pb: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <FilterList sx={{ mr: 1, color: '#9c27b0', fontSize: 24 }} />
                    <Typography variant="subtitle2" sx={{ color: '#ffffff', fontWeight: 600 }}>
                        Фільтри
                    </Typography>
                    {isMobile && onClose && (
                        <IconButton
                            onClick={onClose}
                            sx={{
                                ml: 'auto',
                                color: '#ff4081',
                                padding: '8px',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 64, 129, 0.2)',
                                },
                            }}
                        >
                            <Close fontSize="medium" />
                        </IconButton>
                    )}
                </Box>
            </Box>
            <Box
                sx={{
                    maxHeight: isMobile ? 'calc(90vh - 64px)' : 'auto',
                    overflowY: isMobile ? 'auto' : 'visible',
                    px: isMobile ? 0.5 : 0,
                    width: '100%',
                    boxSizing: 'border-box',
                    scrollbarWidth: 'none',
                    '&::-webkit-scrollbar': { display: 'none' },
                }}
            >
                <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.12)', my: isMobile ? 1 : 1.5 }} />

                {/* Sort */}
                <Typography
                    variant="subtitle2"
                    sx={{
                        mb: 1,
                        fontWeight: 600,
                        background: 'linear-gradient(45deg, #9c27b0, #ff4081)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
                    }}
                >
                    Сортувати за
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: isMobile ? 1 : 1.5 }}>
                    <Button
                        startIcon={<Whatshot sx={{ color: sort === 'comments_count' ? '#ff4081' : '#e0e0e0', fontSize: 16 }} />}
                        onClick={() => setSort('comments_count')}
                        sx={{
                            justifyContent: 'flex-start',
                            color: sort === 'comments_count' ? '#ff4081' : '#e0e0e0',
                            bgcolor: sort === 'comments_count' ? 'rgba(255, 64, 129, 0.2)' : 'transparent',
                            borderRadius: 1,
                            py: 0.5,
                            fontSize: 14,
                            '&:hover': {
                                bgcolor: 'rgba(255, 64, 129, 0.1)',
                            },
                        }}
                    >
                        Популярне
                    </Button>
                    <Button
                        startIcon={<NewReleases sx={{ color: sort === '-created_at' ? '#ff4081' : '#e0e0e0', fontSize: 16 }} />}
                        onClick={() => setSort('-created_at')}
                        sx={{
                            justifyContent: 'flex-start',
                            color: sort === '-created_at' ? '#ff4081' : '#e0e0e0',
                            bgcolor: sort === '-created_at' ? 'rgba(255, 64, 129, 0.2)' : 'transparent',
                            borderRadius: 1,
                            py: 0.5,
                            fontSize: 14,
                            '&:hover': {
                                bgcolor: 'rgba(255, 64, 129, 0.1)',
                            },
                        }}
                    >
                        Нове
                    </Button>
                    <Button
                        startIcon={<TrendingUp sx={{ color: sort === 'likes_count' ? '#ff4081' : '#e0e0e0', fontSize: 16 }} />}
                        onClick={() => setSort('likes_count')}
                        sx={{
                            justifyContent: 'flex-start',
                            color: sort === 'likes_count' ? '#ff4081' : '#e0e0e0',
                            bgcolor: sort === 'likes_count' ? 'rgba(255, 64, 129, 0.2)' : 'transparent',
                            borderRadius: 1,
                            py: 0.5,
                            fontSize: 14,
                            '&:hover': {
                                bgcolor: 'rgba(255, 64, 129, 0.1)',
                            },
                        }}
                    >
                        Топ
                    </Button>
                    <Button
                        startIcon={<Visibility sx={{ color: sort === 'views_count' ? '#ff4081' : '#e0e0e0', fontSize: 16 }} />}
                        onClick={() => setSort('views_count')}
                        sx={{
                            justifyContent: 'flex-start',
                            color: sort === 'views_count' ? '#ff4081' : '#e0e0e0',
                            bgcolor: sort === 'views_count' ? 'rgba(255, 64, 129, 0.2)' : 'transparent',
                            borderRadius: 1,
                            py: 0.5,
                            fontSize: 14,
                            '&:hover': {
                                bgcolor: 'rgba(255, 64, 129, 0.1)',
                            },
                        }}
                    >
                        Перегляди
                    </Button>
                </Box>

                {/* Tags */}
                <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.12)', my: isMobile ? 1 : 1.5 }} />
                <Typography
                    variant="subtitle2"
                    sx={{
                        mb: 1,
                        fontWeight: 600,
                        background: 'linear-gradient(45deg, #9c27b0, #ff4081)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
                    }}
                >
                    Теги
                </Typography>
                <Box
                    sx={{
                        maxHeight: 100,
                        overflowY: 'auto',
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 1,
                        mb: isMobile ? 1 : 1.5,
                        pr: isMobile ? 0.5 : 1,
                        width: '100%',
                        boxSizing: 'border-box',
                        scrollbarWidth: 'none',
                        '&::-webkit-scrollbar': { display: 'none' },
                    }}
                >
                    {isTagsLoading && !availableTags.length ? (
                        <Typography variant="caption" sx={{ color: '#e0e0e0', m: 2 }}>
                            Завантаження тегів...
                        </Typography>
                    ) : isTagsError ? (
                        <Typography variant="caption" sx={{ color: '#ff4081', m: 2 }}>
                            Помилка: {tagsError?.response?.data?.message || 'Не вдалося завантажити теги'}
                        </Typography>
                    ) : availableTags.length > 0 ? (
                        availableTags.map((tag) => (
                            <Chip
                                key={tag}
                                label={'# ' + tag}
                                clickable
                                onClick={() => handleTagToggle(tag)}
                                sx={{
                                    fontSize: 12,
                                    height: 26,
                                    color: tags.includes(tag) ? '#ff4081' : '#e0e0e0',
                                    bgcolor: tags.includes(tag) ? 'rgba(255, 64, 129, 0.2)' : 'rgba(156, 39, 176, 0.2)',
                                    '&:hover': {
                                        bgcolor: tags.includes(tag) ? 'rgba(255, 64, 129, 0.3)' : 'rgba(156, 39, 176, 0.3)',
                                    },
                                }}
                            />
                        ))
                    ) : (
                        <Typography variant="caption" sx={{ color: '#e0e0e0', m: 2 }}>
                            Немає доступних тегів
                        </Typography>
                    )}
                    {hasNextPage && (
                        <Chip
                            label={isFetchingNextPage ? 'Завантаження...' : 'Завантажити ще'}
                            onClick={() => fetchNextPage()}
                            disabled={isFetchingNextPage}
                            sx={{
                                fontSize: 12,
                                height: 26,
                                color: '#e0e0e0',
                                bgcolor: 'rgba(156, 39, 176, 0.2)',
                                '&:hover': {
                                    bgcolor: 'rgba(156, 39, 176, 0.3)',
                                },
                            }}
                        />
                    )}
                </Box>

                {/* Search */}
                <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.12)', my: isMobile ? 1 : 1.5 }} />
                <Typography
                    variant="subtitle2"
                    sx={{
                        mb: 1,
                        fontWeight: 600,
                        background: 'linear-gradient(45deg, #9c27b0, #ff4081)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
                    }}
                >
                    Пошук
                </Typography>
                <TextField
                    size="small"
                    placeholder="Заголовок"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    fullWidth
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search sx={{ color: '#e0e0e0', fontSize: 18 }} />
                            </InputAdornment>
                        ),
                    }}
                    sx={{
                        mb: isMobile ? 1 : 1.5,
                        transition: 'all 0.3s ease',
                        '& .MuiInputBase-root': {
                            bgcolor: 'rgba(255, 255, 255, 0.05)',
                            color: '#e0e0e0',
                            borderRadius: 1,
                            fontSize: 14,
                            border: '1px solid rgba(156, 39, 176, 0.3)',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                            boxSizing: 'border-box',
                            '&:hover': {
                                borderColor: 'rgba(255, 64, 129, 0.4)',
                            },
                            '&.Mui-focused': {
                                borderColor: 'rgba(255, 64, 129, 0.5)',
                                boxShadow: '0 0 10px rgba(255, 64, 129, 0.3)',
                                transform: 'scale(1.02)',
                            },
                        },
                        '& .MuiInputBase-input': { py: 1 },
                        '& .MuiInputBase-input::placeholder': {
                            color: 'rgba(224, 224, 224, 0.5)',
                            opacity: 1,
                        },
                    }}
                />
                <TextField
                    size="small"
                    placeholder="Вміст"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    fullWidth
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Description sx={{ color: '#e0e0e0', fontSize: 18 }} />
                            </InputAdornment>
                        ),
                    }}
                    sx={{
                        mb: isMobile ? 1 : 1.5,
                        transition: 'all 0.3s ease',
                        '& .MuiInputBase-root': {
                            bgcolor: 'rgba(255, 255, 255, 0.05)',
                            color: '#e0e0e0',
                            borderRadius: 1,
                            fontSize: 14,
                            border: '1px solid rgba(156, 39, 176, 0.3)',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                            boxSizing: 'border-box',
                            '&:hover': {
                                borderColor: 'rgba(255, 64, 129, 0.4)',
                            },
                            '&.Mui-focused': {
                                borderColor: 'rgba(255, 64, 129, 0.5)',
                                boxShadow: '0 0 10px rgba(255, 64, 129, 0.3)',
                                transform: 'scale(1.02)',
                            },
                        },
                        '& .MuiInputBase-input': { py: 1 },
                        '& .MuiInputBase-input::placeholder': {
                            color: 'rgba(224, 224, 224, 0.5)',
                            opacity: 1,
                        },
                    }}
                />
                <TextField
                    size="small"
                    placeholder="Ім'я користувача"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    fullWidth
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Person sx={{ color: '#e0e0e0', fontSize: 18 }} />
                            </InputAdornment>
                        ),
                    }}
                    sx={{
                        mb: isMobile ? 1 : 1.5,
                        transition: 'all 0.3s ease',
                        '& .MuiInputBase-root': {
                            bgcolor: 'rgba(255, 255, 255, 0.05)',
                            color: '#e0e0e0',
                            borderRadius: 1,
                            fontSize: 14,
                            border: '1px solid rgba(156, 39, 176, 0.3)',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                            boxSizing: 'border-box',
                            '&:hover': {
                                borderColor: 'rgba(255, 64, 129, 0.4)',
                            },
                            '&.Mui-focused': {
                                borderColor: 'rgba(255, 64, 129, 0.5)',
                                boxShadow: '0 0 10px rgba(255, 64, 129, 0.3)',
                                transform: 'scale(1.02)',
                            },
                        },
                        '& .MuiInputBase-input': { py: 1 },
                        '& .MuiInputBase-input::placeholder': {
                            color: 'rgba(224, 224, 224, 0.5)',
                            opacity: 1,
                        },
                    }}
                />

                {/* Visibility and Comments */}
                <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.12)', my: isMobile ? 1 : 1.5 }} />
                <Typography
                    variant="subtitle2"
                    sx={{
                        mb: 1,
                        fontWeight: 600,
                        background: 'linear-gradient(45deg, #9c27b0, #ff4081)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
                    }}
                >
                    Налаштування
                </Typography>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1,
                        mb: isMobile ? 1 : 1.5,
                        width: '100%',
                        boxSizing: 'border-box',
                    }}
                >
                    <FormControl>
                        <Typography variant="caption" sx={{ color: '#e0e0e0', mb: 0.5 }}>
                            Видимість
                        </Typography>
                        <RadioGroup
                            row
                            value={visibility}
                            onChange={(e) => setVisibility(e.target.value)}
                            sx={{ gap: 1 }}
                        >
                            <FormControlLabel
                                value="public"
                                control={<Radio size="small" sx={{ color: '#e0e0e0', '&.Mui-checked': { color: '#ff4081' } }} />}
                                label="Публічний"
                                sx={{ color: '#e0e0e0', '& .MuiTypography-root': { fontSize: 12 } }}
                            />
                            <FormControlLabel
                                value="friends"
                                control={<Radio size="small" sx={{ color: '#e0e0e0', '&.Mui-checked': { color: '#ff4081' } }} />}
                                label="Друзі"
                                sx={{ color: '#e0e0e0', '& .MuiTypography-root': { fontSize: 12 } }}
                            />
                            <FormControlLabel
                                value="private"
                                control={<Radio size="small" sx={{ color: '#e0e0e0', '&.Mui-checked': { color: '#ff4081' } }} />}
                                label="Приватний"
                                sx={{ color: '#e0e0e0', '& .MuiTypography-root': { fontSize: 12 } }}
                            />
                        </RadioGroup>
                    </FormControl>
                    <FormControlLabel
                        control={
                            <Switch
                                size="small"
                                checked={commentsEnabled}
                                onChange={() => setCommentsEnabled(!commentsEnabled)}
                                sx={{
                                    '& .MuiSwitch-track': { bgcolor: 'rgba(156, 39, 176, 0.5)' },
                                    '& .MuiSwitch-thumb': { bgcolor: commentsEnabled ? '#ff4081' : '#e0e0e0' },
                                }}
                            />
                        }
                        label="Коментарі"
                        sx={{ color: '#e0e0e0', '& .MuiTypography-root': { fontSize: 12 } }}
                    />
                </Box>

                {/* Range Filters */}
                <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.12)', my: isMobile ? 1 : 1.5 }} />
                <Typography
                    variant="subtitle2"
                    sx={{
                        mb: 1,
                        fontWeight: 600,
                        background: 'linear-gradient(45deg, #9c27b0, #ff4081)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
                    }}
                >
                    Діапазони
                </Typography>
                <Grid
                    container
                    spacing={1.5}
                    sx={{
                        mb: isMobile ? 1 : 1.5,
                        width: '100%',
                        boxSizing: 'border-box',
                        pl: isMobile ? 0.5 : 0, // Added slight left padding for mobile
                    }}
                >
                    <Grid item xs={12}>
                        <Typography variant="caption" sx={{ color: '#e0e0e0', display: 'block', mb: 0.5 }}>
                            Лайки: {likesCount[0]}-{likesCount[1]}
                        </Typography>
                        <Slider
                            size="small"
                            value={likesCount}
                            onChange={(e, newValue) => setLikesCount(newValue)}
                            min={0}
                            max={1000}
                            sx={{
                                color: '#9c27b0',
                                '& .MuiSlider-thumb': { bgcolor: '#ff4081', width: 10, height: 10 },
                                '& .MuiSlider-track': { bgcolor: '#ff4081' },
                                height: 4,
                                width: '100%',
                                boxSizing: 'border-box',
                            }}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="caption" sx={{ color: '#e0e0e0', display: 'block', mb: 0.5 }}>
                            Коментарі: {commentsCount[0]}-{commentsCount[1]}
                        </Typography>
                        <Slider
                            size="small"
                            value={commentsCount}
                            onChange={(e, newValue) => setCommentsCount(newValue)}
                            min={0}
                            max={500}
                            sx={{
                                color: '#9c27b0',
                                '& .MuiSlider-thumb': { bgcolor: '#ff4081', width: 10, height: 10 },
                                '& .MuiSlider-track': { bgcolor: '#ff4081' },
                                height: 4,
                                width: '100%',
                                boxSizing: 'border-box',
                            }}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="caption" sx={{ color: '#e0e0e0', display: 'block', mb: 0.5 }}>
                            Перегляди: {viewsCount[0]}-{viewsCount[1]}
                        </Typography>
                        <Slider
                            size="small"
                            value={viewsCount}
                            onChange={(e, newValue) => setViewsCount(newValue)}
                            min={0}
                            max={10000}
                            sx={{
                                color: '#9c27b0',
                                '& .MuiSlider-thumb': { bgcolor: '#ff4081', width: 10, height: 10 },
                                '& .MuiSlider-track': { bgcolor: '#ff4081' },
                                height: 4,
                                width: '100%',
                                boxSizing: 'border-box',
                            }}
                        />
                    </Grid>
                </Grid>

                {/* Date Filters */}
                <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.12)', my: isMobile ? 1 : 1.5 }} />
                <Typography
                    variant="subtitle2"
                    sx={{
                        mb: 1,
                        fontWeight: 600,
                        background: 'linear-gradient(45deg, #9c27b0, #ff4081)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
                    }}
                >
                    Дати
                </Typography>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <Grid
                        container
                        spacing={1.5}
                        sx={{
                            mb: isMobile ? 1 : 1.5,
                            width: '100%',
                            boxSizing: 'border-box',
                        }}
                    >
                        <Grid item xs={12}>
                            <DatePicker
                                label="Створено від"
                                value={createdAt[0]}
                                onChange={(newValue) => setCreatedAt([newValue, createdAt[1]])}
                                enableAccessibleFieldDOMStructure={false}
                                slots={{
                                    textField: (params) => (
                                        <TextField
                                            {...params}
                                            size="small"
                                            sx={{
                                                '& .MuiInputBase-root': {
                                                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                                                    color: '#e0e0e0',
                                                    borderRadius: 1,
                                                    fontSize: 14,
                                                    border: '1px solid rgba(156, 39, 176, 0.2)',
                                                    boxSizing: 'border-box',
                                                    pr: 2,
                                                },
                                                '& .MuiInputBase-input': { py: 1 },
                                                '& .MuiInputLabel-root': {
                                                    color: '#e0e0e0',
                                                    fontSize: 12,
                                                },
                                            }}
                                        />
                                    ),
                                }}
                                slotProps={{
                                    popper: {
                                        sx: {
                                            '& .MuiPaper-root': {
                                                background: 'rgba(10, 10, 15, 0.9)',
                                                color: '#e0e0e0',
                                                border: '1px solid rgba(156, 39, 176, 0.2)',
                                                '& .MuiPickersDay-root': {
                                                    color: '#e0e0e0',
                                                    '&.Mui-selected': {
                                                        background: '#ff4081',
                                                        color: '#ffffff',
                                                    },
                                                },
                                                '& .MuiTypography-root': {
                                                    color: '#e0e0e0',
                                                },
                                            },
                                        },
                                    },
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <DatePicker
                                label="Створено до"
                                value={createdAt[1]}
                                onChange={(newValue) => setCreatedAt([createdAt[0], newValue])}
                                enableAccessibleFieldDOMStructure={false}
                                slots={{
                                    textField: (params) => (
                                        <TextField
                                            {...params}
                                            size="small"
                                            sx={{
                                                '& .MuiInputBase-root': {
                                                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                                                    color: '#e0e0e0',
                                                    borderRadius: 1,
                                                    fontSize: 14,
                                                    border: '1px solid rgba(156, 39, 176, 0.2)',
                                                    boxSizing: 'border-box',
                                                    pr: 2,
                                                },
                                                '& .MuiInputBase-input': { py: 1 },
                                                '& .MuiInputLabel-root': {
                                                    color: '#e0e0e0',
                                                    fontSize: 12,
                                                },
                                            }}
                                        />
                                    ),
                                }}
                                slotProps={{
                                    popper: {
                                        sx: {
                                            '& .MuiPaper-root': {
                                                background: 'rgba(10, 10, 15, 0.9)',
                                                color: '#e0e0e0',
                                                border: '1px solid rgba(156, 39, 176, 0.2)',
                                                '& .MuiPickersDay-root': {
                                                    color: '#e0e0e0',
                                                    '&.Mui-selected': {
                                                        background: '#ff4081',
                                                        color: '#ffffff',
                                                    },
                                                },
                                                '& .MuiTypography-root': {
                                                    color: '#e0e0e0',
                                                },
                                            },
                                        },
                                    },
                                }}
                            />
                        </Grid>
                    </Grid>
                </LocalizationProvider>

                {/* Apply and Reset Filters Buttons */}
                <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.12)', my: isMobile ? 1 : 1.5 }} />
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Button
                        variant="outlined"
                        fullWidth
                        onClick={handleResetFilters}
                        sx={{
                            mb: 1,
                            color: '#e0e0e0',
                            borderColor: 'rgba(156, 39, 176, 0.3)',
                            py: 1,
                            borderRadius: 1,
                            fontSize: 14,
                            fontWeight: 600,
                            boxSizing: 'border-box',
                            '&:hover': {
                                borderColor: 'rgba(255, 64, 129, 0.4)',
                                backgroundColor: 'rgba(255, 64, 129, 0.1)',
                            },
                        }}
                    >
                        Скинути
                    </Button>
                </motion.div>
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={handleApplyFilters}
                        startIcon={<CheckCircle sx={{ fontSize: 18 }} />}
                        sx={{
                            bgcolor: '#9c27b0',
                            color: '#e0e0e0',
                            py: 1,
                            borderRadius: 1,
                            fontSize: 14,
                            fontWeight: 600,
                            boxShadow: '0 0 10px rgba(156, 39, 176, 0.5)',
                            boxSizing: 'border-box',
                            '&:hover': {
                                bgcolor: '#7b1fa2',
                                boxShadow: '0 0 15px rgba(156, 39, 176, 0.7)',
                            },
                            '@keyframes pulse': {
                                '0%': { boxShadow: '0 0 0 0 rgba(156, 39, 176, 0.7)' },
                                '70%': { boxShadow: '0 0 0 10px rgba(156, 39, 176, 0)' },
                                '100%': { boxShadow: '0 0 0 0 rgba(156, 39, 176, 0)' },
                            },
                            animation: 'pulse 2s infinite',
                        }}
                    >
                        Застосувати
                    </Button>
                </motion.div>
            </Box>
        </Paper>
    );
};

export default PostsFilter;
