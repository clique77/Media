import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { motion } from 'framer-motion';
import { Public, Cake, Wc, AccessTime, CalendarToday, Info } from '@mui/icons-material';
import { formatDate } from '@/utils/formatDate';

const months = [
    'січня', 'лютого', 'березня', 'квітня', 'травня', 'червня',
    'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'
];
const displayDate = (isoDate) => {
    if (!isoDate) return '';
    const datePart = isoDate.split('T')[0];
    const [year, month, day] = datePart.split('-');
    return `${parseInt(day)} ${months[parseInt(month) - 1]} ${year}`;
};

const ProfileInfo = ({ profileUser, isMobile }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
    >
        <Card
            sx={{
                bgcolor: 'rgba(20, 20, 30, 0.5)',
                border: '1px solid rgba(156, 39, 176, 0.3)',
                borderRadius: 2,
                mb: 3,
                position: 'relative',
                overflow: 'visible',
                '&:before': {
                    content: '""',
                    position: 'absolute',
                    top: -2,
                    left: -2,
                    right: -2,
                    bottom: -2,
                    borderRadius: 3,
                    background: 'linear-gradient(45deg, rgba(156, 39, 176, 0.3), transparent)',
                    zIndex: -1,
                },
            }}
        >
            <CardContent>
                {profileUser.biography && (
                    <Box sx={{ mb: 2, p: 2, border: '1px solid rgba(156, 39, 176, 0.2)', borderRadius: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Info sx={{ color: '#9c27b0', fontSize: '1.2rem', alignSelf: 'flex-start' }} />
                            <Typography variant="body2" sx={{ color: '#b0b0b0', mb: 1 }}>
                                Біографія
                            </Typography>
                        </Box>
                        <Box
                            sx={{
                                '& p': { margin: 0 },
                                '& *': { fontSize: '0.875rem', color: '#e0e0e0' },
                            }}
                            dangerouslySetInnerHTML={{ __html: profileUser.biography }}
                        />
                    </Box>
                )}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {profileUser.country && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Public sx={{ color: '#9c27b0', fontSize: '1.2rem' }} />
                            <Typography variant="body2" sx={{ color: '#e0e0e0' }}>
                                Країна: {profileUser.country}
                            </Typography>
                        </Box>
                    )}
                    {profileUser.birthday && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Cake sx={{ color: '#9c27b0', fontSize: '1.2rem' }} />
                            <Typography variant="body2" sx={{ color: '#e0e0e0' }}>
                                День народження: {displayDate(profileUser.birthday)}
                            </Typography>
                        </Box>
                    )}
                    {profileUser.gender && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Wc sx={{ color: '#9c27b0', fontSize: '1.2rem' }} />
                            <Typography variant="body2" sx={{ color: '#e0e0e0' }}>
                                Стать: {profileUser.gender === 'male' ? 'Чоловік' : profileUser.gender === 'female' ? 'Жінка' : 'Інше'}
                            </Typography>
                        </Box>
                    )}
                    {!profileUser.is_online && profileUser.last_seen_at && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AccessTime sx={{ color: '#9c27b0', fontSize: '1.2rem' }} />
                            <Typography variant="body2" sx={{ color: '#e0e0e0' }}>
                                Останній раз онлайн: {formatDate(profileUser.last_seen_at)}
                            </Typography>
                        </Box>
                    )}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarToday sx={{ color: '#9c27b0', fontSize: '1.2rem' }} />
                        <Typography variant="body2" sx={{ color: '#e0e0e0' }}>
                            Зареєстрований: {displayDate(profileUser.created_at)}
                        </Typography>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    </motion.div>
);

export default ProfileInfo;
