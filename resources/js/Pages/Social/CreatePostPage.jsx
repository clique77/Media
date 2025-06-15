import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  Modal,
  Select,
  Switch,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { CheckCircle, Close, Visibility } from '@mui/icons-material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useMutation, useInfiniteQuery } from 'react-query';
import PostCard from '@/Components/Social/PostCard.jsx';
import { postActions, tagActions } from '@/api/actions';
import { useAuth } from '@/Components/Auth/AuthProvider.jsx';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ErrorMessage from "@/Components/Social/ErrorMessage.jsx";

const stars = [...Array(20)].map((_, i) => ({
  id: i,
  size: Math.random() * 3 + 1,
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  duration: Math.random() * 3 + 2,
  delay: Math.random() * 5,
}));

const PostCreatePage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [commentsEnabled, setCommentsEnabled] = useState(true);
  const [selectedTags, setSelectedTags] = useState([]);
  const [media, setMedia] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [openPreview, setOpenPreview] = useState(false);
  const [customTags, setCustomTags] = useState([]);

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

  const fetchedTags = tagsData?.pages.flatMap((page) => page.data.map((tag) => tag.name)).sort() || [];
  const availableTags = [...new Set([...customTags, ...fetchedTags])];

  const createPostMutation = useMutation(postActions.createPost, {
    onSuccess: (response) => {
      toast.success('Пост успішно створено!');
      navigate(`/posts/${response.data.data.slug}`);
    },
    onError: (error) => {
      console.log(error);
      toast.error(error.response?.data?.error || Object.values(error.response?.data?.errors || {}).flat().join('\n') || 'Помилка створення поста');
    },
  });

  const handleAddTag = () => {
    const trimmedTag = newTag.trim().toLowerCase();
    if (trimmedTag.length < 3 || trimmedTag.length > 20) {
      toast.error('Тег має бути від 3 до 20 символів');
      return;
    }
    if (!/^[a-zа-яґєії0-9]+$/.test(trimmedTag)) {
      toast.error('Тег може містити лише літери (українські або латинські) та цифри');
      return;
    }
    if (availableTags.includes(trimmedTag) || selectedTags.includes(trimmedTag)) {
      toast.error('Тег уже існує');
      return;
    }
    setCustomTags([trimmedTag, ...customTags]);
    setNewTag('');
  };

  const handleTagToggle = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else if (selectedTags.length < 5) {
      setSelectedTags([...selectedTags, tag]);
    } else {
      toast.error('Максимум 5 тегів');
    }
  };

  const handleMediaUpload = (event) => {
    const files = Array.from(event.target.files || event.dataTransfer?.files || []);
    const validFiles = files.filter((file) => {
      const isValidType = ['image/jpeg', 'image/png', 'video/mp4'].includes(file.type);
      const isValidSize = file.size <= 50 * 1024 * 1024;
      if (!isValidType) toast.error(`Непідтримуваний формат: ${file.name}`);
      if (!isValidSize) toast.error(`Файл занадто великий: ${file.name}`);
      return isValidType && isValidSize;
    });

    if (media.length + validFiles.length > 5) {
      toast.error('Максимум 5 файлів');
      return;
    }

    const newMedia = [...media, ...validFiles];
    const newPreviews = [
      ...mediaPreviews,
      ...validFiles.map((file) => ({
        url: URL.createObjectURL(file),
        type: file.type.startsWith('image') ? 'image' : 'video',
      })),
    ];

    setMedia(newMedia);
    setMediaPreviews(newPreviews);
  };

  const handleMediaRemove = (index) => {
    const newMedia = media.filter((_, i) => i !== index);
    const newPreviews = mediaPreviews.filter((_, i) => i !== index);
    setMedia(newMedia);
    setMediaPreviews(newPreviews);
  };

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'instant',
    });
  }, []);

  const handleSubmit = () => {
    if (title.length < 3 || title.length > 36) {
      toast.error('Заголовок має бути від 3 до 36 символів');
      return;
    }
    if (content.replace(/<(.|\n)*?>/g, '').length > 564) {
      toast.error('Вміст не може перевищувати 564 символів');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('visibility', visibility);
    formData.append('comments_enabled', commentsEnabled ? 1 : 0);
    selectedTags.forEach((tag) => formData.append('tags[]', tag));
    media.forEach((file) => formData.append('attachments[]', file));

    createPostMutation.mutate(formData);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.style.backgroundColor = 'rgba(156, 39, 176, 0.2)';
  };

  const handleDragLeave = (e) => {
    e.currentTarget.style.backgroundColor = 'transparent';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.style.backgroundColor = 'transparent';
    handleMediaUpload(e);
  };

  const previewPost = {
    id: 'preview',
    title: title || 'Ваш заголовок',
    content: content || '<p>Ваш вміст з\'явиться тут...</p>',
    user: {
      id: user?.id || 0,
      username: user?.username || 'Anonymous',
      avatar: user?.avatar || `https://i.pravatar.cc/150?img=${user?.id || 0}`,
    },
attachments: mediaPreviews,
    likes_count: 0,
    comments_count: 0,
    views_count: 0,
    created_at: new Date().toISOString(),
    slug: 'Попередній перегляд',
    tags: selectedTags,
    visibility,
    comments_enabled: commentsEnabled,
};

const quillStyles = `
    .ql-container {
      background: rgba(10, 10, 15, 0.9);
      border: 1px solid rgba(156, 39, 176, 0.3);
      border-radius: 4px;
      color: #e0e0e0;
      font-size: 0.9rem;
      backdrop-filter: blur(15px);
      outline: none;
    }
    .ql-editor {
      min-height: 150px;
      padding: 12px;
      color: #e0e0e0;
      outline: none;
    }
    .ql-editor.ql-blank::before {
      content: "Введіть вміст вашого поста...";
      color: rgba(224, 224, 224, 0.5);
      font-style: italic;
      pointer-events: none;
      position: absolute;
    }
    .ql-container:focus, .ql-editor:focus {
      border: 1px solid #ff4081;
      border-radius: 4px;
      box-shadow: 0 0 10px rgba(255, 64, 129, 0.3);
      outline: none;
    }
    .ql-toolbar {
      background: rgba(10, 10, 15, 0.9);
      border: 1px solid rgba(156, 39, 176, 0.3);
      border-bottom: none;
      border-radius: 4px 4px 0 0;
      backdrop-filter: blur(15px);
    }
    .ql-toolbar .ql-formats {
      margin-right: 8px;
    }
    .ql-toolbar .ql-stroke {
      stroke: #e0e0e0;
    }
    .ql-toolbar .ql-fill {
      fill: #e0e0e0;
    }
    .ql-toolbar .ql-picker {
      color: #e0e0e0;
      font-size: 0.8rem;
    }
    .ql-toolbar .ql-active .ql-stroke,
    .ql-toolbar .ql-active .ql-fill {
      stroke: #ff4081;
      fill: #ff4081;
    }
    .ql-toolbar .ql-picker-label:hover,
    .ql-toolbar .ql-picker-item:hover {
      color: #ff4081;
    }
    .ql-editor a {
      color: #ff4081;
    }
  `;

if (!isAuthenticated) {
    const message = 'Будь ласка, увійдіть в обліковий запис, щоб створити пост.'
    return <ErrorMessage message={message} isMobile={isMobile}/>
}

return (
    <Box sx={{ minHeight: '100vh', pt: 4, pb: 8, position: 'relative', overflow: 'hidden' }}>
        {stars.map((star) => (
            <motion.div
                key={star.id}
                style={{
                    position: 'absolute',
                    backgroundColor: '#fff',
                    borderRadius: '50%',
                    width: `${star.size}px`,
                    height: `${star.size}px`,
                    left: star.left,
                    top: star.top,
                    opacity: 0,
                }}
                animate={{ opacity: [0, 0.8, 0], scale: [1, 1.5, 1] }}
                transition={{
                    duration: star.duration,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    delay: star.delay,
                }}
            />
        ))}

        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Grid container spacing={4}>
                    {!isMobile && (
                        <Grid item md={5} lg={4}>
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.4 }}
                            >
                                <Box
                                    sx={{
                                        position: 'sticky',
                                        top: 20,
                                        backdropFilter: 'blur(15px)',
                                        borderRadius: 2,
                                        p: 2,
                                        border: '1px solid rgba(156, 39, 176, 0.2)',
                                        background: 'rgba(10, 10, 15, 0.9)',
                                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                                    }}
                                >
                                    <Typography variant="h6" sx={{ color: '#ffffff', mb: 2, fontSize: '1rem' }}>
                                        Попередній перегляд
                                    </Typography>
                                    <PostCard post={previewPost} isClickable={false} previewMode={true} />
                                </Box>
                            </motion.div>
                        </Grid>
                    )}

                    <Grid item xs={12} md={7} lg={8}>
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4 }}
                        >
                            <Box
                                sx={{
                                    backdropFilter: 'blur(15px)',
                                    borderRadius: 2,
                                    p: { xs: 2, sm: 2.5, md: 3 },
                                    border: '1px solid rgba(156, 39, 176, 0.2)',
                                    background: 'rgba(10, 10, 15, 0.9)',
                                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                                }}
                            >
                                {isMobile && (
                                    <Button
                                        variant="outlined"
                                        startIcon={<Visibility />}
                                        onClick={() => setOpenPreview(true)}
                                        sx={{
                                            mb: 3,
                                            color: '#ff4081',
                                            borderColor: '#ff4081',
                                            borderRadius: 4,
                                            px: 3,
                                            py: 1,
                                            '&:hover': {
                                                background: 'rgba(255, 64, 129, 0.1)',
                                                borderColor: '#f50057',
                                                transform: 'scale(1.05)',
                                            },
                                            transition: 'all 0.3s',
                                        }}
                                    >
                                        Попередній перегляд
                                    </Button>
                                )}

                                <TextField
                                    fullWidth
                                    label="Заголовок"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    sx={{
                                        mb: 3,
                                        '& .MuiInputBase-root': {
                                            bgcolor: 'rgba(255, 255, 255, 0.05)',
                                            color: '#e0e0e0',
                                            borderRadius: 4,
                                            border: '1px solid rgba(156, 39, 176, 0.3)',
                                            backdropFilter: 'blur(15px)',
                                            transition: 'all 0.3s',
                                            '&:hover': { borderColor: 'rgba(255, 64, 129, 0.4)' },
                                            '&.Mui-focused': {
                                                border: '1px solid #ff4081',
                                                borderRadius: 4,
                                                '&:hover': { borderColor: 'rgba(0, 0, 0, 0)' },
                                                boxShadow: '0 0 10px rgba(255, 64, 129, 0.3)',
                                                outline: 'none',
                                            },
                                        },
                                        '& .MuiInputLabel-root': { color: '#e0e0e0', fontSize: '0.9rem' },
                                        '& .Mui-focused .MuiInputLabel-root': { color: '#ff4081' },
                                    }}
                                />

                                <Typography variant="subtitle2" sx={{ color: '#e0e0e0', mb: 1, fontSize: '0.9rem' }}>
                                    Вміст
                                </Typography>
                                <style>{quillStyles}</style>
                                <ReactQuill
                                    value={content}
                                    onChange={setContent}
                                    modules={{
                                        toolbar: [
                                            ['bold', 'italic', 'underline'],
                                            ['link'],
                                            [{ list: 'ordered' }, { list: 'bullet' }],
                                        ],
                                    }}
                                    formats={['bold', 'italic', 'underline', 'link', 'list', 'bullet']}
                                    theme="snow"
                                    style={{ marginBottom: '24px' }}
                                />

                                <Box
                                    sx={{
                                        border: '2px dashed rgba(156, 39, 176, 0.3)',
                                        borderRadius: 4,
                                        p: 2,
                                        textAlign: 'center',
                                        mb: 3,
                                        transition: 'all 0.3s',
                                        backdropFilter: 'blur(15px)',
                                        '&:hover': { borderColor: 'rgba(255, 64, 129, 0.4)' },
                                    }}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                >
                                    <Typography variant="body2" sx={{ color: '#e0e0e0', mb: 1, fontSize: '0.9rem' }}>
                                        Перетягніть файли (jpg, png, mp4) або
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        component="label"
                                        sx={{
                                            background: 'linear-gradient(to right, #9c27b0, #ff4081)',
                                            borderRadius: 4,
                                            px: 4,
                                            py: 1,
                                            '&:hover': {
                                                background: 'linear-gradient(to right, #7b1fa2, #f50057)',
                                                boxShadow: '0 0 20px rgba(255, 64, 129, 0.5)',
                                                transform: 'scale(1.05)',
                                            },
                                            transition: 'all 0.3s',
                                        }}
                                    >
                                        Вибрати файли
                                        <input
                                            type="file"
                                            hidden
                                            accept="image/jpeg,image/png,video/mp4"
                                            multiple
                                            onChange={handleMediaUpload}
                                        />
                                    </Button>
                                </Box>

                                {mediaPreviews.length > 0 && (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                                        {mediaPreviews.map((preview, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ duration: 0.3 }}
                                                style={{
                                                    position: 'relative',
                                                    width: 80,
                                                    height: 80,
                                                    borderRadius: 4,
                                                    overflow: 'hidden',
                                                    border: '1px solid rgba(156, 39, 176, 0.3)',
                                                }}
                                            >
                                                {preview.type === 'image' ? (
                                                    <img
                                                        src={preview.url}
                                                        alt="Preview"
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    <video
                                                        src={preview.url}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                        muted
                                                    />
                                                )}
                                                <IconButton
                                                    onClick={() => handleMediaRemove(index)}
                                                    sx={{
                                                        position: 'absolute',
                                                        top: 4,
                                                        right: 4,
                                                        bgcolor: 'rgba(0, 0, 0, 0.5)',
                                                        color: '#ff4081',
                                                        '&:hover': {
                                                            bgcolor: 'rgba(0, 0, 0, 0.7)',
                                                            transform: 'scale(1.1)',
                                                        },
                                                        p: 0.5,
                                                        transition: 'all 0.3s',
                                                    }}
                                                >
                                                    <Close fontSize="small" />
                                                </IconButton>
                                            </motion.div>
                                        ))}
                                    </Box>
                                )}

                                <FormControl fullWidth sx={{ mb: 3 }}>
                                    <Typography variant="subtitle2" sx={{ color: '#e0e0e0', mb: 1, fontSize: '0.9rem' }}>
                                        Видимість
                                    </Typography>
                                    <Select
                                        value={visibility}
                                        onChange={(e) => setVisibility(e.target.value)}
                                        sx={{
                                            bgcolor: 'rgba(255, 255, 255, 0.05)',
                                            color: '#e0e0e0',
                                            borderRadius: 4,
                                            border: '1px solid rgba(156, 39, 176, 0.3)',
                                            backdropFilter: 'blur(15px)',
                                            transition: 'all 0.3s',
                                            '& .MuiSelect-icon': { color: '#ff4081' },
                                            '&:hover': { borderColor: 'rgba(255, 64, 129, 0.4)' },
                                            '&.Mui-focused': {
                                                border: '1px solid #ff4081',
                                                borderRadius: 4,
                                                boxShadow: '0 0 10px rgba(255, 64, 129, 0.3)',
                                                outline: 'none',
                                            },
                                        }}
                                        MenuProps={{
                                            PaperProps: {
                                                sx: {
                                                    bgcolor: 'rgba(10, 10, 15, 0.9)',
                                                    backdropFilter: 'blur(15px)',
                                                    border: '1px solid rgba(156, 39, 176, 0.3)',
                                                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                                                    mt: 1,
                                                    '& .MuiMenuItem-root': {
                                                        color: '#e0e0e0',
                                                        fontSize: '0.9rem',
                                                        '&:hover': {
                                                            bgcolor: 'rgba(156, 39, 176, 0.2)',
                                                        },
                                                        '&.Mui-selected': {
                                                            bgcolor: 'rgba(255, 64, 129, 0.2)',
                                                            '&:hover': {
                                                                bgcolor: 'rgba(255, 64, 129, 0.3)',
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        }}
                                    >
                                        <MenuItem value="public">Публічний</MenuItem>
                                        <MenuItem value="friends">Друзі</MenuItem>
                                        <MenuItem value="private">Приватний</MenuItem>
                                    </Select>
                                </FormControl>

                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={commentsEnabled}
                                            onChange={() => setCommentsEnabled(!commentsEnabled)}
                                            sx={{
                                                '& .MuiSwitch-track': {
                                                    background: 'linear-gradient(to right, #9c27b0, #ff4081)',
                                                    opacity: commentsEnabled ? 1 : 0.5,
                                                },
                                                '& .MuiSwitch-thumb': {
                                                    bgcolor: commentsEnabled ? '#ff4081' : '#e0e0e0',
                                                    width: 20,
                                                    height: 20,
                                                },
                                                '& .MuiSwitch-switchBase': {
                                                    top: 2,
                                                    '&.Mui-checked': { transform: 'translateX(16px)' },
                                                },
                                            }}
                                        />
                                    }
                                    label="Дозволити коментарі"
                                    sx={{ color: '#e0e0e0', mb: 3, fontSize: '0.9rem' }}
                                />

                                <Typography variant="subtitle2" sx={{ color: '#e0e0e0', mb: 1, fontSize: '0.9rem' }}>
                                    Додати новий тег
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                    <TextField
                                        fullWidth
                                        value={newTag}
                                        onChange={(e) => setNewTag(e.target.value)}
                                        placeholder="Введіть тег (3-20 символів)"
                                        sx={{
                                            '& .MuiInputBase-root': {
                                                bgcolor: 'rgba(255, 255, 255, 0.05)',
                                                color: '#e0e0e0',
                                                borderRadius: 4,
                                                border: '1px solid rgba(156, 39, 176, 0.3)',
                                                backdropFilter: 'blur(15px)',
                                                transition: 'all 0.3s',
                                                '&:hover': { borderColor: 'rgba(255, 64, 129, 0.4)' },
                                                '&.Mui-focused': {
                                                    border: '1px solid #ff4081',
                                                    borderRadius: 4,
                                                    boxShadow: '0 0 10px rgba(255, 64, 129, 0.3)',
                                                    outline: 'none',
                                                },
                                            },
                                            '& .MuiInputLabel-root': { color: '#e0e0e0', fontSize: '0.9rem' },
                                            '& .Mui-focused .MuiInputLabel-root': { color: '#ff4081' },
                                        }}
                                    />
                                    <Button
                                        variant="contained"
                                        onClick={handleAddTag}
                                        sx={{
                                            background: 'linear-gradient(to right, #9c27b0, #ff4081)',
                                            borderRadius: 4,
                                            px: 3,
                                            py: 1,
                                            '&:hover': {
                                                background: 'linear-gradient(to right, #7b1fa2, #f50057)',
                                                boxShadow: '0 0 20px rgba(255, 64, 129, 0.5)',
                                                transform: 'scale(1.05)',
                                            },
                                            transition: 'all 0.3s',
                                        }}
                                    >
                                        Додати
                                    </Button>
                                </Box>

                                <Typography variant="subtitle2" sx={{ color: '#e0e0e0', mb: 1, fontSize: '0.9rem' }}>
                                    Теги (до 5)
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3, alignItems: 'center' }}>
                                    {isTagsLoading && !fetchedTags.length ? (
                                        <CircularProgress size={24} sx={{ color: '#ff4081', m: 2 }} />
                                    ) : isTagsError ? (
                                        <Typography variant="caption" sx={{ color: '#ff4081', m: 2 }}>
                                            Помилка: {tagsError?.response?.data?.message || 'Не вдалося завантажити теги'}
                                        </Typography>
                                    ) : availableTags.length > 0 ? (
                                        availableTags.map((tag) => (
                                            <Chip
                                                key={tag}
                                                label={`# ${tag}`}
                                                onClick={() => handleTagToggle(tag)}
                                                sx={{
                                                    bgcolor: selectedTags.includes(tag)
                                                        ? 'linear-gradient(to right, #ff4081, #9c27b0)'
                                                        : 'rgba(156, 39, 176, 0.2)',
                                                    color: selectedTags.includes(tag) ? '#ffffff' : '#e0e0e0',
                                                    fontSize: '0.8rem',
                                                    borderRadius: 4,
                                                    '&:hover': {
                                                        bgcolor: selectedTags.includes(tag)
                                                            ? 'linear-gradient(to right, #f50057, #7b1fa2)'
                                                            : 'rgba(156, 39, 176, 0.3)',
                                                        transform: 'scale(1.1)',
                                                    },
                                                    transition: 'all 0.3s',
                                                }}
                                            />
                                        ))
                                    ) : (
                                        <Typography variant="caption" sx={{ color: '#e0e0e0', m: 2 }}>
                                            Теги відсутні
                                        </Typography>
                                    )}
                                    {hasNextPage && (
                                        <Chip
                                            label={isFetchingNextPage ? <CircularProgress size={16} sx={{ color: '#ff4081' }} /> : 'Завантажити ще'}
                                            onClick={() => fetchNextPage()}
                                            disabled={isFetchingNextPage}
                                            sx={{
                                                bgcolor: 'linear-gradient(to right, #9c27b0, #ff4081)',
                                                color: '#ffffff',
                                                fontSize: '0.8rem',
                                                borderRadius: 4,
                                                border: '1px solid #ff4081',
                                                px: 2,
                                                '&:hover': {
                                                    bgcolor: 'linear-gradient(to right, #7b1fa2, #f50057)',
                                                    transform: 'scale(1.1)',
                                                },
                                                '&:disabled': {
                                                    bgcolor: 'rgba(156, 39, 176, 0.3)',
                                                    color: 'rgba(255, 255, 255, 0.5)',
                                                    border: '1px solid rgba(255, 64, 129, 0.3)',
                                                },
                                                transition: 'all 0.3s',
                                            }}
                                        />
                                    )}
                                </Box>

                                <Button
                                    variant="contained"
                                    startIcon={<CheckCircle />}
                                    onClick={handleSubmit}
                                    disabled={createPostMutation.isLoading}
                                    sx={{
                                        background: 'linear-gradient(to right, #9c27b0, #ff4081)',
                                        color: '#ffffff',
                                        fontWeight: 600,
                                        px: 4,
                                        py: 1.5,
                                        borderRadius: 4,
                                        width: '100%',
                                        textTransform: 'none',
                                        '&:hover': {
                                            background: 'linear-gradient(to right, #7b1fa2, #f50057)',
                                            boxShadow: '0 0 20px rgba(255, 64, 129, 0.5)',
                                            transform: 'scale(1.05)',
                                        },
                                        '&:disabled': {
                                            background: 'rgba(156, 39, 176, 0.3)',
                                            color: 'rgba(255, 255, 255, 0.5)',
                                        },
                                        transition: 'all 0.3s',
                                    }}
                                >
                                    {createPostMutation.isLoading ? (
                                        <CircularProgress size={24} sx={{ color: '#ffffff' }} />
                                    ) : (
                                        'Опублікувати'
                                    )}
                                </Button>
                            </Box>
                        </motion.div>
                    </Grid>
                </Grid>
            </motion.div>
        </Container>

        <Modal
            open={openPreview}
            onClose={() => setOpenPreview(false)}
            sx={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
                backdropFilter: 'blur(5px)',
                overflowY: 'auto',
                padding: { xs: '8px', sm: '16px' },
                minHeight: '100vh',
                boxSizing: 'border-box',
            }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                style={{
                    width: '100%',
                    maxWidth: '600px',
                    margin: 'auto',
                    paddingTop: '16px',
                    paddingBottom: '16px',
                }}
            >
                <Box
                    sx={{
                        bgcolor: 'rgba(10, 10, 15, 0.9)',
                        backdropFilter: 'blur(15px)',
                        borderRadius: 2,
                        p: { xs: 1.5, sm: 2 },
                        border: '1px solid rgba(156, 39, 176, 0.2)',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                        width: '90%',
                        maxWidth: 600,
                        mx: 'auto',
                        position: 'relative',
                        overflow: 'visible',
                        boxSizing: 'border-box',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <IconButton
                        onClick={() => setOpenPreview(false)}
                        sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            color: '#ff4081',
                            '&:hover': { bgcolor: 'rgba(255, 64, 129, 0.1)', transform: 'scale(1.1)' },
                            transition: 'all 0.3s',
                            zIndex: 1,
                        }}
                    >
                        <Close />
                    </IconButton>
                    <Typography
                        variant="h6"
                        sx={{
                            color: '#ffffff',
                            mb: 2,
                            fontSize: { xs: '0.9rem', sm: '1rem' },
                            fontWeight: 600,
                        }}
                    >
                        Попередній перегляд
                    </Typography>
                    <PostCard post={previewPost} isClickable={false} previewMode={true} />
                </Box>
            </motion.div>
        </Modal>
    </Box>
);
};

export default PostCreatePage;
