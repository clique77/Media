import React from 'react';
import { motion } from 'framer-motion';
import {
    Box,
    Paper,
    Typography,
    Chip,
    Avatar,
    useMediaQuery,
    useTheme
} from '@mui/material';
import {
    Favorite,
    ChatBubbleOutline
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { normalizeAttachments } from '@/utils/normalizeAttachments.js';
import { STORAGE_URL } from '@/config/env.js';

const InlinePostCard = ({ post, onClick }) => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

    const handleClick = () => {
        if (onClick) {
            onClick(post);
        } else {
            navigate(`/posts/${post.slug}`);
        }
    };

    const hasImage = post.attachments?.length > 0 && !!post.attachments[0];
    const media = normalizeAttachments(post.attachments);
    const tagsToShow = post.tags?.slice(0, 3) || [];

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleClick}
        >
            <Paper
                sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: 1,
                    p: isMobile ? 1 : 1.5,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                        backgroundColor: 'rgba(156, 39, 176, 0.1)',
                        boxShadow: '0 0 10px rgba(156, 39, 176, 0.2)'
                    }
                }}
                role="button"
                aria-label={`View post: ${post.title}`}
            >
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    {hasImage && (
                        <Avatar
                            src={STORAGE_URL + media[0].url}
                            variant="square"
                            sx={{
                                width: isMobile ? 40 : isTablet ? 50 : 60,
                                height: isMobile ? 48 : isTablet ? 60 : 68,
                                borderRadius: 1,
                                mr: isMobile ? 1 : 2,
                                objectFit: 'cover',
                                alignSelf: 'center'
                            }}
                            alt="Post attachment"
                        />
                    )}
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography
                            variant={isMobile ? 'caption' : 'subtitle2'}
                            sx={{
                                fontWeight: 600,
                                mb: tagsToShow.length > 0 ? 0.75 : 0.5,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                color: '#ffffff'
                            }}
                        >
                            {post.title}
                        </Typography>
                        {hasImage ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                {tagsToShow.length > 0 && (
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            gap: isMobile ? 0.5 : 1,
                                            flexWrap: 'wrap',
                                            mb: isMobile ? 0.25 : 0.5,
                                            lineHeight: 1.2
                                        }}
                                    >
                                        {tagsToShow.map((tag) => (
                                            <Chip
                                                key={tag}
                                                label={`# ${tag.name}`}
                                                size="small"
                                                sx={{
                                                    bgcolor: 'rgba(156, 39, 176, 0.2)',
                                                    color: '#e0e0e0',
                                                    fontSize: isMobile ? 10 : 12,
                                                    height: isMobile ? 18 : 20,
                                                    lineHeight: 1.2
                                                }}
                                            />
                                        ))}
                                    </Box>
                                )}
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Favorite
                                        sx={{
                                            fontSize: isMobile ? 14 : 16,
                                            color: '#ff4081',
                                            mr: 0.5
                                        }}
                                    />
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            mr: 1,
                                            color: '#e0e0e0',
                                            fontSize: isMobile ? 10 : 12
                                        }}
                                    >
                                        {post.likes_count.toLocaleString()}
                                    </Typography>
                                    <ChatBubbleOutline
                                        sx={{
                                            fontSize: isMobile ? 14 : 16,
                                            color: '#b0b0b0',
                                            mr: 0.5
                                        }}
                                    />
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: '#e0e0e0',
                                            fontSize: isMobile ? 10 : 12
                                        }}
                                    >
                                        {post.comments_count.toLocaleString()}
                                    </Typography>
                                </Box>
                            </Box>
                        ) : (
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    flexWrap: 'wrap'
                                }}
                            >
                                {tagsToShow.length > 0 ? (
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            gap: isMobile ? 0.5 : 1,
                                            flexWrap: 'wrap',
                                            alignItems: 'center'
                                        }}
                                    >
                                        {tagsToShow.map((tag) => (
                                            <Chip
                                                key={tag}
                                                label={`# ${tag.name}`}
                                                size="small"
                                                sx={{
                                                    bgcolor: 'rgba(156, 39, 176, 0.2)',
                                                    color: '#e0e0e0',
                                                    fontSize: isMobile ? 10 : 12,
                                                    height: isMobile ? 18 : 20
                                                }}
                                            />
                                        ))}
                                    </Box>
                                ) : (
                                    <Box sx={{ flexGrow: 1 }} />
                                )}
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Favorite
                                        sx={{
                                            fontSize: isMobile ? 14 : 16,
                                            color: '#ff4081',
                                            mr: 0.5
                                        }}
                                    />
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            mr: 1,
                                            color: '#e0e0e0',
                                            fontSize: isMobile ? 10 : 12
                                        }}
                                    >
                                        {post.likes_count.toLocaleString()}
                                    </Typography>
                                    <ChatBubbleOutline
                                        sx={{
                                            fontSize: isMobile ? 14 : 16,
                                            color: '#b0b0b0',
                                            mr: 0.5
                                        }}
                                    />
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: '#e0e0e0',
                                            fontSize: isMobile ? 10 : 12
                                        }}
                                    >
                                        {post.comments_count.toLocaleString()}
                                    </Typography>
                                </Box>
                            </Box>
                        )}
                    </Box>
                </Box>
            </Paper>
        </motion.div>
    );
};

export default InlinePostCard;
