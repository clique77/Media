import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Typography,
    Avatar,
    IconButton,
    Dialog,
    DialogContent,
    useMediaQuery,
    useTheme,
    Grid,
    Button,
    Divider,
    CircularProgress,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Edit,
    Delete,
    Close,
} from '@mui/icons-material';
import { useMutation, useQueryClient } from 'react-query';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '../../../css/quill.css';
import { messageActions } from '@/api/actions';
import { useAuth } from '@/Components/Auth/AuthProvider.jsx';
import { toast } from 'react-toastify';
import { normalizeAttachments } from "@/utils/normalizeAttachments.js";
import { STORAGE_PRIVATE_CHAT_URL } from "@/config/env.js";

// Constants for styles
const COLORS = {
    chatBackground: 'rgba(10, 10, 15, 0.98)',
    accent: '#9c27b0',
    textPrimary: '#ffffff',
    textSecondary: 'rgba(255, 255, 255, 0.7)',
    border: 'rgba(156, 39, 176, 0.3)',
    error: '#f44336',
    dateDivider: 'rgba(156, 39, 176, 0.5)',
};

const SIZES = {
    avatarMessage: 40,
    fontSizeMessage: { xs: '14px', sm: '16px' },
    padding: { xs: '12px', sm: '16px' },
    borderRadius: { xs: 0, sm: '12px' },
    messageMargin: '16px',
    mediaSize: { xs: '120px', sm: '150px' },
    singleMediaSize: { xs: '250px', sm: '300px' },
};

const quillModules = {
    toolbar: [
        ['bold', 'italic', 'underline'],
        ['link', 'blockquote', 'code-block'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['clean'],
    ],
};

const quillFormats = [
    'header',
    'bold', 'italic', 'underline',
    'link', 'blockquote', 'code-block',
    'list', 'bullet',
];

// Double Checkmark SVG Icon
const DoubleCheckIcon = ({ color, fontSize }) => (
    <svg
        width={fontSize}
        height={fontSize}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="M1.5 12.5L5.5 16.5L10.5 8.5"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M7.5 12.5L11.5 16.5L22.5 5.5"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

// Format time to HH:mm
const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });
};

const MediaPreview = ({ attachments, isMobile, blobUrls, mediaLoaded, mediaErrors, onMediaClick, isSingleMedia }) => {
    const count = attachments.length;
    if (count === 0) return null;

    const maxWidth = isSingleMedia ? (isMobile ? '100%' : '400px') : (isMobile ? '90%' : '350px');
    const mediaSize = isSingleMedia ? SIZES.singleMediaSize : SIZES.mediaSize;

    return (
        <Grid container spacing={1} sx={{ mt: 0, maxWidth }}>
            {attachments.slice(0, 5).map((media, index) => {
                const isVideo = media.type.startsWith('video');
                const mediaUrl = blobUrls[media.url] || '';

                return (
                    <Grid item xs={isSingleMedia ? 12 : count <= 2 ? 6 : 4} key={index}>
                        <Box
                            sx={{
                                position: 'relative',
                                width: '100%',
                                paddingBottom: isSingleMedia ? '75%' : '100%',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                border: `1px solid ${COLORS.border}`,
                                bgcolor: 'rgba(0, 0, 0, 0.5)',
                                cursor: mediaLoaded[index] && !mediaErrors[index] ? 'pointer' : 'default',
                            }}
                            onClick={() => mediaLoaded[index] && !mediaErrors[index] && onMediaClick(media, index)}
                        >
                            {!mediaLoaded[index] && !mediaErrors[index] && (
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <CircularProgress sx={{ color: COLORS.accent }} size={24} />
                                </Box>
                            )}
                            {mediaErrors[index] && (
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: COLORS.textSecondary,
                                        fontSize: '12px',
                                        textAlign: 'center',
                                        bgcolor: 'rgba(0, 0, 0, 0.5)',
                                    }}
                                >
                                    Не вдалося завантажити
                                </Box>
                            )}
                            {mediaLoaded[index] && !mediaErrors[index] && (
                                isVideo ? (
                                    <video
                                        src={mediaUrl}
                                        controls
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            borderRadius: '8px',
                                        }}
                                    />
                                ) : (
                                    <img
                                        src={mediaUrl}
                                        alt={`Media ${index}`}
                                        style={{
                                            position: 'absolute',
                                            top: '0',
                                            left: '0',
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            borderRadius: '8px',
                                        }}
                                    />
                                ))}
                        </Box>
                    </Grid>
                );
            })}
            {count > 5 && (
                <Grid item xs={4}>
                    <Box
                        sx={{
                            position: 'relative',
                            width: '100%',
                            paddingBottom: '100%',
                            borderRadius: '8px',
                            border: `1px solid ${COLORS.border}`,
                            bgcolor: 'rgba(255, 255, 255, 0.05)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: COLORS.textPrimary,
                            fontSize: SIZES.fontSizeMessage,
                        }}
                    >
                        +{count - 5}
                    </Box>
                </Grid>
            )}
        </Grid>
    );
};

const FullScreenMediaDialog = ({ open, onClose, media, blobUrls }) => {
    if (!media) return null;
    const isVideo = media.type.startsWith('video');
    const mediaUrl = blobUrls[media.url] || '';

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth={false}
            sx={{
                '& .MuiDialog-paper': {
                    background: 'rgba(0, 0, 0, 0.9)',
                    width: '100%',
                    height: '100%',
                    margin: '0',
                    maxWidth: 'none',
                    maxHeight: 'none',
                    borderRadius: '0',
                },
            }}
        >
            <IconButton
                onClick={onClose}
                sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    color: COLORS.textPrimary,
                    zIndex: 1,
                    '&:hover': { color: COLORS.accent },
                }}
            >
                <Close />
            </IconButton>
            <DialogContent
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                    height: '100%',
                    width: '100%',
                }}
            >
                {isVideo ? (
                    <video
                        src={mediaUrl}
                        controls
                        autoPlay
                        style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain',
                        }}
                    />
                ) : (
                    <img
                        src={mediaUrl}
                        alt="Full-screen media"
                        style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain',
                        }}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
};

const DateDivider = ({ date }) => (
    <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
        <Typography
            variant="caption"
            sx={{
                color: COLORS.textSecondary,
                fontSize: '12px',
                fontWeight: 500,
            }}
        >
            {new Date(date).toLocaleDateString('uk', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            })}
        </Typography>
    </Box>
);

const Message = ({ message, chatId, id, previousMessage, nextMessage }) => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isOwnMessage = message.user_id === user.id;
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editContent, setEditContent] = useState(message.content);
    const [isHovered, setIsHovered] = useState(false);
    const [blobUrls, setBlobUrls] = useState({});
    const blobUrlsRef = useRef({});
    const [mediaLoaded, setMediaLoaded] = useState((message.attachments || []).map(() => false));
    const [mediaErrors, setMediaErrors] = useState((message.attachments || []).map(() => false));
    const [fullScreenMedia, setFullScreenMedia] = useState(null);

    const isSingleMedia = !message.content || message.content === '<p><br></p>'
        ? (normalizeAttachments(message.attachments) || []).length === 1
        : false;

    const showDateDivider = () => {
        if (!previousMessage) return true;
        const prevDate = new Date(previousMessage.created_at).toDateString();
        const currentDate = new Date(message.created_at).toDateString();
        return prevDate !== currentDate;
    };

    useEffect(() => {
        if (!Array.isArray(message.attachments) || message.attachments.length === 0) return;

        const media = message.attachments[0]?.temp
            ? message.attachments
            : normalizeAttachments(message.attachments) || [];

        if (media.length === 0) return;

        const fetchPrivateMedia = async () => {
            const newBlobUrls = {};
            const newMediaLoaded = [...mediaLoaded];
            const newMediaErrors = [...mediaErrors];

            for (const [index, item] of media.entries()) {

                if (item.temp || item.url.startsWith('blob:')) {

                    newBlobUrls[item.url] = item.url;
                    newMediaLoaded[index] = true;
                    newMediaErrors[index] = false;
                } else {
                    try {
                        const response = await window.axios.get(`${STORAGE_PRIVATE_CHAT_URL}${item.url}`, {
                            headers: {
                                'Accept': 'application/octet-stream',
                            },
                            responseType: 'blob',
                        });

                        const blob = response.data;
                        const blobUrl = URL.createObjectURL(blob);
                        newBlobUrls[item.url] = blobUrl;
                        blobUrlsRef.current[item.url] = blobUrl;
                        newMediaLoaded[index] = true;
                        newMediaErrors[index] = false;
                    } catch (error) {
                        newMediaErrors[index] = true;
                        if (error.response?.status === 401 || error.response?.status === 403) {
                            toast.error('Немає доступу до медіа. Увійдіть або перевірте права.');
                        }
                    }
                }
            }
            setBlobUrls(newBlobUrls);
            setMediaLoaded(newMediaLoaded);
            setMediaErrors(newMediaErrors);
        };

        fetchPrivateMedia();

        return () => {
            Object.values(blobUrlsRef.current).forEach(url => {
                if (!url.startsWith('blob:')) {
                    URL.revokeObjectURL(url);
                }
            });
            blobUrlsRef.current = {};
            setBlobUrls({});
        };
    }, [message.attachments, message.isPending]);

    const editMessageMutation = useMutation(
        (payload) => messageActions.updateMessage(message.id, payload),
        {
            onSuccess: (response) => {
                const updatedMessage = response.data.message;
                queryClient.setQueryData(['messages', chatId], (oldData) => {
                    if (!oldData) return oldData;
                    return {
                        ...oldData,
                        pages: oldData.pages.map(page => ({
                            ...page,
                            data: {
                                ...page.data,
                                data: page.data.data.map(m =>
                                    m.id === message.id ? { ...m, content: updatedMessage.content } : m
                                ),
                            },
                        })),
                    };
                });
                setEditContent(updatedMessage.content);
                setIsEditModalOpen(false);
                toast.success('Повідомлення відредаговано');
            },
            onError: (error) => {
                toast.error(`Помилка редагування: ${error.response?.data?.message || 'Щось пішло не так'}`);
            },
        }
    );

    const deleteMessageMutation = useMutation(
        () => messageActions.deleteMessage(message.id),
        {
            onSuccess: () => {
                queryClient.setQueryData(['messages', chatId], (oldData) => {
                    if (!oldData) return oldData;
                    return {
                        ...oldData,
                        pages: oldData.pages.map(page => ({
                            ...page,
                            data: {
                                ...page.data,
                                data: page.data.data.filter(m => m.id !== message.id),
                            },
                        })),
                    };
                });
                toast.success('Повідомлення видалено');
            },
            onError: (error) => {
                toast.error(`Помилка видалення: ${error.response?.data?.message || 'Щось пішло не так'}`);
            },
        }
    );

    const retryMessageMutation = useMutation(
        (payload) => messageActions.createMessage(payload),
        {
            onSuccess: (response) => {
                queryClient.setQueryData(['messages', chatId], (oldData) => {
                    if (!oldData) return oldData;
                    return {
                        ...oldData,
                        pages: oldData.pages.map(page => ({
                            ...page,
                            data: {
                                ...page.data,
                                data: page.data.data.map(m =>
                                    m.id === message.id
                                        ? { ...response.data.data, isPending: false, isError: false }
                                        : m
                                ),
                            },
                        })),
                    };
                });
                toast.success('Повідомлення надіслано');
            },
            onError: (error) => {
                toast.error(`Повторна спроба не вдалася: ${error.response?.data?.message || 'Щось пішло не так'}`);
            },
        }
    );

    const handleEditOpen = () => {
        setEditContent(message.content);
        setIsEditModalOpen(true);
    };

    const handleEditClose = () => {
        setIsEditModalOpen(false);
    };

    const handleEditSave = () => {
        if (editContent.trim() && editContent !== '<p><br></p>') {
            editMessageMutation.mutate({ content: editContent });
        }
    };

    const handleDelete = () => {
        if (window.confirm('Ви впевнені, що хочете видалити це повідомлення?')) {
            deleteMessageMutation.mutate();
        }
    };

    const handleRetry = () => {
        const formData = new FormData();
        formData.append('content', message.content || '');
        formData.append('chat_id', chatId);

        if (message.attachments && message.attachments.length > 0) {
            message.attachments.forEach((attachment, index) => {
                formData.append(`attachments[${index}]`, attachment.file);
            });
        }

        retryMessageMutation.mutate(formData);
    };

    const handleMediaClick = (media, index) => {
        setFullScreenMedia({ media, index });
    };

    const handleFullScreenClose = () => {
        setFullScreenMedia(null);
    };

    const displayName = message.user.first_name && message.user.last_name
        ? `${message.user.first_name} ${message.user.last_name}`
        : message.user.username || 'Користувач';

    return (
        <>
            {showDateDivider() && (
                <DateDivider date={message.created_at} />
            )}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                id={id}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{
                    display: 'flex',
                    justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                    marginBottom: SIZES.messageMargin,
                    paddingLeft: isMobile ? '8px' : '16px',
                    paddingRight: isMobile ? '8px' : '16px',
                    position: 'relative',
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: isOwnMessage ? 'row-reverse' : 'row',
                        alignItems: 'flex-start',
                        gap: 1,
                        maxWidth: isMobile ? '95%' : '60%',
                        width: '100%',
                    }}
                >
                    <Avatar
                        src={message.user.avatar}
                        alt={displayName}
                        sx={{
                            width: SIZES.avatarMessage,
                            height: SIZES.avatarMessage,
                            bgcolor: COLORS.accent,
                            flexShrink: 0,
                        }}
                    />
                    <Box
                        sx={{
                            position: 'relative',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            mt: '4px',
                        }}
                    >
                        <Box
                            sx={{
                                bgcolor: isOwnMessage ? 'rgba(156, 39, 176, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                                borderRadius: isOwnMessage
                                    ? '12px 0 12px 12px'
                                    : '0 12px 12px 12px',
                                p: isSingleMedia ? 0.5 : 1.5,
                                paddingBottom: isSingleMedia ? 0.5 : '4px',
                                backdropFilter: 'blur(10px)',
                                border: message.isError
                                    ? `1px solid ${COLORS.error}`
                                    : `1px solid ${COLORS.border}`,
                                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
                                opacity: message.isPending ? 0.6 : 1,
                                minWidth: '150px',
                                maxWidth: { xs: '95%', sm: '650px' },
                                ml: isOwnMessage ? 0 : '12px',
                                mr: isOwnMessage ? '12px' : 0,
                            }}
                        >
                            <Typography
                                variant="caption"
                                sx={{
                                    margin: isSingleMedia ? 0.5 : 0,
                                    color: COLORS.textSecondary,
                                    fontSize: '12px',
                                    fontWeight: 500,
                                    mb: isSingleMedia ? 0 : 0.5,
                                    display: 'block',
                                }}
                            >
                                {displayName}
                            </Typography>
                            {message.content && message.content !== '<p><br></p>' && (
                                <Typography
                                    sx={{
                                        color: COLORS.textPrimary,
                                        fontSize: SIZES.fontSizeMessage,
                                        lineHeight: 1.4,
                                        wordBreak: 'break-word',
                                        '& b': { fontWeight: 700 },
                                        '& i': { fontStyle: 'italic' },
                                        '& u': { textDecoration: 'underline' },
                                        '& li': { display: 'list-item', listStyleType: 'bullet', ml: 2 },
                                        '& p': { margin: 0 },
                                        '& blockquote': {
                                            borderLeft: `2px solid ${COLORS.accent}`,
                                            pl: 1,
                                            ml: 0.5,
                                        },
                                        '& code': {
                                            bgcolor: 'rgba(255, 255, 255, 0.05)',
                                            p: 0.5,
                                            borderRadius: '4px',
                                        },
                                    }}
                                    dangerouslySetInnerHTML={{ __html: message.content }}
                                />
                            )}
                            <MediaPreview
                                attachments={
                                    !Array.isArray(message?.attachments) || message.attachments.length === 0
                                        ? []
                                        : message.attachments[0]?.temp
                                            ? message.attachments
                                            : normalizeAttachments(message.attachments) || []
                                }
                                isMobile={isMobile}
                                blobUrls={blobUrls}
                                mediaLoaded={mediaLoaded}
                                mediaErrors={mediaErrors}
                                onMediaClick={handleMediaClick}
                                isSingleMedia={isSingleMedia}
                            />
                            {message.isError && (
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={handleRetry}
                                    sx={{
                                        mt: 1,
                                        color: COLORS.error,
                                        borderColor: COLORS.error,
                                        '&:hover': {
                                            borderColor: COLORS.error,
                                            backgroundColor: 'rgba(244, 67, 54, 0.1)',
                                        },
                                    }}
                                >
                                    Повторити
                                </Button>
                            )}
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: isOwnMessage ? 'flex-start' : 'flex-end',
                                    mt: isSingleMedia ? 0.5 : 1,
                                    gap: 0.25,
                                }}
                            >
                                {isOwnMessage ? (
                                    <>
                                        <AnimatePresence>
                                            <motion.div
                                                initial={{ opacity: 0, x: -5 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <DoubleCheckIcon
                                                    color={message.is_read ? COLORS.accent : COLORS.textSecondary}
                                                    fontSize={16}
                                                />
                                            </motion.div>
                                        </AnimatePresence>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: COLORS.textSecondary,
                                                fontSize: '12px',
                                            }}
                                        >
                                            {formatTime(message.created_at)}
                                        </Typography>
                                    </>
                                ) : (
                                    <>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: COLORS.textSecondary,
                                                fontSize: '12px',
                                            }}
                                        >
                                            {formatTime(message.created_at)}
                                        </Typography>
                                        <AnimatePresence>
                                            <motion.div
                                                initial={{ opacity: 0, x: 5 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <DoubleCheckIcon
                                                    color={message.is_read ? COLORS.accent : COLORS.textSecondary}
                                                    fontSize={16}
                                                />
                                            </motion.div>
                                        </AnimatePresence>
                                    </>
                                )}
                            </Box>
                            {isHovered && isOwnMessage && !message.isError && (
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: '50%',
                                        [isOwnMessage ? 'left' : 'right']: '-48px',
                                        transform: 'translateY(-50%)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 1,
                                        bgcolor: COLORS.chatBackground,
                                        p: 0.5,
                                        borderRadius: '8px',
                                        border: `1px solid ${COLORS.border}`,
                                        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
                                    }}
                                >
                                    <IconButton
                                        size="small"
                                        onClick={handleEditOpen}
                                        sx={{
                                            color: COLORS.textSecondary,
                                            '&:hover': { color: COLORS.accent },
                                        }}
                                    >
                                        <Edit fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        onClick={handleDelete}
                                        sx={{
                                            color: COLORS.textSecondary,
                                            '&:hover': { color: '#ff4081' },
                                        }}
                                    >
                                        <Delete fontSize="small" />
                                    </IconButton>
                                </Box>
                            )}
                        </Box>
                    </Box>
                </Box>
            </motion.div>
            <Dialog
                open={isEditModalOpen}
                onClose={handleEditClose}
                maxWidth={isMobile ? 'xs' : 'sm'}
                fullWidth
                sx={{
                    '& .MuiDialog-paper': {
                        background: COLORS.chatBackground,
                        border: `1px solid ${COLORS.border}`,
                        borderRadius: SIZES.borderRadius,
                        backdropFilter: 'blur(15px)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
                        color: COLORS.textPrimary,
                    },
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: SIZES.padding }}>
                    <Typography variant="h6" sx={{ color: COLORS.textPrimary }}>
                        Редагувати повідомлення
                    </Typography>
                    <IconButton
                        onClick={handleEditClose}
                        sx={{ color: COLORS.textSecondary, '&:hover': { color: COLORS.accent } }}
                    >
                        <Close />
                    </IconButton>
                </Box>
                <DialogContent sx={{ p: SIZES.padding, pt: 0 }}>
                    <ReactQuill
                        value={editContent}
                        onChange={setEditContent}
                        modules={quillModules}
                        formats={quillFormats}
                        placeholder="Редагуйте ваше повідомлення..."
                        theme="snow"
                    />
                    <Box sx={{ display: 'flex', gap: 2, mt: 2, justifyContent: 'flex-end' }}>
                        <Button
                            variant="contained"
                            onClick={handleEditSave}
                            disabled={editMessageMutation.isLoading || !editContent?.trim() || editContent === '<p><br></p>'}
                            sx={{
                                bgcolor: COLORS.accent,
                                '&:hover': { bgcolor: '#7b1fa2', boxShadow: '0 0 10px rgba(156, 39, 176, 0.5)' },
                                fontSize: SIZES.fontSizeMessage,
                            }}
                        >
                            Зберегти
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={handleEditClose}
                            sx={{
                                color: COLORS.textPrimary,
                                borderColor: COLORS.border,
                                '&:hover': {
                                    borderColor: COLORS.accent,
                                    backgroundColor: 'rgba(156, 39, 176, 0.1)',
                                },
                                fontSize: SIZES.fontSizeMessage,
                            }}
                        >
                            Скасувати
                        </Button>
                    </Box>
                </DialogContent>
            </Dialog>
            <FullScreenMediaDialog
                open={!!fullScreenMedia}
                onClose={handleFullScreenClose}
                media={fullScreenMedia?.media}
                blobUrls={blobUrls}
            />
        </>
    );
};

export default Message;
