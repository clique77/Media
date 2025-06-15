import React from 'react';
import {motion} from 'framer-motion';
import {Box, Button, Typography, useMediaQuery, useTheme} from '@mui/material';
import {RocketLaunch} from '@mui/icons-material';
import {Link} from 'react-router-dom';

const NotFoundPage = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Box
            sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)',
                color: '#e0e0e0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                p: 3,
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.7)),
                    url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C27B0' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    opacity: 0.3,
                    zIndex: 0
                }
            }}
        >
            {/* Main content */}
            <Box
                sx={{
                    position: 'relative',
                    zIndex: 1,
                    maxWidth: '100%',
                    width: {xs: '100%', sm: '90%', md: '800px'},
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}
            >
                <motion.div
                    initial={{scale: 0.8, opacity: 0}}
                    animate={{scale: 1, opacity: 1}}
                    transition={{duration: 0.6}}
                >
                    <RocketLaunch
                        sx={{
                            fontSize: isMobile ? 100 : 150,
                            color: '#9c27b0',
                            mb: 3,
                            opacity: 0.9
                        }}
                    />
                </motion.div>

                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.5, delay: 0.2}}
                >
                    <Typography
                        variant={isMobile ? 'h3' : 'h2'}
                        sx={{
                            fontWeight: 700,
                            color: '#ffffff',
                            mb: 2,
                            lineHeight: 1.2
                        }}
                    >
                        404 - Сторінку не знайдено
                    </Typography>
                </motion.div>

                <motion.div
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    transition={{duration: 0.5, delay: 0.4}}
                >
                    <Typography
                        variant={isMobile ? 'body1' : 'h6'}
                        sx={{
                            color: '#b0b0b0',
                            mb: 4,
                            maxWidth: '600px',
                            lineHeight: 1.6
                        }}
                    >
                        Схоже, ви заблукали у космосі інтернету. Сторінка, яку ви шукаєте,<br/>
                        або була переміщена, або ніколи не існувала.
                    </Typography>
                </motion.div>

                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.5, delay: 0.6}}
                    style={{display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center'}}
                >
                    <Button
                        component={Link}
                        to="/"
                        variant="contained"
                        sx={{
                            bgcolor: '#9c27b0',
                            color: '#ffffff',
                            fontWeight: 600,
                            px: 4,
                            py: 1.5,
                            borderRadius: '8px',
                            textTransform: 'none',
                            fontSize: isMobile ? '0.875rem' : '1rem',
                            minWidth: '200px',
                            '&:hover': {
                                bgcolor: '#7b1fa2',
                                boxShadow: '0 0 15px rgba(156, 39, 176, 0.5)'
                            }
                        }}
                    >
                        На головну
                    </Button>

                    <Button
                        component={Link}
                        to="/posts"
                        variant="outlined"
                        sx={{
                            borderColor: 'rgba(156, 39, 176, 0.5)',
                            color: '#e0e0e0',
                            fontWeight: 600,
                            px: 4,
                            py: 1.5,
                            borderRadius: '8px',
                            textTransform: 'none',
                            fontSize: isMobile ? '0.875rem' : '1rem',
                            minWidth: '200px',
                            '&:hover': {
                                borderColor: '#9c27b0',
                                backgroundColor: 'rgba(156, 39, 176, 0.1)'
                            }
                        }}
                    >
                        До постів
                    </Button>
                </motion.div>

                <motion.div
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    transition={{duration: 0.5, delay: 0.8}}
                >
                    <Typography
                        variant="caption"
                        sx={{
                            display: 'block',
                            mt: 4,
                            color: 'rgba(176, 176, 176, 0.5)',
                            fontFamily: 'monospace'
                        }}
                    >
                        // Шлях: {window.location.pathname}
                    </Typography>
                </motion.div>
            </Box>

            {/* Stars animation */}
            {[...Array(20)].map((_, i) => (
                <motion.div
                    key={i}
                    style={{
                        position: 'absolute',
                        backgroundColor: '#fff',
                        borderRadius: '50%',
                        width: `${Math.random() * 3 + 1}px`,
                        height: `${Math.random() * 3 + 1}px`,
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        opacity: 0
                    }}
                    animate={{
                        opacity: [0, 0.8, 0],
                        scale: [1, 1.5, 1]
                    }}
                    transition={{
                        duration: Math.random() * 3 + 2,
                        repeat: Infinity,
                        repeatType: 'reverse',
                        delay: Math.random() * 5
                    }}
                />
            ))}
        </Box>
    );
};

export default NotFoundPage;
