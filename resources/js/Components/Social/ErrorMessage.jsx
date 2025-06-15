import React from 'react';
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import { ErrorOutline, StarBorder } from '@mui/icons-material';
import { motion } from 'framer-motion';

const ErrorMessage = ({ message, isMobile }) => {
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const isMediumScreen = useMediaQuery(theme.breakpoints.between('sm', 'md'));

    // Випадкові позиції та розміри для зірок
    const stars = Array.from({ length: 10 }).map((_, i) => ({
        top: `${Math.random() * 80 + 10}%`,
        left: `${Math.random() * 80 + 10}%`,
        size: isSmallScreen ? `${0.8 + Math.random() * 0.5}rem` : `${1 + Math.random() * 0.8}rem`,
        delay: `${Math.random() * 2}s`,
    }));

    // Випадкові позиції для частинок
    const particles = Array.from({ length: 15 }).map((_, i) => ({
        top: `${Math.random() * 80 + 10}%`,
        left: `${Math.random() * 80 + 10}%`,
        size: `${2 + Math.random() * 3}px`,
        delay: `${Math.random() * 3}s`,
    }));

    return (
        <Box
            sx={{
                minHeight: '100vh',
                maxHeight: '100vh',
                background: 'linear-gradient(180deg, rgba(10, 10, 15, 0.95) 0%, rgba(20, 20, 30, 0.9) 100%)',
                position: 'relative',
                overflow: 'auto',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                px: { xs: 2, sm: 3, md: 4 },
                py: { xs: 2, sm: 3 }, // Зменшено відступи
            }}
        >
            {/* Зірки */}
            {stars.map((star, i) => (
                <StarBorder
                    key={`star-${i}`}
                    sx={{
                        position: 'absolute',
                        top: star.top,
                        left: star.left,
                        color: 'rgba(156, 39, 176, 0.4)',
                        fontSize: star.size,
                        animation: 'twinkle 3s infinite',
                        animationDelay: star.delay,
                        '@keyframes twinkle': {
                            '0%, 100%': { opacity: 0.4 },
                            '50%': { opacity: 0.9 },
                        },
                    }}
                />
            ))}

            {/* Частинки */}
            {particles.map((particle, i) => (
                <Box
                    key={`particle-${i}`}
                    sx={{
                        position: 'absolute',
                        top: particle.top,
                        left: particle.left,
                        width: particle.size,
                        height: particle.size,
                        background: 'rgba(255, 64, 129, 0.5)', // Рожевий акцент
                        borderRadius: '50%',
                        animation: 'float 4s infinite ease-in-out',
                        animationDelay: particle.delay,
                        '@keyframes float': {
                            '0%, 100%': { transform: 'translateY(0)', opacity: 0.5 },
                            '50%': { transform: 'translateY(-10px)', opacity: 0.8 },
                        },
                    }}
                />
            ))}

            {/* SVG-криві */}
            <svg
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                preserveAspectRatio="none"
            >
                <defs>
                    <linearGradient id="lineGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style={{ stopColor: '#9c27b0', stopOpacity: 0.4 }} />
                        <stop offset="100%" style={{ stopColor: 'transparent', stopOpacity: 0 }} />
                    </linearGradient>
                    <linearGradient id="lineGradient2" x1="100%" y1="0%" x2="0%" y2="0%">
                        <stop offset="0%" style={{ stopColor: '#ff4081', stopOpacity: 0.3 }} />
                        <stop offset="100%" style={{ stopColor: 'transparent', stopOpacity: 0 }} />
                    </linearGradient>
                </defs>
                <path
                    d="M0,100 Q500,50 1000,150 T2000,100"
                    stroke="url(#lineGradient1)"
                    strokeWidth="2"
                    fill="none"
                    style={{ opacity: 0.5 }}
                />
                <path
                    d="M0,200 Q600,150 1200,250 T2400,200"
                    stroke="url(#lineGradient2)"
                    strokeWidth="1.5"
                    fill="none"
                    style={{ opacity: 0.4 }}
                />
            </svg>

            {/* Градієнтний ореол */}
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: { xs: '200px', sm: '300px', md: '400px' },
                    height: { xs: '200px', sm: '300px', md: '400px' },
                    background: 'radial-gradient(circle, rgba(156, 39, 176, 0.2) 0%, transparent 70%)',
                    borderRadius: '50%',
                    zIndex: 0,
                }}
            />

            {/* Основний вміст */}
            <motion.div
                initial={{ opacity: 0, y: 10 }} // Зменшено зміщення
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }} // Прискорено анімацію
                style={{ textAlign: 'center', maxWidth: { xs: '90%', sm: '600px' }, zIndex: 1 }}
            >
                <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                    <ErrorOutline
                        sx={{
                            fontSize: { xs: '3.5rem', sm: '4.5rem', md: '5rem' },
                            color: '#9c27b0',
                            mb: 2,
                            filter: 'drop-shadow(0 0 8px rgba(156, 39, 176, 0.5))',
                        }}
                    />
                </motion.div>
                <Typography
                    variant={isSmallScreen ? 'h5' : isMediumScreen ? 'h4' : 'h3'}
                    sx={{
                        color: '#b0b0b0',
                        fontWeight: 600,
                        mb: 1,
                        textShadow: '0 0 5px rgba(156, 39, 176, 0.3)',
                    }}
                >
                    Помилка
                </Typography>
                <Typography
                    variant={isSmallScreen ? 'body1' : isMediumScreen ? 'h6' : 'h5'}
                    sx={{
                        color: '#b0b0b0',
                        fontWeight: 400,
                        lineHeight: 1.6,
                        maxWidth: '500px',
                        mx: 'auto',
                    }}
                >
                    {message || 'Щось пішло не так. Спробуйте пізніше.'}
                </Typography>
            </motion.div>
        </Box>
    );
};

export default ErrorMessage;
