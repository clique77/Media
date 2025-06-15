import React from 'react';
import { Box, Skeleton, Card, CardContent } from '@mui/material';

const ProfileLoadingPlaceholder = () => (
    <Box
        sx={{
            minHeight: '100vh',
            background: 'linear-gradient(180deg, rgba(10, 10, 15, 0.95) 0%, rgba(20, 20, 30, 0.9) 100%)',
            px: { xs: 1, sm: 2, md: 4 },
            py: 4,
        }}
    >
        <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, mb: 4 }}>
                <Skeleton variant="circular" width={150} height={150} sx={{ bgcolor: 'rgba(156, 39, 176, 0.1)' }} />
                <Box sx={{ flexGrow: 1 }}>
                    <Skeleton variant="text" width="60%" height={40} sx={{ mb: 1, bgcolor: 'rgba(156, 39, 176, 0.1)' }} />
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <Skeleton variant="rounded" width={80} height={20} sx={{ bgcolor: 'rgba(156, 39, 176, 0.1)' }} />
                        <Skeleton variant="rounded" width={80} height={20} sx={{ bgcolor: 'rgba(156, 39, 176, 0.1)' }} />
                    </Box>
                    <Skeleton variant="text" width="40%" height={20} sx={{ mb: 2, bgcolor: 'rgba(156, 39, 176, 0.1)' }} />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Skeleton variant="rounded" width={100} height={36} sx={{ bgcolor: 'rgba(156, 39, 176, 0.1)' }} />
                        <Skeleton variant="rounded" width={100} height={36} sx={{ bgcolor: 'rgba(156, 39, 176, 0.1)' }} />
                    </Box>
                </Box>
            </Box>
            <Card sx={{ bgcolor: 'rgba(20, 20, 30, 0.5)', border: '1px solid rgba(156, 39, 176, 0.3)', mb: 3 }}>
                <CardContent>
                    <Skeleton variant="rectangular" height={100} sx={{ mb: 2, bgcolor: 'rgba(156, 39, 176, 0.1)' }} />
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        <Skeleton variant="text" width="50%" height={20} sx={{ bgcolor: 'rgba(156, 39, 176, 0.1)' }} />
                        <Skeleton variant="text" width="50%" height={20} sx={{ bgcolor: 'rgba(156, 39, 176, 0.1)' }} />
                        <Skeleton variant="text" width="50%" height={20} sx={{ bgcolor: 'rgba(156, 39, 176, 0.1)' }} />
                    </Box>
                </CardContent>
            </Card>
        </Box>
    </Box>
);

export default ProfileLoadingPlaceholder;
