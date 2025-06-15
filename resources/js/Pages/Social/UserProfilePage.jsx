import React, {useEffect, useMemo, useState} from 'react';
import {Box, useMediaQuery, useTheme} from '@mui/material';
import {StarBorder} from '@mui/icons-material';
import {motion} from 'framer-motion';
import {useInfiniteQuery, useMutation, useQuery, useQueryClient} from 'react-query';
import {useNavigate, useParams} from 'react-router-dom';
import {chatActions, friendshipActions, likeActions, postActions, userActions, userBlockActions} from '@/api/actions';
import {useAuth} from '@/Components/Auth/AuthProvider.jsx';
import {useIsUserOnline} from '@/Components/Social/OnlineUsersProvider.jsx';
import ProfileLoadingPlaceholder from '@/Components/Social/ProfileLoadingPlaceholder.jsx';
import ProfileHeader from '@/Components/Social/ProfileHeader.jsx';
import ProfileInfo from '@/Components/Social/ProfileInfo.jsx';
import ProfileTabs from '@/Components/Social/ProfileTabs.jsx';
import EditProfileDialog from '@/Components/Social/EditProfileDialog.jsx';
import UserNotFound from '@/Components/Social/UserNotFound.jsx';
import {toast} from 'react-toastify';

const UserProfilePage = () => {
    const {username} = useParams();
    const {isAuthenticated, user, setUser} = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
    const [activeTab, setActiveTab] = useState('posts');
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editForm, setEditForm] = useState({
        username: '',
        first_name: '',
        last_name: '',
        biography: '',
        country: '',
        birthday: '',
        gender: '',
        avatar: '',
    });
    const isOnline = useIsUserOnline(user?.id);

    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: 'instant',
        });
    }, []);

    const formatLastSeen = () => {
        if (isOnline) return 'Онлайн';
        if (!profileUser?.last_seen_at) return 'Невідомо';

        const lastSeen = new Date(profileUser.last_seen_at);
        const now = new Date();
        const diffHours = Math.floor((now - lastSeen) / (1000 * 60 * 60));

        if (diffHours < 1) return 'Був(ла) нещодавно';
        if (diffHours < 24) return `Був(ла) ${diffHours} год. тому`;
        return `Був(ла) ${Math.floor(diffHours / 24)} дн. тому`;
    };

    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: 'instant',
        });
    }, []);

    const {data: profileUser, isLoading, isError} = useQuery(
        ['user', username],
        () => userActions.getUser(username).then((res) => res.data.data),
        {
            staleTime: 1000 * 60,
            select: (data) => ({
                id: data.id,
                username: data.username,
                first_name: data.first_name || '',
                last_name: data.last_name || '',
                email: data.email,
                biography: data.biography || '',
                country: data.country || '',
                birthday: data.birthday || '',
                gender: data.gender || '',
                avatar: data.avatar || `https://i.pravatar.cc/150?img=${data.id}`,
                is_online: data.is_online || false,
                last_seen_at: data.last_seen_at || '',
                created_at: data.created_at,
                role: data.role || '',
            }),
        }
    );

    const isOwner = isAuthenticated && user?.username === profileUser?.username;

    const {data: friendsData, isLoading: isFriendsLoading} = useQuery(
        ['friends', username],
        () => friendshipActions.getFriends(profileUser.id).then((res) => res.data),
        {
            enabled: !!profileUser,
            retry: 1,
            refetchOnWindowFocus: false,
            select: (data) =>
                data.map((friend) => ({
                    id: friend.id,
                    username: friend.username,
                    avatar: friend.avatar || `https://i.pravatar.cc/150?img=${friend.id}`,
                    friendship_id: friend.pivot.friendship_id,
                })),
        }
    );

    const {data: sentRequests, isLoading: isSentRequestsLoading} = useQuery(
        ['sentRequests', user?.username],
        () => friendshipActions.getSentFriendRequests(user.id).then((res) => res.data.data),
        {enabled: isAuthenticated && !!user, retry: 1, refetchOnWindowFocus: false}
    );

    const {data: receivedRequests, isLoading: isReceivedRequestsLoading} = useQuery(
        ['receivedRequests', user?.username],
        () => friendshipActions.getReceivedFriendRequests(user.id).then((res) => res.data.data),
        {enabled: isAuthenticated && !!user, retry: 1, refetchOnWindowFocus: false}
    );
    const isFriendshipDataLoading = isFriendsLoading || isSentRequestsLoading || isReceivedRequestsLoading;

    const friendStatus = useMemo(() => {
        if (!isAuthenticated || !profileUser || user.username === profileUser.username) return 'none';
        if (friendsData?.some((friend) => friend.id === user.id)) {
            return 'accepted';
        }
        const sentRequest = sentRequests?.find((req) => req.friend_id === profileUser.id);
        if (sentRequest) {
            return {status: 'pending_sent', friendshipId: sentRequest.id};
        }
        const receivedRequest = receivedRequests?.find((req) => req.user_id === profileUser.id);
        if (receivedRequest) {
            return {status: 'pending_received', friendshipId: receivedRequest.id};
        }
        return 'none';
    }, [friendsData, sentRequests, receivedRequests, profileUser, user, isAuthenticated]);

    const {
        data: userPosts,
        fetchNextPage: fetchNextPosts,
        hasNextPage: hasNextPosts,
        isFetchingNextPage: isFetchingNextPosts,
        isLoading: isLoadingPosts,
        isFetching: isFetchingPosts,
    } = useInfiniteQuery(
        ['userPosts', username],
        ({pageParam = null}) =>
            postActions.getPosts({
                'filter[user.username]': username,
                perPage: 10,
                cursor: pageParam
            }).then((res) => res.data),
        {
            getNextPageParam: (lastPage) => lastPage.next_cursor || undefined,
            enabled: !!profileUser,
            refetchOnWindowFocus: false,
            select: (data) => ({
                pages: data.pages.map((page) => ({
                    ...page,
                    data: page.data.map((post) => ({
                        id: post.id,
                        title: post.title,
                        content: post.content,
                        slug: post.slug,
                        likes_count: post.likes_count || 0,
                        comments_count: post.comments_count || 0,
                        views_count: post.views_count || 0,
                        visibility: post.visibility || 'public',
                        created_at: post.created_at,
                        user: {
                            id: post.user?.id,
                            username: post.user?.username || 'Anonymous',
                            avatar: post.user?.avatar || `https://i.pravatar.cc/150?img=${post.user?.id || 0}`,
                        },
                        tags: post.tags ? post.tags.map((tag) => tag.name) : [],
                        attachments: post.attachments || [],
                        user_liked: post.user_liked || false,
                        like_id: post.like_id || null,
                    })),
                })),
                pageParams: data.pageParams,
            }),
        }
    );

    const {
        data: likedPosts,
        fetchNextPage: fetchNextLikedPosts,
        hasNextPage: hasNextLikedPosts,
        isFetchingNextPage: isFetchingNextLikedPosts,
        isLoading: isLoadingLikedPosts,
        isFetching: isFetchingLikedPosts,
    } = useInfiniteQuery(
        ['likedPosts', username],
        ({pageParam = null}) =>
            likeActions.getUserLikes({
                username,
                'filter[likeable_type]': 'App\\Models\\Post',
                perPage: 10,
                cursor: pageParam
            }).then((res) => res.data),
        {
            getNextPageParam: (lastPage) => lastPage.next_cursor || undefined,
            enabled: !!profileUser && isAuthenticated && user.username === profileUser.username,
            retry: false,
            refetchOnWindowFocus: false,
            select: (data) => ({
                pages: data.pages.map((page) => ({
                    ...page,
                    data: page.data.data.map((like) => ({
                        id: like.likeable.id,
                        title: like.likeable.title,
                        content: like.likeable.content,
                        slug: like.likeable.slug,
                        likes_count: like.likeable.likes_count || 0,
                        comments_count: like.likeable.comments_count || 0,
                        views_count: like.likeable.views_count || 0,
                        visibility: like.likeable.visibility || 'public',
                        created_at: like.likeable.created_at,
                        user: {
                            id: like.likeable.user?.id,
                            username: like.likeable.user?.username || 'Anonymous',
                            avatar: like.likeable.user?.avatar || `https://i.pravatar.cc/150?img=${like.likeable.user?.id || 0}`,
                        },
                        tags: like.likeable.tags ? like.likeable.tags.map((tag) => tag.name) : [],
                        attachments: like.likeable.attachments || [],
                        user_liked: like.likeable.user_liked || false,
                        like_id: like.likeable.like_id || null,
                    })),
                })),
                pageParams: data.pageParams,
            }),
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Помилка завантаження лайкнутих постів');
            },
        }
    );

    const createChatMutation = useMutation(
        (payload) => chatActions.createChat(payload),
        {
            onSuccess: (response) => {
                const chatId = response.data.data.id;
                navigate(`/chats/${chatId}`);
            },
            onError: (error) => {
                toast.error(error.response?.data?.error || 'Щось пішло не так');
            },
        }
    );
    const { data: blockData, isLoading: isBlockLoading } = useQuery(
        ['userBlocks', profileUser?.username],
        () => userBlockActions.getUserBlocks(`filter[blocked.username]=${profileUser.username}`).then((res) => res.data),
        {
            enabled: isAuthenticated && !!profileUser && !isOwner,
            retry: 1,
            refetchOnWindowFocus: false,
            select: (data) => data[0] || null,
        }
    );
    const blockUserMutation = useMutation(
        (payload) => userBlockActions.createUserBlock(payload),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['userBlocks', profileUser.username]);
                toast.success('Користувача заблоковано!');
            },
            onError: (error) => {
                toast.error(error.response?.data?.error || 'Не вдалося заблокувати користувача');
            },
        }
    );

    const unblockUserMutation = useMutation(
        (blockId) => userBlockActions.deleteUserBlock(blockId),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['userBlocks', profileUser.username]);
                toast.success('Користувача розблоковано!');
            },
            onError: (error) => {
                toast.error(error.response?.data?.error || 'Не вдалося розблокувати користувача');
            },
        }
    );

    const handleBlockAction = () => {
        if (blockData) {
            unblockUserMutation.mutate(blockData.id);
        } else {
            blockUserMutation.mutate({ blocked_id: profileUser.id });
        }
    };
    const handleEditSave = () => {
        if (!editForm.username || editForm.username.length < 3 || editForm.username.length > 50) {
            toast.error('Ім\'я користувача має бути від 3 до 50 символів');
            return;
        }
        if (editForm.biography && editForm.biography.replace(/<(.|\n)*?>/g, '').length > 1000) {
            toast.error('Біографія не може перевищувати 1000 символів');
            return;
        }
        if (editForm.first_name && editForm.first_name.length > 50) {
            toast.error('Ім\'я не може перевищувати 50 символів');
            return;
        }
        if (editForm.last_name && editForm.last_name.length > 50) {
            toast.error('Прізвище не може перевищувати 50 символів');
            return;
        }

        const formData = new FormData();
        if (editForm.username) formData.append('username', editForm.username);
        if (editForm.first_name) formData.append('first_name', editForm.first_name);
        if (editForm.last_name) formData.append('last_name', editForm.last_name);
        if (editForm.biography && editForm.biography !== '<p><br></p>') {
            formData.append('biography', editForm.biography);
        }
        if (editForm.country) formData.append('country', editForm.country);
        if (editForm.birthday) formData.append('birthday', editForm.birthday);
        if (editForm.gender) formData.append('gender', editForm.gender);
        if (editForm.avatar instanceof File) {
            formData.append('avatar', editForm.avatar);
        }

        updateUserMutation.mutate(formData);
    };

    const updateUserMutation = useMutation(
        (formData) => userActions.updateUser(user.id, formData),
        {
            onSuccess: (response) => {
                queryClient.setQueryData(['user', username], (oldData) => ({
                    ...oldData,
                    ...response.data.data,
                    avatar: response.data.data.avatar || oldData.avatar,
                }));
                setIsEditDialogOpen(false);
                setUser(response.data.data);
                localStorage.setItem('user', JSON.stringify(response.data.data));
                toast.success('Профіль успішно оновлено');
            },
            onError: (error) => {
                const errorMessage = error.response?.data?.message || 'Помилка оновлення профілю';
                toast.error(errorMessage);
            },
        }
    );

    const sendFriendRequestMutation = useMutation(
        (payload) => friendshipActions.sendFriendRequest(payload),
        {
            onSuccess: (response) => {
                queryClient.invalidateQueries(['sentRequests', user.username]);
                toast.success(response?.data?.message || 'Запит на дружбу успішно надіслано');
            },
            onError: (error) => {
                toast.error(`${error.response?.data?.error || 'Щось пішло не так'}`);
            },
        }
    );

    const acceptFriendRequestMutation = useMutation(
        (friendshipId) => friendshipActions.acceptFriendRequest(friendshipId),
        {
            onSuccess: (response) => {
                queryClient.invalidateQueries(['friends', username]);
                queryClient.invalidateQueries(['receivedRequests', user.username]);
                toast.success(response?.data?.message || 'Запит на дружбу успішно прийнято');
            },
            onError: (error) => {
                toast.error(`${error.response?.data?.error || 'Щось пішло не так'}`);
            },
        }
    );

    const rejectFriendRequestMutation = useMutation(
        (friendshipId) => friendshipActions.rejectFriendRequest(friendshipId),
        {
            onSuccess: (response) => {
                queryClient.invalidateQueries(['friends', username]);
                queryClient.invalidateQueries(['receivedRequests', user.username])
                toast.success(response?.data?.message || 'Запит на дружбу успішно відхилено');
            },
            onError: (error) => {
                toast.error(`${error.response?.data?.error || 'Щось пішло не так'}`);
            },
        }
    );

    const cancelFriendRequestMutation = useMutation(
        (friendshipId) => friendshipActions.cancelFriendRequest(friendshipId),
        {
            onSuccess: (response) => {
                queryClient.invalidateQueries(['friends', username]);
                queryClient.invalidateQueries(['sentRequests', user.username]);
                toast.success(response?.data?.message || 'Запит на дружбу успішно скасовано');
            },
            onError: (error) => {
                toast.error(`${error.response?.data?.error || 'Щось пішло не так'}`);
            },
        }
    );

    const removeFriendMutation = useMutation(
        (friendshipId) => friendshipActions.removeFriend(friendshipId),
        {
            onSuccess: (response) => {
                queryClient.invalidateQueries(['friends', username]);
                queryClient.invalidateQueries(['sentRequests', user.username]);
                toast.success(response?.data?.message || 'Друг успішно видалений');
            },
            onError: (error) => {
                toast.error(`${error.response?.data?.error || 'Щось пішло не так'}`);
            },
        }
    );

    const handleTabChange = (event, newValue) => {
        if (newValue === 'likedPosts' && !(isAuthenticated && user?.username === profileUser?.username)) {
            setActiveTab('posts');
        } else {
            setActiveTab(newValue);
        }
    };

    const handleEditOpen = () => {
        setEditForm({
            username: profileUser.username,
            first_name: profileUser.first_name,
            last_name: profileUser.last_name,
            biography: profileUser.biography,
            country: profileUser.country,
            birthday: profileUser.birthday,
            gender: profileUser.gender,
            avatar: profileUser.avatar,
        });
        setIsEditDialogOpen(true);
    };

    const handleEditClose = () => setIsEditDialogOpen(false);

    const handleCreateChat = () => {
        createChatMutation.mutate({user_two_id: profileUser.id});
    };

    const handleFriendAction = () => {
        if (friendStatus === 'none') {
            sendFriendRequestMutation.mutate({sender_id: user.id, receiver_id: profileUser.id});
        } else if (friendStatus.status === 'pending_sent') {
            cancelFriendRequestMutation.mutate(friendStatus.friendshipId);
        } else if (friendStatus.status === 'pending_received') {
            acceptFriendRequestMutation.mutate(friendStatus.friendshipId);
        } else if (friendStatus === 'accepted') {
            const friendship = friendsData.find((friend) => friend.id === user.id);
            console.log(friendship);
            if (friendship?.friendship_id) {
                removeFriendMutation.mutate(friendship.friendship_id);
            }
        }
    };

    const handleRejectFriendRequest = () => {
        if (friendStatus.status === 'pending_received') {
            rejectFriendRequestMutation.mutate(friendStatus.friendshipId);
        }
    };

    if (isLoading) {
        return <ProfileLoadingPlaceholder/>;
    }

    if (isError) {
        return <UserNotFound/>;
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(180deg, rgba(10, 10, 15, 0.95) 0%, rgba(20, 20, 30, 0.9) 100%)',
                position: 'relative',
                overflow: 'hidden',
                px: {xs: 1, sm: 2, md: 4},
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
                        fontSize: {xs: '1rem', sm: '1.5rem'},
                        animation: 'twinkle 3s infinite',
                        animationDelay: `${i * 0.5}s`,
                        '@keyframes twinkle': {
                            '0%, 100%': {opacity: 0.3},
                            '50%': {opacity: 0.8},
                        },
                    }}
                />
            ))}
            <svg
                style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%'}}
                preserveAspectRatio="none"
            >
                <defs>
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style={{stopColor: '#9c27b0', stopOpacity: 0.3}}/>
                        <stop offset="100%" style={{stopColor: 'transparent', stopOpacity: 0}}/>
                    </linearGradient>
                </defs>
                <path
                    d="M0,100 Q500,50 1000,150 T2000,100"
                    stroke="url(#lineGradient)"
                    strokeWidth="2"
                    fill="none"
                    style={{opacity: 0.5}}
                />
            </svg>
            <Box sx={{maxWidth: '1200px', mx: 'auto', position: 'relative'}}>
                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.5}}
                >
                    <ProfileHeader
                        profileUser={profileUser}
                        isOwner={isOwner}
                        isAuthenticated={isAuthenticated}
                        isFriendshipDataLoading={isFriendshipDataLoading}
                        friendStatus={friendStatus}
                        handleMessage={handleCreateChat}
                        handleFriendAction={handleFriendAction}
                        handleRejectFriendRequest={handleRejectFriendRequest}
                        handleEditOpen={handleEditOpen}
                        isMobile={isMobile}
                        isOnline={isOnline}
                        formatLastSeen={formatLastSeen}
                        isCreatingChat={createChatMutation.isLoading}
                        isSendingFriendRequest={sendFriendRequestMutation.isLoading}
                        isAcceptingFriendRequest={acceptFriendRequestMutation.isLoading}
                        isRejectingFriendRequest={rejectFriendRequestMutation.isLoading}
                        isCancelingFriendRequest={cancelFriendRequestMutation.isLoading}
                        isRemovingFriend={removeFriendMutation.isLoading}
                        blockData={blockData}
                        isBlockLoading={isBlockLoading}
                        handleBlockAction={handleBlockAction}
                        isBlocking={blockUserMutation.isLoading}
                        isUnblocking={unblockUserMutation.isLoading}
                    />
                    <ProfileInfo profileUser={profileUser} isMobile={isMobile}/>
                    <ProfileTabs
                        activeTab={activeTab}
                        handleTabChange={handleTabChange}
                        friendsData={friendsData}
                        userPosts={userPosts}
                        likedPosts={likedPosts}
                        hasNextPosts={hasNextPosts}
                        hasNextLikedPosts={hasNextLikedPosts}
                        isFetchingNextPosts={isFetchingNextPosts}
                        isFetchingNextLikedPosts={isFetchingNextLikedPosts}
                        fetchNextPosts={fetchNextPosts}
                        fetchNextLikedPosts={fetchNextLikedPosts}
                        navigate={navigate}
                        isMobile={isMobile}
                        isOwner={isOwner}
                        isLoading={isLoadingLikedPosts}
                        isFetching={isFetchingLikedPosts}
                    />
                </motion.div>
                <EditProfileDialog
                    open={isEditDialogOpen}
                    onClose={handleEditClose}
                    editForm={editForm}
                    setEditForm={setEditForm}
                    handleEditSave={handleEditSave}
                    isMobile={isMobile}
                    isTablet={isTablet}
                    updateUserMutation={updateUserMutation}
                />
            </Box>
        </Box>
    );
};

export default UserProfilePage;
