import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Person, StarBorder } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const UserNotFound = () => {
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(180deg, rgba(10, 10, 15, 0.95) 0%, rgba(20, 20, 30, 0.9) 100%)',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                paddingTop: { xs: '10vh', sm: '15vh', md: '20vh' },
                px: { xs: 2, sm: 4 },
                py: 4,
            }}
        >
            {[...Array(5)].map((_, i) => (
                <StarBorder
                    key={i}
                    sx={{
                        position: 'absolute',
                        top: `${20 + i * 15}%`,
                        left: `${10 + i * 20}%`,
                        color: 'rgba(156, 39, 176, 0.3)',
                        fontSize: { xs: '1rem', sm: '1.5rem' },
                        animation: 'twinkle 3s infinite',
                        animationDelay: `${i * 0.5}s`,
                        '@keyframes twinkle': {
                            '0%, 100%': { opacity: 0.3 },
                            '50%': { opacity: 0.8 },
                        },
                    }}
                />
            ))}
            <svg
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                preserveAspectRatio="none"
            >
                <defs>
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style={{ stopColor: '#9c27b0', stopOpacity: 0.3 }} />
                        <stop offset="100%" style={{ stopColor: 'transparent', stopOpacity: 0 }} />
                    </linearGradient>
                </defs>
                <path
                    d="M0,100 Q500,50 1000,150 T2000,100"
                    stroke="url(#lineGradient)"
                    strokeWidth="2"
                    fill="none"
                    style={{ opacity: 0.5 }}
                />
            </svg>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Box sx={{ textAlign: 'center', maxWidth: 600, mx: 'auto' }}>
                    <Person sx={{ fontSize: 80, color: '#ff4081', mb: 2 }} />
                    <Typography variant="h4" sx={{ color: '#e0e0e0', fontWeight: 700, mb: 2 }}>
                        Користувача не знайдено
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#b0b0b0', mb: 4 }}>
                        Схоже, такого користувача не існує. Спробуйте знайти іншого або поверніться на головну сторінку.
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Button
                            variant="contained"
                            onClick={() => navigate('/users')}
                            sx={{
                                bgcolor: '#9c27b0',
                                '&:hover': { bgcolor: '#7b1fa2', boxShadow: '0 0 10px rgba(156, 39, 176, 0.5)' },
                                transition: 'all 0.3s',
                            }}
                        >
                            До списку користувачів
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={() => navigate('/')}
                            sx={{
                                color: '#e0e0e0',
                                borderColor: 'rgba(156, 39, 176, 0.3)',
                                '&:hover': { borderColor: '#9c27b0', bgcolor: 'rgba(156, 39, 176, 0.1)' },
                                transition: 'all 0.3s',
                            }}
                        >
                            На головну
                        </Button>
                    </Box>
                </Box>
            </motion.div>
        </Box>
    );
};

export default UserNotFound;
