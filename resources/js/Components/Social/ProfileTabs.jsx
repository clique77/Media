import React from 'react';
import {Avatar, Box, Button, Card, CardContent, CircularProgress, Tab, Tabs, Typography} from '@mui/material';
import {motion} from 'framer-motion';
import PostCard from '@/Components/Social/PostCard.jsx';
import UserCard from "@/Components/Social/UserCard.jsx";

const ProfileTabs = ({
                         activeTab,
                         handleTabChange,
                         friendsData,
                         userPosts,
                         likedPosts,
                         hasNextPosts,
                         hasNextLikedPosts,
                         isFetchingNextPosts,
                         isFetchingNextLikedPosts,
                         fetchNextPosts,
                         fetchNextLikedPosts,
                         navigate,
                         isMobile,
                         isOwner,
                         isLoading,
                         isFetching,
                     }) => (
    <motion.div
        initial={{opacity: 0, y: 20}}
        animate={{opacity: 1, y: 0}}
        transition={{duration: 0.5, delay: 0.4}}
    >
        <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{
                borderBottom: '1px solid rgba(156, 39, 176, 0.3)',
                '& .MuiTab-root': {color: '#b0b0b0', fontWeight: 500},
                '& .Mui-selected': {color: '#9c27b0', fontWeight: 700},
                '& .MuiTabs-indicator': {backgroundColor: '#9c27b0', height: 3},
            }}
        >
            <Tab label="Пости" value="posts"/>
            <Tab label={`Друзі (${friendsData?.length || 0})`} value="friends"/>
            {isOwner && <Tab label="Лайкнуті пости" value="likedPosts"/>}
        </Tabs>
        <Box sx={{mt: 3}}>
            {activeTab === 'posts' && (
                <Box sx={{maxWidth: {xs: '100%', sm: '90%', md: '700px'}, mx: 'auto', p: 2}}>
                    {(isLoading || isFetching) && (
                        <Box sx={{display: 'flex', justifyContent: 'center', mt: 2}}>
                            <CircularProgress size={32} sx={{color: '#9c27b0'}}/>
                        </Box>
                    )}
                    {!isLoading && !isFetching && userPosts?.pages?.flatMap((page) => page.data).length > 0 ? (
                        <>
                            {userPosts.pages.flatMap((page) =>
                                page.data.map((post) => (
                                    <motion.div
                                        key={post.id}
                                        initial={{opacity: 0, y: 10}}
                                        animate={{opacity: 1, y: 0}}
                                        transition={{duration: 0.3}}
                                    >
                                        <PostCard post={post} postSlug={post.slug} compact/>
                                    </motion.div>
                                ))
                            )}
                            {isFetchingNextPosts && (
                                <Box sx={{display: 'flex', justifyContent: 'center', mt: 2}}>
                                    <CircularProgress size={32} sx={{color: '#9c27b0'}}/>
                                </Box>
                            )}
                            {hasNextPosts && (
                                <Button
                                    onClick={() => fetchNextPosts()}
                                    disabled={isFetchingNextPosts}
                                    sx={{
                                        color: '#9c27b0',
                                        bgcolor: 'rgba(20, 20, 30, 0.5)',
                                        mt: 2,
                                        px: 3,
                                        py: 1,
                                        borderRadius: 2,
                                        '&:hover': {bgcolor: 'rgba(156, 39, 176, 0.1)'},
                                        display: 'block',
                                        mx: 'auto',
                                    }}
                                >
                                    {isFetchingNextPosts ? 'Завантаження...' : 'Завантажити більше'}
                                </Button>
                            )}
                        </>
                    ) : (
                        !isLoading && !isFetching && !isFetchingNextPosts && (
                            <Typography sx={{color: '#b0b0b0', textAlign: 'center', py: 2}}>
                                Немає постів
                            </Typography>
                        )
                    )}
                </Box>
            )}
            {activeTab === 'friends' && (
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                            xs: '1fr', // Одна картка на всю ширину на мобільних
                            sm: '1fr', // Одна картка на sm, щоб вмістити ширшу карточку
                            md: '1fr 1fr', // Дві картки на md і більше
                        },
                        gap: 2,
                        maxWidth: { xs: '100%', sm: '90%', md: '900px' }, // Збільшено maxWidth для ширших карточок
                        mx: 'auto', // Центрування контейнера
                        p: 2,
                        justifyContent: 'center', // Центрування елементів у сітці
                    }}
                >
                    {friendsData?.length > 0 ? (
                        friendsData.map((friend) => (
                            <motion.div
                                key={friend.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3 }}
                                sx={{ display: 'flex', justifyContent: 'center' }}
                            >
                                <UserCard
                                    user={friend}
                                    sx={{
                                        bgcolor: 'rgba(20, 20, 30, 0.5)',
                                        width: { xs: '100%', sm: '90%', md: '400px' },
                                        maxWidth: '400px',
                                        '&:hover': {
                                            bgcolor: 'rgba(156, 39, 176, 0.1)',
                                            transform: 'translateY(-2px)',
                                        },
                                        transition: 'all 0.3s',
                                        mx: 'auto',
                                    }}
                                />
                            </motion.div>
                        ))
                    ) : (
                        <Typography sx={{ color: '#b0b0b0', textAlign: 'center', py: 2 }}>
                            Немає друзів
                        </Typography>
                    )}
                </Box>
            )}
            {activeTab === 'likedPosts' && isOwner && (
                <Box sx={{maxWidth: {xs: '100%', sm: '90%', md: '700px'}, mx: 'auto', p: 2}}>
                    {(isLoading || isFetching) && (
                        <Box sx={{display: 'flex', justifyContent: 'center', mt: 2}}>
                            <CircularProgress size={32} sx={{color: '#9c27b0'}}/>
                        </Box>
                    )}
                    {!isLoading && !isFetching && likedPosts?.pages?.flatMap((page) => page.data).length > 0 ? (
                        <>
                            {likedPosts.pages.flatMap((page) =>
                                page.data.map((post) => (
                                    <motion.div
                                        key={post.id}
                                        initial={{opacity: 0, y: 10}}
                                        animate={{opacity: 1, y: 0}}
                                        transition={{duration: 0.3}}
                                    >
                                        <PostCard post={post} compact/>
                                    </motion.div>
                                ))
                            )}
                            {isFetchingNextLikedPosts && (
                                <Box sx={{display: 'flex', justifyContent: 'center', mt: 2}}>
                                    <CircularProgress size={32} sx={{color: '#9c27b0'}}/>
                                </Box>
                            )}
                            {hasNextLikedPosts && (
                                <Button
                                    onClick={() => fetchNextLikedPosts()}
                                    disabled={isFetchingNextLikedPosts}
                                    sx={{
                                        color: '#9c27b0',
                                        bgcolor: 'rgba(20, 20, 30, 0.5)',
                                        mt: 2,
                                        px: 3,
                                        py: 1,
                                        borderRadius: 2,
                                        '&:hover': {bgcolor: 'rgba(156, 39, 176, 0.1)'},
                                        display: 'block',
                                        mx: 'auto',
                                    }}
                                >
                                    {isFetchingNextLikedPosts ? 'Завантаження...' : 'Завантажити більше'}
                                </Button>
                            )}
                        </>
                    ) : (
                        !isLoading && !isFetching && !isFetchingNextLikedPosts && (
                            <Typography sx={{color: '#b0b0b0', textAlign: 'center', py: 2}}>
                                Немає лайкнутих постів
                            </Typography>
                        )
                    )}
                </Box>
            )}
        </Box>
    </motion.div>
);

export default ProfileTabs;
