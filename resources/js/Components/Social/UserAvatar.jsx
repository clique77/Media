import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Avatar } from '@mui/material';
import { useIsUserOnline } from '@/Components/Social/OnlineUsersProvider.jsx'; // Adjust the import path as needed

const UserAvatar = ({ userId, src, alt = 'Аватар користувача', size = 40 }) => {
    const isOnline = useIsUserOnline(userId);

    // Animation variants for the online status indicator
    const statusIndicatorVariants = {
        hidden: { opacity: 0, scale: 0 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.3,
                ease: 'easeOut',
            },
        },
        exit: {
            opacity: 0,
            scale: 0,
            transition: {
                duration: 0.2,
                ease: 'easeIn',
            },
        },
    };

    // Animation for the gradient border
    const borderVariants = {
        hidden: { opacity: 0, scale: 1 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.5,
                ease: 'easeOut',
                repeat: Infinity,
                repeatType: 'reverse', // Pulsing effect
            },
        },
    };

    return (
        <Box
            sx={{
                position: 'relative',
                width: { xs: size * 0.8, sm: size }, // Responsive size
                height: { xs: size * 0.8, sm: size },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            {/* Animated Gradient Border (Online Only) */}
            <AnimatePresence>
                {isOnline && (
                    <motion.div
                        variants={borderVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        style={{
                            position: 'absolute',
                            width: 'calc(100% + 4px)', // Thin border
                            height: 'calc(100% + 4px)',
                            borderRadius: '50%',
                            background: 'linear-gradient(45deg, #ff4081, #9c27b0, #d81b60, #4a148c)',
                            backgroundSize: '200% 200%',
                            animation: 'gradientShift 4s ease infinite',
                            backdropFilter: 'blur(4px)', // Subtle blur effect
                            boxShadow: '0 0 10px rgba(156, 39, 176, 0.6)', // Softer purple glow
                            zIndex: 0,
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Avatar */}
            <Avatar
                src={src}
                alt={alt}
                sx={{
                    width: '100%',
                    height: '100%',
                    border: `2px solid ${isOnline ? '#9c27b0' : '#4a148c'}`, // Vibrant purple for online, dark for offline
                    backgroundColor: '#121212', // Near-black fallback
                    boxShadow: `0 4px 12px rgba(${isOnline ? '156, 39, 176' : '74, 20, 140'}, 0.5)`, // Purple shadow
                    zIndex: 1,
                }}
            />

            {/* Status Indicator (Online Only) */}
            <AnimatePresence>
                {isOnline && (
                    <motion.div
                        variants={statusIndicatorVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        style={{
                            position: 'absolute',
                            bottom: '-2px', // Positioned up and left
                            right: '-2px',
                            width: { xs: '25%', sm: '28%' }, // Small size
                            height: { xs: '25%', sm: '28%' },
                            minWidth: '10px', // Minimum visibility
                            minHeight: '10px',
                            backgroundColor: '#9c27b0', // Vibrant purple for harmony
                            borderRadius: '50%',
                            border: '1.5px solid #4a148c', // Dark purple border
                            boxShadow:
                                '0 0 8px rgba(156, 39, 176, 0.7), 0 0 12px rgba(156, 39, 176, 0.4)', // Softer glow
                            animation: 'pulse 2.5s ease-in-out infinite', // Soft pulse
                            zIndex: 2, // Above avatar
                        }}
                    />
                )}
            </AnimatePresence>

            {/* CSS for Animations */}
            <style>
                {`
                    @keyframes gradientShift {
                        0% {
                            background-position: 0% 50%;
                        }
                        50% {
                            background-position: 100% 50%;
                        }
                        100% {
                            background-position: 0% 50%;
                        }
                    }
                    @keyframes pulse {
                        0% {
                            transform: scale(1);
                            box-shadow: 0 0 8px rgba(156, 39, 176, 0.7), 0 0 12px rgba(156, 39, 176, 0.4);
                        }
                        50% {
                            transform: scale(1.1);
                            box-shadow: 0 0 10px rgba(156, 39, 176, 0.8), 0 0 14px rgba(156, 39, 176Strona: 0.5);
                        }
                        100% {
                            transform: scale(1);
                            box-shadow: 0 0 8px rgba(156, 39, 176, 0.7), 0 0 12px rgba(156, 39, 176, 0.4);
                        }
                    }
                `}
            </style>
        </Box>
    );
};

export default UserAvatar;
