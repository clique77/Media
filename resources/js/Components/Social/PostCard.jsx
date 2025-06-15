import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    CardHeader,
    Chip,
    CircularProgress,
    Dialog,
    DialogContent,
    FormControlLabel,
    IconButton,
    Menu,
    MenuItem,
    Radio,
    RadioGroup,
    Typography
} from '@mui/material';
import {
    BrokenImage,
    ChatBubbleOutline,
    Close,
    Edit,
    Favorite,
    Flag,
    MoreVert,
    Share,
    Visibility
} from '@mui/icons-material';
import {Carousel} from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import {formatNumber} from '@/utils/formatNumber.js';
import UserAvatar from "@/Components/Social/UserAvatar.jsx";
import {likeActions, reportActions} from "@/api/actions/index.js";
import {useMutation, useQueryClient} from "react-query";
import {formatDate} from "@/utils/formatDate.js";
import {normalizeAttachments} from "@/utils/normalizeAttachments.js";
import {STORAGE_PRIVATE_POST_URL, STORAGE_URL} from "@/config/env.js";
import {useNavigate} from "react-router-dom";
import DOMPurify from 'dompurify';
import {toast} from "react-toastify";
import {useAuth} from "@/Components/Auth/AuthProvider.jsx";

const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/600x600.png?text=Media+Not+Found';

const PostCard = ({
                      post = {
                          id: '',
                          title: '',
                          content: '',
                          user: {id: 0, username: '', avatar: ''},
                          attachments: [],
                          likes_count: 0,
                          comments_count: 0,
                          views_count: 0,
                          created_at: new Date().toISOString(),
                          slug: '',
                          tags: [],
                          visibility: 'public',
                          comments_enabled: true,
                          user_liked: false,
                          like_id: null
                      },
                      isClickable = true,
                      previewMode = false
                  }) => {
    const media = previewMode ? post.attachments : normalizeAttachments(post.attachments);

    const [blobUrls, setBlobUrls] = useState({});
    const blobUrlsRef = useRef({});
    const [anchorEl, setAnchorEl] = useState(null);
    const [isLiked, setIsLiked] = useState(post.user_liked);
    const [currentLikes, setCurrentLikes] = useState(post.likes_count || 0);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [mediaLoaded, setMediaLoaded] = useState(media.map(() => false));
    const [mediaErrors, setMediaErrors] = useState(media.map(() => false));
    const [maxHeight, setMaxHeight] = useState(window.innerWidth <= 400 ? 250 : window.innerWidth <= 600 ? 300 : 400);
    const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const queryClient = useQueryClient();
    const carouselRef = useRef(null);
    const navigate = useNavigate();
    const { user } = useAuth();

    const reportReasons = [
        { value: 'Spam', label: 'Спам' },
        { value: 'Copyright', label: 'Порушення авторських прав' },
        { value: 'Offensive_content', label: 'Образливий контент' },
        { value: 'Misleading', label: 'Введення в оману' },
        { value: 'Other', label: 'Інше' },
    ];

    useEffect(() => {
        if (previewMode || post.visibility === 'public' || media.length === 0) return;

        const fetchPrivateMedia = async () => {
            const newBlobUrls = {};
            for (const [index, item] of media.entries()) {
                try {
                    const response = await window.axios.get(`${STORAGE_PRIVATE_POST_URL}${item.url}`, {
                        headers: {
                            'Accept': 'application/octet-stream'
                        },
                        responseType: 'blob'
                    });

                    const blob = response.data;
                    const blobUrl = URL.createObjectURL(blob);
                    newBlobUrls[item.url] = blobUrl;
                    blobUrlsRef.current[item.url] = blobUrl;
                    setMediaLoaded(prev => {
                        const newLoaded = [...prev];
                        newLoaded[index] = true;
                        return newLoaded;
                    });
                    setMediaErrors(prev => {
                        const newErrors = [...prev];
                        newErrors[index] = false;
                        return newErrors;
                    });
                } catch (error) {
                    const errorMessage = error.response?.data?.error || 'Не вдалося завантажити медіа';
                    setMediaErrors(prev => {
                        const newErrors = [...prev];
                        newErrors[index] = true;
                        return newErrors;
                    });
                    if (error.response?.status === 401 || error.message === 'No token found') {
                        toast.error('Немає доступу до медіа. Увійдіть знову.');
                    } else if (error.response?.status === 403) {
                        toast.error('Немає доступу до файлу.');
                    } else {
                        toast.error(errorMessage);
                    }
                }
            }
            setBlobUrls(newBlobUrls);
        };

        fetchPrivateMedia();

        return () => {
            Object.values(blobUrlsRef.current).forEach(url => URL.revokeObjectURL(url));
            blobUrlsRef.current = {};
        };
    }, []);

    const handleReportClick = (event) => {
        if (previewMode) return;
        event.stopPropagation();
        setAnchorEl(null);
        setIsReportDialogOpen(true);
    };

    const handleReportDialogClose = (event) => {
        event.stopPropagation();
        setIsReportDialogOpen(false);
        setReportReason('');
    };

    const createReportMutation = useMutation(
        reportActions.createReport,
        {
            onSuccess: (response) => {
                toast.success(response?.data?.message || 'Скарга надіслана!');
            },
            onError: (error) => {
                toast.error(error.response?.data?.error || 'Не вдалося надіслати скаргу. Спробуйте пізніше.');
            },
        }
    );

    const handleReportSubmit = (event) => {
        event.stopPropagation();
        if (!reportReason) {
            toast.error('Будь ласка, виберіть причину скарги.');
            return;
        }
        createReportMutation.mutate({ post_id: post.id, reason: reportReason });
    };

    const handleMenuOpen = (event) => {
        if (previewMode) return;
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };

    const handleEditClick = (event) => {
        event.stopPropagation();
        setAnchorEl(null);
        navigate(`/posts/${post.slug}/edit`);
    };

    const handleMenuClose = (event) => {
        if (previewMode) return;
        event.stopPropagation();
        setAnchorEl(null);
    };

    const handleShareClick = (event) => {
        if (previewMode) return;
        event.stopPropagation();
        const postUrl = `${window.location.origin}/posts/${post.slug}`;
        navigator.clipboard
            .writeText(postUrl)
            .then(() => {
                toast.success('Посилання на пост скопійовано!');
            })
            .catch((error) => {
                toast.error('Не вдалося скопіювати посилання.')
            });
    };

    const handleNameClick = (event) => {
        if (previewMode) return;
        event.stopPropagation();
        navigate(`/users/${post.user.username}`);
    };

    useEffect(() => {
        setIsLiked(post.user_liked);
    }, [post.user_liked]);

    const createLikeMutation = useMutation(
        () => likeActions.createLike('posts', post.id),
        {
            onMutate: async () => {
                setIsLiked(true);
                setCurrentLikes(prev => prev + 1);
            },
            onSuccess: () => {
                queryClient.invalidateQueries(['userLikes']);
                queryClient.invalidateQueries(['posts']);
                toast.success('Лайк успішно залишено.');
            },
            onError: (error) => {
                setIsLiked(false);
                setCurrentLikes(prev => prev - 1);
                toast.error(error.response?.data?.error || error.response?.data?.message || 'Помилка під час залишення лайку.');
            }
        }
    );

    const deleteLikeMutation = useMutation(
        () => likeActions.deleteLike(post.like_id),
        {
            onMutate: async () => {
                setIsLiked(false);
                setCurrentLikes(prev => prev - 1);
            },
            onSuccess: () => {
                queryClient.invalidateQueries(['userLikes']);
                queryClient.invalidateQueries(['posts']);
            },
            onError: () => {
                setIsLiked(true);
                setCurrentLikes(prev => prev + 1);
            }
        }
    );

    const handleLike = async () => {
        if (previewMode) return;
        if (isLiked && post.like_id) {
            deleteLikeMutation.mutate();
        } else {
            createLikeMutation.mutate();
        }
    };

    const handleSlideChange = (index) => {
        setCurrentSlide(index);
    };

    const handleMediaLoad = (index) => {
        setMediaLoaded((prev) => {
            const newLoaded = [...prev];
            newLoaded[index] = true;
            return newLoaded;
        });
    };

    const handleMediaError = (index) => {
        setMediaErrors((prev) => {
            const newErrors = [...prev];
            newErrors[index] = true;
            return newErrors;
        });
    };

    const debounce = (func, wait) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    };

    const calculateMaxHeight = useCallback(() => {
        if (!carouselRef.current || media.length === 0) return;

        const containerWidth = carouselRef.current.offsetWidth;
        const isVerySmallScreen = window.innerWidth <= 400;
        const isSmallScreen = window.innerWidth <= 600;

        let calculatedMaxHeight = isVerySmallScreen ? 250 : isSmallScreen ? 300 : 400;

        const loadPromises = media.map((item, index) => {
            return new Promise((resolve) => {
                if (item.type === 'image') {
                    const img = new Image();
                    img.src = previewMode ? item.url : post.visibility === 'public' ? STORAGE_URL + item.url : blobUrls[item.url] || PLACEHOLDER_IMAGE;
                    img.onload = () => {
                        const aspectRatio = img.height / img.width;
                        const height = containerWidth * aspectRatio * (isSmallScreen ? 1.2 : 1);
                        resolve(height);
                    };
                    img.onerror = () => {
                        const height = containerWidth * (isSmallScreen ? 0.75 : 0.5625);
                        resolve(height);
                    };
                } else {
                    const height = containerWidth * (isSmallScreen ? 0.75 : 0.5625);
                    resolve(height);
                }
            });
        });

        Promise.all(loadPromises).then((heights) => {
            const maxCalculatedHeight = Math.max(...heights);
            if (maxCalculatedHeight > calculatedMaxHeight) {
                calculatedMaxHeight = Math.min(maxCalculatedHeight, isSmallScreen ? 550 : 700);
                setMaxHeight(calculatedMaxHeight);
            }
        });
    }, [media]);

    useEffect(() => {
        const debouncedCalculateMaxHeight = debounce(calculateMaxHeight, 300);
        debouncedCalculateMaxHeight();
        window.addEventListener('resize', debouncedCalculateMaxHeight);
        return () => window.removeEventListener('resize', debouncedCalculateMaxHeight);
    }, [calculateMaxHeight]);

    useEffect(() => {
        return () => {
            setMediaLoaded([]);
            setMediaErrors([]);
            Object.values(blobUrlsRef.current).forEach(url => URL.revokeObjectURL(url));
            blobUrlsRef.current = {};
            setBlobUrls({});
        };
    }, []);

    const handleCardClick = (event) => {
        if (isReportDialogOpen) return;
        const target = event.target;
        const isInteractiveElement = target.closest(
            'button, a, input, textarea, [role="button"], .MuiAvatar-root, .UserName, .MuiButton-root, .MuiIconButton-root, .MuiChip-root, .carousel'
        );

        if (!isInteractiveElement) {
            navigate(`/posts/${post.slug}`);
        }
    };

    const handleCommentClick = () => {
        if (previewMode) return;
        navigate(`/posts/${post.slug}`);
    };

    const sanitizedContent = DOMPurify.sanitize(post.content, {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'blockquote'],
        ALLOWED_ATTR: ['href', 'target', 'rel']
    });

    const getMediaUrl = (item) => {
        if (previewMode) return item.url;
        if (post.visibility === 'public') {
            return STORAGE_URL + item.url;
        }
        return blobUrls[item.url] || PLACEHOLDER_IMAGE;
    };

    const getBackgroundUrl = (item) => {
        if (mediaErrors[currentSlide]) return `url(${PLACEHOLDER_IMAGE})`;
        if (previewMode) {
            return item?.type === 'image' ? `url(${item?.url})` : `url(${item?.thumbnail || item?.url || PLACEHOLDER_IMAGE})`;
        }
        if (post.visibility === 'public') {
            return item?.type === 'image' ? `url(${STORAGE_URL + item?.url})` : `url(${STORAGE_URL + (item?.thumbnail || item?.url) || PLACEHOLDER_IMAGE})`;
        }
        return item?.type === 'image' ? `url(${blobUrls[item?.url] || PLACEHOLDER_IMAGE})` : `url(${blobUrls[item?.thumbnail || item?.url] || PLACEHOLDER_IMAGE})`;
    };

    return (
        <Box sx={{
            padding: {xs: '0 4px', sm: '0 8px'},
            cursor: isClickable ? 'pointer' : 'default',
            boxSizing: 'border-box',
            width: '100%',
            maxWidth: '100%',
            overflow: 'hidden',
            ...(isClickable && {
                '&:hover .post-card': {
                    backgroundColor: 'rgba(35, 35, 37, 0.6)'
                }
            })
        }}>
            <Card
                className="post-card"
                onClick={isClickable ? handleCardClick : undefined}
                sx={{
                    width: '100%',
                    maxWidth: '100%',
                    background: 'transparent',
                    color: '#ffffff',
                    borderRadius: '8px',
                    marginBottom: 2,
                    overflow: 'hidden',
                    backdropFilter: 'blur(12px)',
                    transition: 'all 0.2s ease',
                    boxShadow: 'none',
                    border: 'none',
                    boxSizing: 'border-box'
                }}
            >
                <CardHeader
                    avatar={
                        <UserAvatar
                            userId={post.user.id}
                            src={post.user.avatar}
                        >
                            {post.user.username.charAt(0)}
                        </UserAvatar>
                    }
                    action={
                        <IconButton
                            aria-label="settings"
                            onClick={handleMenuOpen}
                            sx={{
                                color: '#b0b0b0',
                                '&:hover': {
                                    color: '#ffffff',
                                    backgroundColor: 'rgba(156, 39, 176, 0.2)'
                                }
                            }}
                        >
                            <MoreVert/>
                        </IconButton>
                    }
                    title={
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                            <Typography onClick={handleNameClick} variant="subtitle2" sx={{
                                fontWeight: 600,
                                color: '#ffffff',
                                cursor: 'pointer',
                                fontSize: {xs: '14px', sm: '16px'},
                                '&:hover': {
                                    textDecoration: 'underline'
                                }
                            }}>
                                {post.user.username}
                            </Typography>
                        </Box>
                    }
                    subheader={
                        <Typography variant="caption" sx={{
                            color: '#b0b0b0',
                            fontSize: {xs: '12px', sm: '14px'},
                            '&:hover': {
                                color: '#ffffff'
                            }
                        }}>
                            {formatDate(post.created_at)} · {post.slug || 'community'}
                        </Typography>
                    }
                    sx={{
                        padding: {xs: '10px 12px', sm: '14px 16px'},
                        background: 'transparent',
                        '& .MuiCardHeader-content': {
                            overflow: 'hidden'
                        },
                        width: '100%',
                        boxSizing: 'border-box'
                    }}
                />

                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    PaperProps={{
                        sx: {
                            background: 'rgba(26, 26, 27, 0.9)',
                            color: '#ffffff',
                            border: 'none',
                            boxShadow: '0 0 30px rgba(0, 0, 0, 0.5)',
                            backdropFilter: 'blur(12px)',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            '& .MuiMenuItem-root': {
                                padding: {xs: '8px 12px', sm: '10px 16px'},
                                fontSize: {xs: '13px', sm: '14px'},
                                '&:hover': {
                                    background: 'rgba(156, 39, 176, 0.2)'
                                },
                                '& svg': {
                                    marginRight: '10px',
                                    color: '#b0b0b0'
                                }
                            }
                        }
                    }}
                >
                    {user?.id === post.user.id && (
                        <MenuItem onClick={handleEditClick}>
                            <Edit fontSize="small" /> Редагувати
                        </MenuItem>
                    )}
                    <MenuItem onClick={handleReportClick}>
                        <Flag fontSize="small"/> Поскаржитися
                    </MenuItem>
                </Menu>
                <Dialog
                    open={isReportDialogOpen}
                    onClose={handleReportDialogClose}
                    onClick={(e) => e.stopPropagation()}
                    maxWidth="xs"
                    fullWidth
                    sx={{
                        '& .MuiDialog-paper': {
                            backgroundColor: 'rgba(10, 10, 15, 0.9)',
                            border: '1px solid transparent',
                            borderImage: 'linear-gradient(to right, #9c27b0, rgba(156, 39, 176, 0.3)) 1',
                            borderRadius: 2,
                            backdropFilter: 'blur(15px)',
                            color: '#e0e0e0',
                        },
                    }}
                >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
                        <Typography variant="h6" sx={{ color: '#ffffff' }}>
                            Поскаржитися на пост
                        </Typography>
                        <IconButton onClick={handleReportDialogClose} sx={{ color: '#e0e0e0' }}>
                            <Close />
                        </IconButton>
                    </Box>
                    <DialogContent sx={{ p: { xs: 1, sm: 2 } }}>
                        <RadioGroup
                            value={reportReason}
                            onChange={(e) => setReportReason(e.target.value)}
                            sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
                        >
                            {reportReasons.map((reason) => (
                                <FormControlLabel
                                    key={reason.value}
                                    value={reason.value}
                                    control={
                                        <Radio
                                            sx={{
                                                color: '#e0e0e0',
                                                '&.Mui-checked': {
                                                    color: '#ff4081',
                                                },
                                                '& .MuiSvgIcon-root': {
                                                    fontSize: '22px',
                                                },
                                            }}
                                        />
                                    }
                                    label={
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: '#e0e0e0',
                                                fontSize: { xs: '14px', sm: '15px' },
                                                fontWeight: 500,
                                            }}
                                        >
                                            {reason.label}
                                        </Typography>
                                    }
                                    sx={{
                                        margin: 0,
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        '&:hover': {
                                            background: 'rgba(156, 39, 176, 0.1)',
                                        },
                                    }}
                                />
                            ))}
                        </RadioGroup>
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                            <Button
                                variant="contained"
                                onClick={handleReportSubmit}
                                disabled={!reportReason || createReportMutation.isLoading}
                                sx={{
                                    bgcolor: '#9c27b0',
                                    color: '#ffffff',
                                    '&:hover': { bgcolor: '#7b1fa2' },
                                    '&:disabled': {
                                        bgcolor: 'rgba(156, 39, 176, 0.3)',
                                        color: '#e0e0e0',
                                    },
                                }}
                            >
                                Надіслати
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={handleReportDialogClose}
                                sx={{
                                    color: '#e0e0e0',
                                    borderColor: 'rgba(156, 39, 176, 0.3)',
                                    '&:hover': {
                                        borderColor: '#9c27b0',
                                        bgcolor: 'rgba(156, 39, 176, 0.1)',
                                    },
                                }}
                            >
                                Скасувати
                            </Button>
                        </Box>
                    </DialogContent>
                </Dialog>

                <CardContent sx={{
                    padding: {xs: '0 12px 8px 12px', sm: '0 16px 12px 16px'},
                    background: 'transparent',
                    width: '100%',
                    boxSizing: 'border-box'
                }}>
                    <Typography variant="h6" component="h3" sx={{
                        fontSize: {xs: '16px', sm: '18px'},
                        fontWeight: 600,
                        marginBottom: post.content ? '10px' : 0,
                        lineHeight: 1.4,
                        color: '#ffffff'
                    }}>
                        {post.title}
                    </Typography>
                    {post.content && (
                        <Box
                            sx={{
                                fontSize: { xs: '14px', sm: '15px' },
                                lineHeight: '1.5',
                                marginBottom: post.tags.length > 0 || media.length > 0 ? '12px' : 0,
                                color: '#e0e0e0',
                                '& p': { margin: '0 0 8px 0' },
                                '& strong': { fontWeight: 700 },
                                '& em': { fontStyle: 'italic' },
                                '& u': { textDecoration: 'underline' },
                                '& a': { color: '#ff4081', textDecoration: 'underline', '&:hover': { color: '#f50057' } },
                                '& ul, & ol': { margin: '0 0 8px 16px', paddingLeft: '16px' },
                                '& li': { marginBottom: '4px' },
                                '& blockquote': {
                                    borderLeft: '3px solid #ff4081',
                                    paddingLeft: '12px',
                                    margin: '0 0 8px 0',
                                    color: '#b0b0b0'
                                },
                                ...(isClickable && {
                                    display: '-webkit-box',
                                    WebkitLineClamp: 5,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                })
                            }}
                            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                        />
                    )}
                    {post.tags.length > 0 && (
                        <Box sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '8px',
                            marginBottom: media.length > 0 ? '4px' : 0
                        }}>
                            {post.tags.map((tag, index) => (
                                <Chip
                                    key={index}
                                    label={'# ' + tag}
                                    sx={{
                                        backgroundColor: 'rgba(156, 39, 176, 0.2)',
                                        color: '#e0e0e0',
                                        fontSize: {xs: '12px', sm: '13px'},
                                        fontWeight: 500,
                                        height: {xs: '26px', sm: '28px'},
                                        borderRadius: '14px',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            backgroundColor: 'rgba(156, 39, 176, 0.4)',
                                            color: '#ffffff',
                                            cursor: 'pointer'
                                        }
                                    }}
                                />
                            ))}
                        </Box>
                    )}
                </CardContent>

                {media.length > 0 && (
                    <Box
                        ref={carouselRef}
                        sx={{
                            position: 'relative',
                            width: {xs: 'calc(100% - 16px)', sm: 'calc(100% - 24px)'},
                            margin: {xs: '0 4px 8px 4px', sm: '0 12px 12px 12px'},
                            backgroundColor: '#000000',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            maxHeight: `${maxHeight}px`,
                            minHeight: '150px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'max-height 0.3s ease',
                            boxSizing: 'border-box',
                            '@media (max-width: 400px)': {
                                maxHeight: `${maxHeight}px`,
                                minHeight: '150px',
                                width: 'calc(100% - 8px)'
                            },
                            '@media (min-width: 401px) and (max-width: 600px)': {
                                maxHeight: `${maxHeight}px`,
                                width: 'calc(100% - 8px)'
                            }
                        }}
                    >
                        <Box sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundImage: getBackgroundUrl(media[currentSlide]),
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            filter: 'blur(20px) brightness(0.7)',
                            zIndex: 1,
                            borderRadius: '8px'
                        }}/>

                        <Box sx={{
                            position: 'relative',
                            width: '100%',
                            height: '100%',
                            maxHeight: `${maxHeight}px`,
                            zIndex: 2,
                            boxSizing: 'border-box'
                        }}>
                            <Carousel
                                showArrows={media.length > 1}
                                showStatus={false}
                                showThumbs={false}
                                infiniteLoop
                                emulateTouch
                                selectedItem={currentSlide}
                                onChange={handleSlideChange}
                                swipeable
                                dynamicHeight={false}
                                sx={{
                                    width: '100%',
                                    height: '100%',
                                    '& .carousel': {
                                        height: '100%',
                                        width: '100%'
                                    },
                                    '& .slider-wrapper': {
                                        height: '100%',
                                        overflow: 'hidden',
                                        width: '100%'
                                    },
                                    '& .slider': {
                                        height: '100%',
                                        width: '100%'
                                    },
                                    '& .slide': {
                                        height: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: 'transparent',
                                        width: '100%'
                                    }
                                }}
                                renderArrowPrev={(onClickHandler, hasPrev) =>
                                    hasPrev && (
                                        <IconButton
                                            onClick={onClickHandler}
                                            sx={{
                                                position: 'absolute',
                                                top: '50%',
                                                left: '8px',
                                                transform: 'translateY(-50%)',
                                                background: 'rgba(37,3,3,0.6)',
                                                height: {xs: '40px', sm: '48px'},
                                                width: {xs: '40px', sm: '48px'},
                                                borderRadius: '50%',
                                                zIndex: 3,
                                                '&:hover': {
                                                    background: 'rgb(35,10,10,0.7)'
                                                },
                                                '& .MuiSvgIcon-root': {
                                                    color: '#ffffff',
                                                    fontSize: {xs: '20px', sm: '24px'}
                                                }
                                            }}
                                        >
                                            <svg viewBox="0 0 24 24">
                                                <path fill="currentColor" color={'gray'}
                                                      d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                                            </svg>
                                        </IconButton>
                                    )
                                }
                                renderArrowNext={(onClickHandler, hasNext) =>
                                    hasNext && (
                                        <IconButton
                                            onClick={onClickHandler}
                                            sx={{
                                                position: 'absolute',
                                                top: '50%',
                                                right: '8px',
                                                transform: 'translateY(-50%)',
                                                background: 'rgba(37,3,3,0.6)',
                                                height: {xs: '40px', sm: '48px'},
                                                width: {xs: '40px', sm: '48px'},
                                                borderRadius: '50%',
                                                zIndex: 3,
                                                '&:hover': {
                                                    background: 'rgb(35,10,10,0.7)'
                                                },
                                                '& .MuiSvgIcon-root': {
                                                    color: '#ffffff',
                                                    fontSize: {xs: '20px', sm: '24px'}
                                                }
                                            }}
                                        >
                                            <svg viewBox="0 0 24 24">
                                                <path fill="currentColor" color={'gray'}
                                                      d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/>
                                            </svg>
                                        </IconButton>
                                    )
                                }
                                renderIndicator={(onClickHandler, isSelected, index, label) => (
                                    <Box
                                        component="li"
                                        sx={{
                                            width: isSelected ? '24px' : '8px',
                                            height: '4px',
                                            display: 'inline-block',
                                            margin: '0 4px',
                                            borderRadius: '2px',
                                            backgroundColor: isSelected ? '#9c27b0' : '#4a4a4a',
                                            cursor: 'pointer',
                                            transition: 'width 0.3s ease, background-color 0.3s ease',
                                            '&:hover': {
                                                backgroundColor: '#9c27b0'
                                            }
                                        }}
                                        onClick={onClickHandler}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                onClickHandler(e);
                                            }
                                        }}
                                        value={index}
                                        key={index}
                                        role="button"
                                        tabIndex={0}
                                        aria-label={`${label} ${index + 1}`}
                                    />
                                )}
                            >
                                {media.map((item, index) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            width: '100%',
                                            height: '100%',
                                            maxHeight: `${maxHeight}px`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            borderRadius: '8px',
                                            boxSizing: 'border-box'
                                        }}
                                    >
                                        {!mediaLoaded[index] && !mediaErrors[index] && (
                                            <CircularProgress
                                                sx={{
                                                    color: '#9c27b0',
                                                    position: 'absolute',
                                                    zIndex: 3
                                                }}
                                            />
                                        )}

                                        {mediaErrors[index] && (
                                            <Box sx={{
                                                width: '100%',
                                                height: '100%',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                                zIndex: 2
                                            }}>
                                                <BrokenImage
                                                    sx={{color: '#b0b0b0', fontSize: {xs: '40px', sm: '48px'}}}/>
                                                <Typography variant="body2"
                                                            sx={{color: '#e0e0e0', fontSize: {xs: '13px', sm: '14px'}}}>
                                                    Не вдалося завантажити медіа
                                                </Typography>
                                            </Box>
                                        )}

                                        {item.type === 'image' ? (
                                            <img
                                                src={mediaErrors[index] ? PLACEHOLDER_IMAGE : getMediaUrl(item)}
                                                alt={`Post media ${index + 1}`}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    maxHeight: `${maxHeight}px`,
                                                    objectFit: 'contain',
                                                    objectPosition: 'center',
                                                    borderRadius: '8px',
                                                    display: mediaErrors[index] || !mediaLoaded[index] ? 'none' : 'block',
                                                    boxSizing: 'border-box'
                                                }}
                                                onLoad={() => handleMediaLoad(index)}
                                                onError={() => handleMediaError(index)}
                                            />
                                        ) : (
                                            <video
                                                src={mediaErrors[index] ? PLACEHOLDER_IMAGE : getMediaUrl(item)}
                                                controls
                                                muted
                                                autoPlay={false}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    maxHeight: `${maxHeight}px`,
                                                    objectFit: window.innerWidth <= 600 ? 'cover' : 'contain',
                                                    objectPosition: 'center',
                                                    borderRadius: '8px',
                                                    display: mediaErrors[index] || !mediaLoaded[index] ? 'none' : 'block',
                                                    boxSizing: 'border-box'
                                                }}
                                                onLoadedData={() => handleMediaLoad(index)}
                                                onError={() => handleMediaError(index)}
                                            />
                                        )}
                                    </Box>
                                ))}
                            </Carousel>
                        </Box>
                    </Box>
                )}

                <CardActions sx={{
                    padding: {xs: '8px 12px', sm: '10px 16px'},
                    display: 'flex',
                    justifyContent: 'space-between',
                    background: 'transparent',
                    borderTop: 'none',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '8px',
                    width: '100%',
                    boxSizing: 'border-box'
                }}>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        height: '40px',
                        flexWrap: 'wrap'
                    }}>
                        <Button
                            startIcon={
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    height: '24px'
                                }}>
                                    <Visibility sx={{
                                        color: '#b0b0b0',
                                        fontSize: {xs: '20px', sm: '22px'}
                                    }}/>
                                </Box>
                            }
                            sx={{
                                minWidth: 'auto',
                                padding: {xs: '8px 14px', sm: '8px 16px'},
                                color: '#e0e0e0',
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                borderRadius: '999px',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                                },
                                '& .MuiButton-startIcon': {
                                    marginRight: '8px',
                                    marginLeft: '0',
                                    height: '24px'
                                },
                                height: '40px'
                            }}
                        >
                            <Typography variant="subtitle2" sx={{
                                fontWeight: 500,
                                fontSize: {xs: '14px', sm: '15px'},
                                textTransform: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                height: '24px'
                            }}>
                                {formatNumber(post.views_count)}
                            </Typography>
                        </Button>

                        <Button
                            startIcon={
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    height: '24px'
                                }}>
                                    <Favorite sx={{
                                        color: isLiked ? '#ff4081' : '#b0b0b0',
                                        fontSize: {xs: '20px', sm: '22px'},
                                        transition: 'all 0.2s ease'
                                    }}/>
                                </Box>
                            }
                            onClick={handleLike}
                            sx={{
                                minWidth: 'auto',
                                padding: {xs: '8px 14px', sm: '8px 16px'},
                                color: isLiked ? '#ff4081' : '#e0e0e0',
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                borderRadius: '999px',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                                },
                                '& .MuiButton-startIcon': {
                                    marginRight: '8px',
                                    marginLeft: '0',
                                    height: '24px'
                                },
                                height: '40px'
                            }}
                        >
                            <Typography variant="subtitle2" sx={{
                                fontWeight: 500,
                                fontSize: {xs: '14px', sm: '15px'},
                                textTransform: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                height: '24px'
                            }}>
                                {formatNumber(currentLikes)}
                            </Typography>
                        </Button>

                        <Button
                            onClick={handleCommentClick}
                            startIcon={
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    height: '24px'
                                }}>
                                    <ChatBubbleOutline sx={{
                                        color: '#b0b0b0',
                                        fontSize: {xs: '20px', sm: '22px'}
                                    }}/>
                                </Box>
                            }
                            sx={{
                                minWidth: 'auto',
                                padding: {xs: '8px 14px', sm: '8px 16px'},
                                color: '#e0e0e0',
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                borderRadius: '999px',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                                },
                                '& .MuiButton-startIcon': {
                                    marginRight: '8px',
                                    marginLeft: '0',
                                    height: '24px'
                                },
                                height: '40px'
                            }}
                        >
                            <Typography variant="subtitle2" sx={{
                                fontWeight: 500,
                                fontSize: {xs: '14px', sm: '15px'},
                                textTransform: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                height: '24px'
                            }}>
                                {formatNumber(post.comments_count)}
                            </Typography>
                        </Button>
                    </Box>

                    <Button
                        onClick={handleShareClick}
                        startIcon={
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                height: '24px'
                            }}>
                                <Share sx={{
                                    color: '#b0b0b0',
                                    fontSize: {xs: '20px', sm: '22px'}
                                }}/>
                            </Box>
                        }
                        sx={{
                            minWidth: 'auto',
                            padding: {xs: '8px 14px', sm: '8px 16px'},
                            color: '#e0e0e0',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '999px',
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.1)'
                            },
                            '& .MuiButton-startIcon': {
                                marginRight: '8px',
                                marginLeft: '0',
                                height: '24px'
                            },
                            height: '40px'
                        }}
                    >
                        <Typography variant="subtitle2" sx={{
                            fontWeight: 500,
                            fontSize: {xs: '14px', sm: '15px'},
                            textTransform: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            height: '24px'
                        }}>
                            Поділитися
                        </Typography>
                    </Button>
                </CardActions>
            </Card>
        </Box>
    );
};

export default PostCard;
