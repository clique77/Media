import React, {useCallback, useEffect, useRef, useState} from "react";
import {
    Box,
    CircularProgress,
    IconButton,
    InputAdornment,
    MenuItem,
    Modal,
    Select,
    Skeleton,
    TextField,
    Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import {AnimatePresence, motion} from "framer-motion";
import {useInfiniteQuery} from "react-query";
import PostCard from "@/Components/Social/PostCard.jsx";
import UserCard from "@/Components/Social/UserCard.jsx";
import {postActions, userActions} from "@/api/actions";
import debounce from "lodash.debounce";

const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = debounce((val) => setDebouncedValue(val), delay);
        handler(value);
        return () => handler.cancel();
    }, [value, delay]);
    return debouncedValue;
};

const SearchModal = ({open, handleClose}) => {
    const [searchType, setSearchType] = useState("posts");
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearchQuery = useDebounce(searchQuery, 1000);
    const observer = useRef();
    const loadingRef = useRef(false);

    const handleSearchTypeChange = (event) => {
        setSearchType(event.target.value);
        setSearchQuery("");
    };

    const getQueryString = useCallback(() => {
        if (!debouncedSearchQuery) return "";
        return searchType === "posts"
            ? `filter[title]=${encodeURIComponent(debouncedSearchQuery)}&sort=-created_at&perPage=10`
            : `filter[username]=${encodeURIComponent(debouncedSearchQuery)}&sort=-created_at&perPage=10`;
    }, [debouncedSearchQuery, searchType]);

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
        error,
    } = useInfiniteQuery(
        [searchType, debouncedSearchQuery],
        ({pageParam}) =>
            pageParam
                ? window.axios.get(pageParam)
                : searchType === "posts"
                    ? postActions.getPosts(getQueryString())
                    : userActions.getUsers(getQueryString()),
        {
            getNextPageParam: (lastPage) => lastPage.data.next_page_url || undefined,
            refetchOnWindowFocus: false,
            staleTime: 1000 * 60,
            enabled: !!debouncedSearchQuery,
            select: (data) =>
                searchType === "posts"
                    ? {
                        pages: data.pages.map((page) => ({
                            posts: page.data.data.map((post) => ({
                                id: post.id,
                                title: post.title,
                                content: post.content,
                                user: {
                                    id: post.user?.id,
                                    username: post.user?.username || "Anonymous",
                                    avatar: post.user?.avatar || `https://i.pravatar.cc/150?img=${post.user?.id || 0}`,
                                },
                                attachments: post.attachments || [],
                                likes_count: post.likes_count || 0,
                                comments_count: post.comments_count || 0,
                                views_count: post.views_count || 0,
                                created_at: post.created_at,
                                slug: post.slug,
                                tags: post.tags ? post.tags.map((tag) => tag.name) : [],
                                visibility: post.visibility || "public",
                                comments_enabled: post.comments_enabled ?? true,
                                user_liked: post.user_liked || false,
                                like_id: post.like_id || null,
                            })),
                            nextCursor: page.data.next_cursor,
                            nextPageUrl: page.data.next_page_url,
                            hasMore: !!page.data.next_page_url,
                            totalPosts: page.data.data.length,
                        })),
                        pageParams: data.pageParams,
                    }
                    : {
                        pages: data.pages.map((page) => ({
                            users: page.data.data.map((user) => ({
                                id: user.id,
                                username: user.username || "Anonymous",
                                first_name: user.first_name || "",
                                last_name: user.last_name || "",
                                avatar: user.avatar || `https://i.pravatar.cc/150?img=${user.id || 0}`,
                                biography: user.biography || "Користувач ще не додав біографію",
                                country: user.country || "",
                                role: user.role || "user",
                                is_online: user.is_online || false,
                                last_seen_at: user.last_seen_at || "",
                            })),
                            nextCursor: page.data.next_cursor,
                            nextPageUrl: page.data.next_page_url,
                            hasMore: !!page.data.next_page_url,
                            totalUsers: page.data.data.length,
                        })),
                        pageParams: data.pageParams,
                    },
        }
    );

    const lastItemRef = useCallback(
        (node) => {
            if (isFetchingNextPage || loadingRef.current) return;
            if (observer.current) observer.current.disconnect();

            observer.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasNextPage) {
                    loadingRef.current = true;
                    fetchNextPage().finally(() => {
                        loadingRef.current = false;
                    });
                }
            });

            if (node) observer.current.observe(node);
        },
        [isFetchingNextPage, hasNextPage, fetchNextPage]
    );

    const items =
        searchType === "posts"
            ? data?.pages?.flatMap((page) => page.posts) || []
            : data?.pages?.flatMap((page) => page.users) || [];
    const totalItems =
        data?.pages?.reduce((sum, page) => sum + (page.totalPosts || page.totalUsers || 0), 0) || 0;

    const EmptySearchPlaceholder = () => (
        <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.5, ease: "easeOut"}}
            style={{height: "100%", display: "flex", alignItems: "center", justifyContent: "center"}}
        >
            <Box
                sx={{
                    textAlign: "center",
                    py: 4,
                }}
            >
                <Typography
                    variant="h5"
                    sx={{
                        fontWeight: 600,
                        fontSize: {xs: "1rem", sm: "1.25rem", md: "1.5rem"},
                        color: "rgba(255, 255, 255, 0.6)",
                        maxWidth: "90%",
                        mx: "auto",
                        lineHeight: 1.4,
                        background: "linear-gradient(to right, #ff4081, #9c27b0)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        textShadow: "0 1px 3px rgba(0, 0, 0, 0.3)",
                    }}
                >
                    {debouncedSearchQuery
                        ? `Нічого не знайдено за запитом "${debouncedSearchQuery}"`
                        : "Відкрий нові горизонти з пошуком!"}
                </Typography>
            </Box>
        </motion.div>
    );

    return (
        <Modal
            open={open}
            onClose={handleClose}
            sx={{
                backdropFilter: "blur(20px)",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                p: {xs: 1, sm: 2},
            }}
        >
            <motion.div
                initial={{opacity: 0, scale: 0.95}}
                animate={{opacity: 1, scale: 1}}
                exit={{opacity: 0, scale: 0.95}}
                transition={{duration: 0.3, ease: "easeOut"}}
            >
                <Box
                    sx={{
                        width: {xs: "100%", sm: "90vw", md: "80vw", lg: "70vw", xl: 1000},
                        maxWidth: 1000,
                        minWidth: 300,
                        height: {xs: "80vh", sm: "85vh"},
                        maxHeight: 700,
                        backgroundColor: "rgba(10, 10, 15, 0.9)",
                        backdropFilter: "blur(15px)",
                        borderRadius: "16px",
                        border: "1px solid rgba(156, 39, 176, 0.2)",
                        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
                        p: {xs: 1, sm: 2, md: 2.5},
                        color: "#e0e0e0",
                        display: "flex",
                        flexDirection: "column",
                        overflow: "hidden",
                        boxSizing: "border-box",
                    }}
                >
                    {/* Header with Close Button */}
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                            alignItems: "center",
                            mb: {xs: 1, sm: 1.5},
                        }}
                    >
                        <IconButton
                            onClick={handleClose}
                            sx={{
                                color: "#ff4081",
                                padding: {xs: "4px", sm: "6px"},
                                "&:hover": {
                                    backgroundColor: "rgba(255, 64, 129, 0.2)",
                                    transform: "scale(1.1)",
                                },
                            }}
                        >
                            <CloseIcon sx={{fontSize: {xs: 18, sm: 22}}}/>
                        </IconButton>
                    </Box>

                    {/* Search Bar */}
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            backgroundColor: "rgba(20, 20, 25, 0.85)",
                            backdropFilter: "blur(10px)",
                            borderRadius: "12px",
                            border: "1px solid rgba(156, 39, 176, 0.2)",
                            p: {xs: 0.5, sm: 0.75},
                            mb: {xs: 1, sm: 1.5},
                        }}
                    >
                        <Select
                            value={searchType}
                            onChange={handleSearchTypeChange}
                            sx={{
                                color: "#e0e0e0",
                                fontSize: {xs: "12px", sm: "14px"},
                                minWidth: {xs: 90, sm: 110},
                                "& .MuiSelect-select": {
                                    py: {xs: 0.75, sm: 1},
                                    pr: 1.5,
                                    pl: 0.5,
                                },
                                "& .MuiSvgIcon-root": {
                                    color: "#ff4081",
                                },
                                "& .MuiOutlinedInput-notchedOutline": {
                                    border: "none",
                                },
                                "&:hover .MuiOutlinedInput-notchedOutline": {
                                    border: "none",
                                },
                                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                    border: "none",
                                },
                            }}
                            MenuProps={{
                                PaperProps: {
                                    sx: {
                                        bgcolor: "rgba(10, 10, 15, 0.9)",
                                        backdropFilter: "blur(10px)",
                                        "& .MuiMenuItem-root": {
                                            color: "#e0e0e0",
                                            "&:hover": {bgcolor: "rgba(156, 39, 176, 0.2)"},
                                            "&.Mui-selected": {
                                                bgcolor: "rgba(156, 39, 176, 0.3)",
                                                color: "#fff",
                                            },
                                        },
                                    },
                                },
                            }}
                        >
                            <MenuItem value="posts">Пости</MenuItem>
                            <MenuItem value="users">Користувачі</MenuItem>
                        </Select>
                        <Typography
                            sx={{
                                color: "#ff4081",
                                fontSize: {xs: "14px", sm: "18px"},
                                mx: {xs: 0.5, sm: 1},
                                opacity: 0.7,
                                fontWeight: 600,
                            }}
                        >
                            /
                        </Typography>
                        <TextField
                            fullWidth
                            placeholder={searchType === "posts" ? "Шукати пости..." : "Шукати користувачів..."}
                            variant="outlined"
                            autoFocus
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            InputProps={{
                                style: {
                                    color: "#e0e0e0",
                                    fontSize: {xs: "12px", sm: "14px"},
                                },
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton sx={{color: "#ff4081"}}>
                                            <SearchIcon sx={{fontSize: {xs: 16, sm: 18}}}/>
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    background: "transparent",
                                    borderRadius: "8px",
                                    "& fieldset": {
                                        border: "none",
                                    },
                                    "&:hover fieldset": {
                                        border: "none",
                                    },
                                    "&.Mui-focused fieldset": {
                                        border: "none",
                                    },
                                },
                            }}
                        />
                    </Box>

                    {/* Search Results */}
                    <Box
                        sx={{
                            flex: 1,
                            overflowY: "auto",
                            px: 1,
                            position: "relative",
                            "&::-webkit-scrollbar": {
                                display: "none",
                            },
                            scrollbarWidth: "none",
                            msOverflowStyle: "none",
                        }}
                    >
                        {isLoading && (
                            <Box sx={{display: "flex", flexDirection: "column", gap: 2, p: 2}}>
                                {Array.from({length: 3}).map((_, i) => (
                                    <motion.div
                                        key={`skeleton-${i}`}
                                        initial={{opacity: 0, y: 20}}
                                        animate={{opacity: 1, y: 0}}
                                        transition={{delay: i * 0.1}}
                                    >
                                        <Box
                                            sx={{
                                                backgroundColor: "rgba(10, 10, 15, 0.7)",
                                                borderRadius: 2,
                                                p: 2,
                                                border: "1px solid rgba(156, 39, 176, 0.2)",
                                                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
                                            }}
                                        >
                                            <Box sx={{display: "flex", alignItems: "center", gap: 2}}>
                                                <Skeleton
                                                    variant="circular"
                                                    width={40}
                                                    height={40}
                                                    sx={{bgcolor: "rgba(255, 255, 255, 0.1)"}}
                                                />
                                                <Box sx={{flexGrow: 1}}>
                                                    <Skeleton
                                                        width="60%"
                                                        height={20}
                                                        sx={{bgcolor: "rgba(255, 255, 255, 0.1)"}}
                                                    />
                                                    <Skeleton
                                                        width="40%"
                                                        height={16}
                                                        sx={{bgcolor: "rgba(255, 255, 255, 0.1)"}}
                                                    />
                                                </Box>
                                            </Box>
                                        </Box>
                                    </motion.div>
                                ))}
                            </Box>
                        )}

                        {isError && (
                            <Box
                                sx={{
                                    textAlign: "center",
                                    py: 4,
                                }}
                            >
                                <Typography
                                    variant="h6"
                                    sx={{
                                        color: "error.main",
                                        fontWeight: 500,
                                        mb: 2,
                                    }}
                                >
                                    Помилка завантаження
                                </Typography>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        color: "#e0e0e0",
                                        mb: 2,
                                    }}
                                >
                                    {error.message}
                                </Typography>
                            </Box>
                        )}

                        {!isLoading && !isError && totalItems === 0 && (
                            <EmptySearchPlaceholder/>
                        )}

                        {!isLoading && !isError && totalItems > 0 && (
                            <Box sx={{display: "flex", flexDirection: "column", gap: 2, p: 2}}>
                                <AnimatePresence>
                                    {items.map((item, index) => (
                                        <motion.div
                                            key={item.id}
                                            initial={{opacity: 0, y: 20}}
                                            animate={{opacity: 1, y: 0}}
                                            exit={{opacity: 0}}
                                            transition={{duration: 0.3}}
                                            ref={index === items.length - 1 ? lastItemRef : null}
                                        >
                                            {searchType === "posts" ? (
                                                <PostCard post={item}/>
                                            ) : (
                                                <UserCard user={item}/>
                                            )}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </Box>
                        )}

                        {isFetchingNextPage && (
                            <Box sx={{display: "flex", justifyContent: "center", py: 2}}>
                                <CircularProgress size={24} sx={{color: "#9c27b0"}}/>
                            </Box>
                        )}
                    </Box>
                </Box>
            </motion.div>
        </Modal>
    );
};

export default SearchModal;
