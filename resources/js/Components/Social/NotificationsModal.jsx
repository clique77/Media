import React from 'react';
import {
    Box,
    Modal,
    Typography,
    List,
    Button,
    Divider,
    CircularProgress,
    IconButton,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Close } from '@mui/icons-material';
import NotificationCard from './NotificationCard';

const NotificationsModal = ({ open, onClose, notifications = [], loadMore, hasMore, isLoading, isError, error, onDelete }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="notifications-modal-title"
            sx={{
                backdropFilter: 'blur(20px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflowY: 'auto',
            }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
            >
                <Box
                    sx={{
                        width: isMobile ? 'calc(100vw - 16px)' : { xs: '90%', sm: 600, md: 800 }, // Near full-width with 8px margins
                        maxHeight: isMobile ? '80vh' : '90vh', // Cap height to avoid system UI
                        bgcolor: 'rgba(10, 10, 15, 0.9)',
                        borderRadius: '16px', // Consistent rounded corners
                        border: '1px solid rgba(156, 39, 176, 0.2)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
                        overflow: 'hidden', // Prevent content from spilling
                        backdropFilter: 'blur(20px)', // Strong blur for modal
                        boxSizing: 'border-box',
                        mx: isMobile ? 'auto' : 0, // Center horizontally
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    {/* Fixed Header */}
                    <Box
                        sx={{
                            position: 'sticky',
                            top: 0,
                            zIndex: 1,
                            p: { xs: '16px 16px 8px', sm: '20px 20px 12px', md: '24px 24px 16px' },
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography
                                id="notifications-modal-title"
                                variant="h5"
                                sx={{
                                    flexGrow: 1,
                                    color: '#ffffff',
                                    fontWeight: 600,
                                    fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
                                    background: 'linear-gradient(45deg, #9c27b0, #ff4081)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
                                }}
                            >
                                Сповіщення
                            </Typography>
                            <IconButton
                                onClick={onClose}
                                sx={{
                                    color: '#ff4081',
                                    padding: { xs: '6px', sm: '8px' },
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 64, 129, 0.2)',
                                    },
                                }}
                            >
                                <Close sx={{ fontSize: { xs: 20, sm: 24 } }} />
                            </IconButton>
                        </Box>
                        <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.12)', mt: { xs: 1, sm: 1.5 } }} />
                    </Box>

                    {/* Scrollable Content */}
                    <Box
                        sx={{
                            flex: 1,
                            overflowY: 'auto',
                            p: { xs: '8px 16px 16px', sm: '12px 20px 24px', md: '16px 24px 32px' },
                            scrollbarWidth: 'none',
                            '&::-webkit-scrollbar': { display: 'none' },
                            WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
                        }}
                    >
                        {isError ? (
                            <Typography
                                sx={{
                                    color: '#ff4444',
                                    textAlign: 'center',
                                    py: 3,
                                    fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                                }}
                            >
                                Помилка: {error?.message || 'Не вдалося завантажити сповіщення'}
                            </Typography>
                        ) : isLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                                <CircularProgress size={isMobile ? 24 : 32} sx={{ color: '#9c27b0' }} />
                            </Box>
                        ) : (
                            <List sx={{ p: 0 }}>
                                {notifications.length > 0 ? (
                                    <AnimatePresence>
                                        {notifications.map((notification, index) => (
                                            <NotificationCard
                                                key={notification.id || index}
                                                notification={notification}
                                                onClose={onClose}
                                                onDelete={onDelete}
                                            />
                                        ))}
                                    </AnimatePresence>
                                ) : (
                                    <Typography
                                        sx={{
                                            color: '#e0e0e0',
                                            textAlign: 'center',
                                            py: 3,
                                            fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                                        }}
                                    >
                                        Немає нових сповіщень
                                    </Typography>
                                )}
                            </List>
                        )}
                        {hasMore && !isLoading && !isError && (
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button
                                    onClick={loadMore}
                                    sx={{
                                        mt: { xs: 2, sm: 3 },
                                        mx: 'auto',
                                        display: 'block',
                                        color: '#e0e0e0',
                                        bgcolor: '#9c27b0',
                                        borderRadius: '12px',
                                        fontWeight: 500,
                                        fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                                        px: { xs: 2, sm: 3 },
                                        py: { xs: 0.75, sm: 1 },
                                        boxShadow: '0 0 10px rgba(156, 39, 176, 0.5)',
                                        '&:hover': {
                                            bgcolor: '#7b1fa2',
                                            boxShadow: '0 0 15px rgba(156, 39, 176, 0.7)',
                                        },
                                        minWidth: { xs: 120, sm: 160 }, // Larger touch target
                                    }}
                                >
                                    Завантажити ще
                                </Button>
                            </motion.div>
                        )}
                    </Box>
                </Box>
            </motion.div>
        </Modal>
    );
};

export default NotificationsModal;
