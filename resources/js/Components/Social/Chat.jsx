import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
    Avatar,
    Box,
    Button,
    Chip,
    CircularProgress,
    ClickAwayListener,
    Dialog,
    DialogActions,
    DialogContent,
    Fab,
    Fade,
    IconButton,
    Menu,
    MenuItem,
    Paper,
    Popper,
    Skeleton,
    TextField,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import {
    ArrowDownward as ArrowDownwardIcon,
    Block as BlockIcon,
    Close,
    Delete as DeleteIcon,
    FormatBold as FormatBoldIcon,
    FormatClear as FormatClearIcon,
    FormatItalic as FormatItalicIcon,
    FormatListBulleted as FormatListBulletedIcon,
    FormatUnderlined as FormatUnderlinedIcon,
    Link as LinkIcon,
    LockOpen as LockOpenIcon,
    MoreVert as MoreVertIcon,
    Send as SendIcon,
} from '@mui/icons-material';
import {toast} from 'react-toastify';
import {useNavigate, useParams} from 'react-router-dom';
import {useAuth} from '@/Components/Auth/AuthProvider.jsx';
import {useInfiniteQuery, useMutation, useQuery, useQueryClient} from 'react-query';
import Message from './Message';
import {chatActions, messageActions, userBlockActions} from '@/api/actions';
import {motion} from 'framer-motion';
import DOMPurify from 'dompurify';

// Debounce utility
const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

// Constants for styles
const COLORS = {
    chatBackground: 'rgba(10, 10, 15, 0.98)',
    accent: '#9c27b0',
    textPrimary: '#ffffff',
    textSecondary: 'rgba(255, 255, 255, 0.7)',
    online: '#4caf50',
    offline: '#f44336',
    divider: 'rgba(255, 255, 255, 0.1)',
    border: 'rgba(156, 39, 176, 0.3)',
    skeleton: 'rgba(255, 255, 255, 0.1)',
};

const SIZES = {
    avatarHeader: {xs: 36, sm: 40},
    avatarMessage: 32,
    padding: {xs: '12px', sm: '16px'},
    borderRadius: {xs: 0, sm: '8px'},
    fontSizeHeader: {xs: '16px', sm: '18px'},
    fontSizeMessage: {xs: '14px', sm: '15px'},
    chipHeight: 24,
    inputMinRows: 1,
};

const ChatComponent = ({chatUser, isLoading}) => {
    const {chatId} = useParams();
    const {user} = useAuth();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const queryClient = useQueryClient();
    const [newMessage, setNewMessage] = useState('');
    const [selection, setSelection] = useState(null);
    const [files, setFiles] = useState([]);
    const [fileUrls, setFileUrls] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const [emojiAnchorEl, setEmojiAnchorEl] = useState(null);
    const [rows, setRows] = useState(1);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [linkDialogOpen, setLinkDialogOpen] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const inputRef = useRef(null);
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const fileInputRef = useRef(null);
    const inputContainerRef = useRef(null);
    const loadingRef = useRef(false);
    const pendingMessages = useRef(new Map());
    const navigate = useNavigate();

    const emojis = [
        '😊',
        '👍',
        '🔥',
        '❤️',
        '😂',
        '😍',
        '😢',
        '😡',
        '😎',
        '🙌',
        '💪',
        '✨',
        '🎉',
        '🥳',
        '😴',
        '😺',
        '🐶',
        '🌟',
        '🍎',
        '🍕',
        '🚀',
        '🌈',
        '🎸',
        '⚽',
        '🏀',
    ];

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetching,
        isError,
        error,
    } = useInfiniteQuery(
        ['messages', chatId],
        ({pageParam}) => {
            return messageActions.getMessages(chatId, pageParam ? {cursor: pageParam} : '');
        },
        {
            getNextPageParam: (lastPage) => {
                const cursor = lastPage.data.next_cursor;
                return cursor ? cursor : undefined;
            },
            enabled: !!user?.id && !!chatId && !!user.email_verified_at,
            refetchOnWindowFocus: false,
            staleTime: 1000 * 60,
            cacheTime: 1000 * 60 * 5,
            onSuccess: (data) => {
                const allMessages = data.pages.flatMap((page) => page.data.data);
                const unreadMessages = allMessages.filter(
                    (msg) => !msg.is_read && msg.user_id !== user.id,
                );
                setUnreadCount(unreadMessages.length);
            },
        },
    );

    const { data: isUserBlocked, isLoading: isBlockLoading } = useQuery(
        ['userBlock', chatUser?.username],
        () => userBlockActions.getUserBlocks(`filter[blocked.username]=${chatUser?.username}`),
        {
            enabled: !!chatUser?.username,
            refetchOnWindowFocus: false,
            select: (data) => data.data.length > 0,
            staleTime: 0,
            onError: () => {
                toast.error('Не вдалося перевірити статус блокування');
            },
        }
    );

    // Send message mutation
    const sendMessageMutation = useMutation(
        ({formData}) => messageActions.createMessage(formData),
        {
            onMutate: async ({messageData}) => {
                const {content, attachments, chat_id} = messageData;
                const tempId = `temp-${crypto.randomUUID()}`;
                const optimisticMessage = {
                    id: tempId,
                    content,
                    user: {
                        id: user.id,
                        avatar: user.avatar,
                        username: user.username,
                        first_name: user.first_name,
                        last_name: user.last_name,
                    },
                    chat_id,
                    user_id: user.id,
                    created_at: new Date().toISOString(),
                    is_read: false,
                    attachments: attachments.map((file, index) => ({
                        file,
                        url: fileUrls[index],
                        type: file.type,
                        temp: true,
                    })),
                    isPending: true,
                    isError: false,
                };

                pendingMessages.current.set(tempId, {
                    content,
                    attachments: attachments.map((file) => file),
                });

                await queryClient.cancelQueries(['messages', chatId]);
                queryClient.setQueryData(['messages', chatId], (old) => ({
                    ...old,
                    pages: old?.pages
                        ? [
                            {
                                data: {
                                    ...old.pages[0].data,
                                    data: [...old.pages[0].data.data, optimisticMessage],
                                },
                            },
                            ...old.pages.slice(1),
                        ]
                        : [{data: {data: [optimisticMessage], next_cursor: null}}],
                }));

                setNewMessage('');
                setFiles([]);
                setFileUrls([]);
                setRows(1);
                if (inputRef.current) {
                    inputRef.current.innerHTML = '';
                    normalizeContentEditable();
                    moveCursorToNeutral();
                }

                return {
                    previousMessages: queryClient.getQueryData(['messages', chatId]),
                    tempId,
                    tempUrls: optimisticMessage.attachments.map((a) => a.url),
                };
            },
            onSuccess: (response, variables, context) => {
                queryClient.setQueryData(['messages', chatId], (old) => ({
                    ...old,
                    pages: old.pages.map((page, index) =>
                        index === 0
                            ? {
                                data: {
                                    ...page.data,
                                    data: page.data.data.map((msg) =>
                                        msg.id === context.tempId
                                            ? {...response.data.data, isPending: false, isError: false}
                                            : msg,
                                    ),
                                },
                            }
                            : page,
                    ),
                }));
                pendingMessages.current.delete(context.tempId);
                context.tempUrls.forEach((url) => URL.revokeObjectURL(url));
            },
            onError: (error, variables, context) => {
                queryClient.setQueryData(['messages', chatId], (old) => ({
                    ...old,
                    pages: old.pages.map((page, index) =>
                        index === 0
                            ? {
                                data: {
                                    ...page.data,
                                    data: page.data.data.map((msg) =>
                                        msg.id === context.tempId
                                            ? {...msg, isPending: false, isError: true}
                                            : msg,
                                    ),
                                },
                            }
                            : page,
                    ),
                }));
                pendingMessages.current.delete(context.tempId);
                context.tempUrls.forEach((url) => URL.revokeObjectURL(url));
                toast.error(
                    error.response?.data?.error ||
                    error.response?.data?.message ||
                    'Не вдалося надіслати повідомлення',
                );
            },
        },
    );

    // Mark messages as read
    const markMessagesAsRead = useCallback(async () => {
        const allMessages = data?.pages.flatMap((page) => page.data.data) || [];
        const unreadMessages = allMessages.filter(
            (msg) => !msg.is_read && msg.user_id !== user.id,
        );
        if (unreadMessages.length === 0) return;

        try {
            await Promise.all(
                unreadMessages.map((msg) => messageActions.updateMessage(msg.id, {is_read: true})),
            );
            queryClient.setQueryData(['messages', chatId], (old) => ({
                ...old,
                pages: old.pages.map((page) => ({
                    data: {
                        ...page.data,
                        data: page.data.data.map((msg) =>
                            unreadMessages.some((unread) => unread.id === msg.id)
                                ? {...msg, is_read: true}
                                : msg,
                        ),
                    },
                })),
            }));
            setUnreadCount(0);
        } catch (error) {
            toast.error('Не вдалося позначити повідомлення як прочитані');
        }
    }, [data, queryClient, chatId]);

    // Scroll to bottom
    const scrollToBottom = useCallback(
        (options = {behavior: 'smooth'}) => {
            if (messagesEndRef.current && messagesContainerRef.current) {
                const {scrollTop, scrollHeight, clientHeight} = messagesContainerRef.current;
                const isNearBottom = scrollHeight - scrollTop - clientHeight < 200;
                if (isNearBottom || options.force) {
                    messagesEndRef.current.scrollIntoView(options);
                    setShowScrollButton(false);
                    markMessagesAsRead();
                }
            }
        },
        [markMessagesAsRead],
    );

    // Initial scroll on load
    useEffect(() => {
        const allMessages = data?.pages.flatMap((page) => page.data.data) || [];
        if (allMessages.length > 0 && isInitialLoad) {
            scrollToBottom({behavior: 'smooth', force: true});
            setIsInitialLoad(false);
        }
    }, [data, scrollToBottom, isInitialLoad]);

    // Reset isInitialLoad on chatId change
    useEffect(() => {
        setIsInitialLoad(true);
    }, [chatId]);

    // Handle scroll for pagination and unread messages
    const handleScroll = useCallback(
        debounce(() => {
            if (!messagesContainerRef.current || isFetching || loadingRef.current || !hasNextPage) return;

            const {scrollTop, scrollHeight, clientHeight} = messagesContainerRef.current;
            const isAtBottom = scrollHeight - scrollTop - clientHeight < 200;
            const isAtTop = scrollTop < 100;

            console.log('handleScroll:', {scrollTop, scrollHeight, clientHeight, isAtBottom, isAtTop, hasNextPage});

            setShowScrollButton(!isAtBottom);
            if (isAtBottom) {
                markMessagesAsRead();
            }

            if (isAtTop && hasNextPage && !loadingRef.current) {
                loadingRef.current = true;
                // Зберігаємо ID першого видимого повідомлення
                const messages = Array.from(
                    messagesContainerRef.current.querySelectorAll('[id^="message-"]'),
                );
                const topMessage = messages.find((msg) => {
                    const rect = msg.getBoundingClientRect();
                    return rect.top >= messagesContainerRef.current.getBoundingClientRect().top;
                });
                const topMessageId = topMessage?.id;

                console.log('Fetching next page, top message:', topMessageId);

                fetchNextPage().then(() => {
                    setTimeout(() => {
                        if (topMessageId && messagesContainerRef.current) {
                            const targetMessage = document.getElementById(topMessageId);
                            if (targetMessage) {
                                const offsetTop = targetMessage.offsetTop;
                                messagesContainerRef.current.scrollTop = offsetTop;
                                console.log('After fetch, restored scroll to:', {topMessageId, offsetTop});
                            } else {
                                console.warn('Target message not found:', topMessageId);
                            }
                        }
                        loadingRef.current = false;
                    }, 0);
                }).catch((error) => {
                    console.error('Fetch error:', error);
                    toast.error('Не вдалося завантажити старіші повідомлення');
                    loadingRef.current = false;
                });
            }
        }, 200),
        [isFetching, hasNextPage, fetchNextPage, markMessagesAsRead],
    );

    // WebSocket for real-time messages
    useEffect(() => {
        if (!chatId || !chatUser || !user?.id) return;

        const channel = window.Echo.private(`chat.${chatId}`);
        const listener = (e) => {
            queryClient.setQueryData(['messages', chatId], (old) => {
                if (!old) {
                    return {
                        pages: [{data: {data: [e.message], next_cursor: null}}],
                    };
                }
                const allMessages = old.pages.flatMap((page) => page.data.data);

                const isDuplicate = allMessages.some((msg) => msg.id === e.message.id);
                let matchedTempId = null;
                if (!isDuplicate && e.message.user_id === user.id) {
                    for (const [tempId, pending] of pendingMessages.current) {
                        if (
                            pending.content === e.message.content &&
                            pending.attachments.length === (e.message.attachments?.length || 0)
                        ) {
                            matchedTempId = tempId;
                            break;
                        }
                    }
                }

                if (isDuplicate || (!matchedTempId && e.message.user_id === user.id)) {
                    return old;
                }

                const isAtBottom =
                    messagesContainerRef.current &&
                    messagesContainerRef.current.scrollHeight -
                    messagesContainerRef.current.scrollTop -
                    messagesContainerRef.current.clientHeight < 200;

                if (e.message.user_id !== user.id && !e.message.is_read && isAtBottom) {
                    messageActions
                        .updateMessage(e.message.id, {is_read: true})
                        .catch((error) => console.error('Failed to mark message as read:', error));
                    e.message.is_read = true;
                    console.log('New message, scrolling to bottom (isAtBottom)');
                    scrollToBottom({behavior: 'smooth'});
                }

                return {
                    ...old,
                    pages: old.pages.map((page, index) =>
                        index === 0
                            ? {
                                data: {
                                    ...page.data,
                                    data: matchedTempId
                                        ? page.data.data.map((msg) =>
                                            msg.id === matchedTempId
                                                ? {...e.message, isPending: false, isError: false}
                                                : msg,
                                        )
                                        : [...page.data.data, e.message],
                                },
                            }
                            : page,
                    ),
                };
            });

            if (matchedTempId) {
                pendingMessages.current.delete(matchedTempId);
            }

            if (e.message.user_id !== user.id && !e.message.is_read) {
                setUnreadCount((prev) => prev + 1);
            }
        };

        channel.listen('.message.sent', listener);

        return () => {
            channel.stopListening('.message.sent', listener);
            window.Echo.leave(`chat.${chatId}`);
        };
    }, [chatId, chatUser, user?.id, queryClient]);

    // Attach scroll event listener
    useEffect(() => {
        const container = messagesContainerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
            return () => container.removeEventListener('scroll', handleScroll);
        }
    }, [handleScroll]);

    // Handle file upload
    const handleFileUpload = (event) => {
        const uploadedFiles = Array.from(event.target.files);
        const newUrls = uploadedFiles.map((file) => URL.createObjectURL(file));
        setFiles((prev) => [...prev, ...uploadedFiles]);
        setFileUrls((prev) => [...prev, ...newUrls]);
        moveCursorToNeutral();
    };

    // Handle sending a message
    const handleSendMessage = async () => {
        if (!newMessage.trim() && files.length === 0) return;
        const cleanedMessage = DOMPurify.sanitize(newMessage, {
            ALLOWED_TAGS: ['b', 'i', 'u', 'ul', 'li', 'br', 'a'],
            ALLOWED_ATTR: ['href', 'target', 'rel'],
        }).trim();

        const messageData = {
            content: cleanedMessage,
            attachments: files,
            chat_id: chatId,
        };

        const formData = new FormData();
        formData.append('content', cleanedMessage);
        formData.append('chat_id', chatId);
        files.forEach((file, index) => {
            formData.append(`attachments[${index}]`, file);
        });

        sendMessageMutation.mutate({formData, messageData});
        scrollToBottom({behavior: 'smooth'});

        if (fileInputRef.current) {
            fileInputRef.current.value = null;
        }
    };

    // Apply style to selected text
    const applyStyle = (style) => {
        if (inputRef.current && document.getSelection().toString().length > 0) {
            inputRef.current.focus();
            let command;
            switch (style) {
                case 'bold':
                    command = 'bold';
                    break;
                case 'italic':
                    command = 'italic';
                    break;
                case 'underline':
                    command = 'underline';
                    break;
                case 'list':
                    command = 'insertUnorderedList';
                    break;
                case 'removeFormat':
                    command = 'removeFormat';
                    break;
                default:
                    return;
            }

            const selection = window.getSelection();
            const originalRange = selection.rangeCount > 0 ? selection.getRangeAt(0).cloneRange() : null;

            document.execCommand(command, false, null);

            if (style !== 'removeFormat') {
                document.execCommand('removeFormat', false, null);
            }

            if (originalRange) {
                selection.removeAllRanges();
                selection.addRange(originalRange);
                selection.collapseToEnd();
            }

            const neutralNode = document.createTextNode('');
            const range = document.createRange();
            range.selectNodeContents(inputRef.current);
            range.collapse(false);
            range.insertNode(neutralNode);

            range.setStart(neutralNode, 0);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);

            normalizeContentEditable();
            setNewMessage(inputRef.current.innerHTML);
            updateRows(inputRef.current.innerHTML);
            setSelection(null);
        }
    };

    // Handle link insertion
    const handleInsertLink = () => {
        if (!linkUrl.trim()) {
            toast.error('Будь ласка, введіть дійсне посилання');
            return;
        }

        if (!linkUrl.match(/^https?:\/\/.+/)) {
            setLinkUrl(`https://${linkUrl}`);
        }

        if (inputRef.current) {
            inputRef.current.focus();
            const selection = window.getSelection();
            let range;
            if (selection.rangeCount > 0) {
                range = selection.getRangeAt(0);
                range.deleteContents();
            } else {
                range = document.createRange();
                range.selectNodeContents(inputRef.current);
                range.collapse(false);
            }

            const link = document.createElement('a');
            link.href = linkUrl;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.textContent = selection.toString() || linkUrl;

            range.insertNode(link);

            const neutralNode = document.createTextNode('');
            range.collapse(false);
            range.insertNode(neutralNode);

            range.setStart(neutralNode, 0);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);

            normalizeContentEditable();
            setNewMessage(inputRef.current.innerHTML);
            updateRows(inputRef.current.innerHTML);
            setLinkDialogOpen(false);
            setLinkUrl('');
            setSelection(null);
        }
    };

// Handle emoji selection
    const handleEmojiSelect = (emoji) => {
        if (inputRef.current) {
            inputRef.current.focus();
            const selection = window.getSelection();
            let range;
            if (selection.rangeCount > 0) {
                range = selection.getRangeAt(0);
                range.deleteContents();
            } else {
                range = document.createRange();
                range.selectNodeContents(inputRef.current);
                range.collapse(false);
            }

            range.insertNode(document.createTextNode(emoji));

            const neutralNode = document.createTextNode('');
            range.collapse(false);
            range.insertNode(neutralNode);

            range.setStart(neutralNode, 0);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);

            normalizeContentEditable();
            setNewMessage(inputRef.current.innerHTML);
            updateRows(inputRef.current.innerHTML);
            setEmojiAnchorEl(null);
        }
    };

// Normalize DOM
    const normalizeContentEditable = () => {
        if (inputRef.current) {
            const walker = document.createTreeWalker(
                inputRef.current,
                NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
                {
                    acceptNode: (node) => {
                        if (
                            node.nodeType === Node.ELEMENT_NODE &&
                            (node.tagName === 'SPAN' || node.tagName === 'DIV') &&
                            !node.textContent.trim() &&
                            !node.querySelector('*:not(:empty)')
                        ) {
                            return NodeFilter.FILTER_REJECT;
                        }
                        if (node.nodeType === Node.TEXT_NODE && node.textContent === '\u200B') {
                            return NodeFilter.FILTER_REJECT;
                        }
                        return NodeFilter.FILTER_ACCEPT;
                    },
                },
            );
            const nodesToRemove = [];
            while (walker.nextNode()) {
                const node = walker.currentNode;
                if (
                    node.nodeType === Node.ELEMENT_NODE &&
                    (node.tagName === 'SPAN' || node.tagName === 'DIV') &&
                    !node.textContent.trim()
                ) {
                    nodesToRemove.push(node);
                }
            }
            nodesToRemove.forEach((node) => node.remove());

            let html = inputRef.current.innerHTML;
            html = DOMPurify.sanitize(html, {
                ALLOWED_TAGS: ['b', 'i', 'u', 'ul', 'li', 'br', 'a'],
                ALLOWED_ATTR: ['href', 'target', 'rel'],
            }).trim();
            if (!html || html === '<br>') {
                inputRef.current.innerHTML = '';
                setNewMessage('');
            } else {
                setNewMessage(html);
            }
        }
    };

// Move cursor to neutral position
    const moveCursorToNeutral = () => {
        if (inputRef.current) {
            const selection = window.getSelection();
            const range = document.createRange();

            let lastChild = inputRef.current.lastChild;
            if (!lastChild || lastChild.nodeType !== Node.TEXT_NODE) {
                const neutralNode = document.createTextNode('');
                inputRef.current.appendChild(neutralNode);
                lastChild = neutralNode;
            }

            range.setStart(lastChild, lastChild.length);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
            inputRef.current.focus();
        }
    };

// Clean HTML
    const isContentEmpty = (html) => {
        const cleanText = DOMPurify.sanitize(html, {
            ALLOWED_TAGS: [],
            ALLOWED_ATTR: [],
        })
            .replace(/ /g, '')
            .replace(/\s+/g, '')
            .trim();
        return cleanText.length === 0;
    };

// Handle input changes
    const handleInput = () => {
        if (inputRef.current) {
            let html = inputRef.current.innerHTML;
            html = DOMPurify.sanitize(html, {
                ALLOWED_TAGS: ['b', 'i', 'u', 'ul', 'li', 'br', 'a'],
                ALLOWED_ATTR: ['href', 'target', 'rel'],
            }).trim();
            if (html === '<br>' || isContentEmpty(html)) {
                html = '';
                inputRef.current.innerHTML = '';
            }
            setNewMessage(html);
            updateRows(html);
            normalizeContentEditable();
            moveCursorToNeutral();
        }
    };

// Handle key down
    const handleKeyDown = (event) => {
        if (event.key === 'Enter' && event.shiftKey) {
            event.preventDefault();
            document.execCommand('insertHTML', false, '<div><br></div>');
            handleInput();
        } else if (event.key === 'Enter' && !event.shiftKey && (newMessage.trim() || files.length > 0)) {
            event.preventDefault();
            handleSendMessage();
        }
    };

// Handle text selection
    const handleSelection = () => {
        const selection = window.getSelection();
        if (selection.rangeCount > 0 && selection.toString().length > 0) {
            const range = selection.getRangeAt(0);
            const bounds = inputRef.current.getBoundingClientRect();
            const containerRect = inputContainerRef.current?.getBoundingClientRect();
            setSelection({
                range,
                bounds: {
                    top: bounds.top - containerRect.top - 40,
                    left: Math.max(
                        0,
                        Math.min(bounds.left - containerRect.left + 10, containerRect.width - 150),
                    ),
                },
            });
        } else {
            setSelection(null);
        }
    };

// Update rows
    const updateRows = (html) => {
        if (inputRef.current) {
            const lineHeight = 24;
            const contentHeight = inputRef.current.scrollHeight;
            const lineCount = Math.round(contentHeight / lineHeight);
            const newRows = Math.min(Math.max(1, lineCount), 5);
            setRows(newRows);
        }
    };

// Handle click away
    const handleClickAway = () => {
        setSelection(null);
        setEmojiAnchorEl(null);
        setLinkDialogOpen(false);
    };

// Handle modal interactions
    const handleMenuOpen = (event) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = (event) => {
        event?.stopPropagation();
        setAnchorEl(null);
    };

    const handleEmojiMenuOpen = (event) => {
        event.stopPropagation();
        setEmojiAnchorEl(event.currentTarget);
    };

    const handleEmojiMenuClose = (event) => {
        event?.stopPropagation();
        setEmojiAnchorEl(null);
    };

    const handleDeleteChat = async () => {
        try {
            await chatActions.deleteChat(chatId);
            toast.success('Чат видалено!');
            navigate('/chats');
        } catch (error) {
            toast.error('Не вдалося видалити чат');
            console.error(error);
        }
        handleMenuClose();
    };

    const handleBlockUser = async () => {
        try {
            await userBlockActions.createUserBlock({ blocked_id: chatUser.id });
            toast.success('Користувача заблоковано!');
            queryClient.invalidateQueries(['userBlock', chatUser?.username]);
        } catch (error) {
            toast.error('Не вдалося заблокувати користувача');
        }
        handleMenuClose();
    };

    const handleUnblockUser = async () => {
        try {
            const userBlock = await userBlockActions.getUserBlocks(`filter[blocked.username]=${chatUser.username}`);
            await userBlockActions.deleteUserBlock(userBlock?.data[0]?.id);
            toast.success('Користувача розблоковано!');
            queryClient.invalidateQueries(['userBlock', chatUser?.username]);
        } catch (error) {
            toast.error('Не вдалося розблокувати користувача');
        }
        handleMenuClose();
    };

    const displayName =
        chatUser?.first_name || chatUser?.last_name
            ? `${chatUser?.first_name || ''} ${chatUser?.last_name || ''}`.trim()
            : chatUser?.username || 'Користувач';

// Avatar content
    const getAvatarContent = () => {
        if (chatUser?.avatar) {
            return <Avatar src={chatUser.avatar} alt={displayName}/>;
        }
        if (chatUser?.username) {
            return (
                <Avatar sx={{bgcolor: COLORS.accent}}>
                    {chatUser.username.charAt(0).toUpperCase()}
                </Avatar>
            );
        }
        return (
            <Avatar sx={{bgcolor: COLORS.accent}}>{displayName.charAt(0).toUpperCase()}</Avatar>
        );
    };

    const allMessages = (data?.pages.flatMap((page) => page.data.data) || []).sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at),
    );

// Messages container styles
    const messagesContainerStyles = {
        flexGrow: 1,
        flexShrink: 1,
        overflowY: 'auto',
        p: {xs: '12px 8px', sm: '16px 12px'},
        background: 'transparent',
        scrollBehavior: 'auto',
        '&::-webkit-scrollbar': {
            width: '6px',
        },
        '&::-webkit-scrollbar-track': {
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '3px',
        },
        '&::-webkit-scrollbar-thumb': {
            background: COLORS.accent,
            borderRadius: '3px',
        },
        overflowAnchor: 'none',
    };

    return (
        <motion.div
            initial={{opacity: 0, scale: 0.95}}
            animate={{opacity: 1, scale: 1}}
            transition={{duration: 0.3, ease: 'easeOut'}}
            style={{height: '100%', width: '100%'}}
        >
            <Box
                sx={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    boxSizing: 'border-box',
                }}
            >
                <Paper
                    sx={{
                        width: {xs: '100%', md: '100%'},
                        height: '100%',
                        background: COLORS.chatBackground,
                        border: `1px solid ${COLORS.border}`,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        boxSizing: 'border-box',
                        borderRadius: SIZES.borderRadius,
                        boxShadow: '0 2px 10px rgba(0, 0,0.5)',
                    }}
                >
                    {/* Header */}
                    <Box
                        sx={{
                            p: SIZES.padding,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: 'transparent',
                            flexShrink: 0,
                            borderBottom: `1px solid ${COLORS.divider}`,
                        }}
                    >
                        {isLoading || !chatUser ? (
                            <motion.div
                                initial={{opacity: 0, y: 20}}
                                animate={{opacity: 1, y: 0}}
                                transition={{duration: 0.3}}
                            >
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1.5,
                                    }}
                                >
                                    <Skeleton
                                        variant="circular"
                                        width={SIZES.avatarHeader.sm}
                                        height={SIZES.avatarHeader.sm}
                                        sx={{bgcolor: COLORS.skeleton}}
                                    />
                                    <Box>
                                        <Skeleton
                                            width={100}
                                            height={20}
                                            sx={{bgcolor: COLORS.skeleton, mb: 1}}
                                        />
                                        <Skeleton
                                            variant="rounded"
                                            width={60}
                                            height={SIZES.chipHeight}
                                            sx={{borderRadius: '10px', bgcolor: COLORS.skeleton}}
                                        />
                                    </Box>
                                </Box>
                            </motion.div>
                        ) : (
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 1.5}}>
                                <IconButton sx={{padding: 0}}>{getAvatarContent()}</IconButton>
                                <Box>
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            fontWeight: '500',
                                            color: COLORS.textPrimary,
                                            fontSize: SIZES.fontSizeHeader,
                                        }}
                                    >
                                        {displayName}
                                    </Typography>
                                    <Chip
                                        label={chatUser?.is_online ? 'Онлайн' : 'Офлайн'}
                                        size="small"
                                        sx={{
                                            bgcolor: chatUser?.is_online
                                                ? 'rgba(76, 175, 80, 0.3)'
                                                : 'rgba(244, 67, 54, 0.2)',
                                            color: chatUser?.is_online ? COLORS.online : COLORS.offline,
                                            fontSize: '12px',
                                            height: SIZES.chipHeight,
                                            borderRadius: '10px',
                                        }}
                                    />
                                </Box>
                            </Box>
                        )}
                        <IconButton
                            onClick={handleMenuOpen}
                            sx={{color: COLORS.textPrimary}}
                            disabled={!chatUser}
                        >
                            <MoreVertIcon/>
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleMenuClose}
                            anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
                            transformOrigin={{vertical: 'top', horizontal: 'right'}}
                            PaperProps={{
                                sx: {
                                    background: COLORS.chatBackground,
                                    color: COLORS.textPrimary,
                                    border: `1px solid ${COLORS.border}`,
                                    boxShadow: '0px 10px 25px rgba(0, 0, 0, 0.5)',
                                    marginTop: '8px',
                                    minWidth: '220px',
                                    backdropFilter: 'blur(10px)',
                                    '&::before': {
                                        content: '""',
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        height: '1px',
                                        background: `linear-gradient(90deg, transparent, ${COLORS.accent}, transparent)`,
                                    },
                                    '& .MuiMenuItem-root': {
                                        padding: '8px 12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            background: 'rgba(156, 39, 176, 0.2)',
                                            transform: 'translateX(4px)',
                                            boxShadow: `0 0 8px rgba(156, 39, 176, 0.3)`,
                                        },
                                        '& svg': {
                                            fontSize: '18px',
                                            color: COLORS.textSecondary,
                                        },
                                    },
                                },
                            }}
                        >
                            <MenuItem onClick={handleDeleteChat}>
                                <DeleteIcon/>
                                Видалити чат
                            </MenuItem>
                            {isUserBlocked ? (
                                <MenuItem onClick={handleUnblockUser}>
                                    <LockOpenIcon />
                                    Розблокувати користувача
                                </MenuItem>
                            ) : (
                                <MenuItem onClick={handleBlockUser}>
                                    <BlockIcon />
                                    Заблокувати користувача
                                </MenuItem>
                            )}
                        </Menu>
                    </Box>

                    {/* Messages Area */}
                    <Box ref={messagesContainerRef} sx={messagesContainerStyles}>
                        {isFetching && !data && (
                            <motion.div
                                initial={{opacity: 0}}
                                animate={{opacity: 1}}
                                exit={{opacity: 0}}
                            >
                                <Box sx={{display: 'flex', justifyContent: 'center', mt: 2}}>
                                    <CircularProgress
                                        size={40}
                                        thickness={4}
                                        sx={{color: COLORS.accent}}
                                    />
                                </Box>
                            </motion.div>
                        )}
                        {isError ? (
                            <Typography sx={{color: COLORS.textSecondary, textAlign: 'center'}}>
                                {error?.message || 'Failed to load messages'}
                            </Typography>
                        ) : (
                            <>
                                {isFetching && data && (
                                    <motion.div
                                        initial={{opacity: 0}}
                                        animate={{opacity: 1}}
                                        exit={{opacity: 0}}
                                    >
                                        <Box sx={{display: 'flex', justifyContent: 'center', mb: 2}}>
                                            <CircularProgress
                                                size={24}
                                                thickness={4}
                                                sx={{color: COLORS.accent}}
                                            />
                                        </Box>
                                    </motion.div>
                                )}
                                {allMessages.map((message, index) => (
                                    <Message
                                        key={message.id}
                                        message={message}
                                        chatId={chatId}
                                        id={`message-${message.id}`}
                                        previousMessage={index > 0 ? allMessages[index - 1] : null}
                                        nextMessage={index < allMessages.length - 1 ? allMessages[index + 1] : null}
                                    />
                                ))}
                                <div ref={messagesEndRef}/>
                            </>
                        )}
                    </Box>

                    {/* Scroll to Bottom Button */}
                    {showScrollButton && (
                        <Fab
                            size="small"
                            onClick={() => scrollToBottom({behavior: 'smooth'})}
                            sx={{
                                position: 'absolute',
                                bottom: '80px',
                                right: '20px',
                                bgcolor: COLORS.accent,
                                color: COLORS.textPrimary,
                                '&:hover': {bgcolor: '#7b1fa2'},
                            }}
                        >
                            <ArrowDownwardIcon/>
                            {unreadCount > 0 && (
                                <Chip
                                    label={unreadCount}
                                    size="small"
                                    sx={{
                                        position: 'absolute',
                                        top: '-10px',
                                        right: '-10px',
                                        bgcolor: COLORS.accent,
                                        color: COLORS.textPrimary,
                                        height: '20px',
                                        fontSize: '12px',
                                    }}
                                />
                            )}
                        </Fab>
                    )}

                    {/* Message Input */}
                    <Box
                        sx={{
                            p: SIZES.padding,
                            background: 'transparent',
                            flexShrink: 0,
                            width: '100%',
                            boxSizing: 'border-box',
                        }}
                        ref={inputContainerRef}
                    >
                        <ClickAwayListener onClickAway={handleClickAway}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '8px',
                                    width: '100%',
                                }}
                            >
                                {/* File Preview Section */}
                                {files.length > 0 && (
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            overflowX: 'auto',
                                            gap: 1,
                                            alignItems: 'flex-start',
                                            '&::-webkit-scrollbar': {
                                                height: '6px',
                                            },
                                            '&::-webkit-scrollbar-track': {
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                borderRadius: '3px',
                                            },
                                            '&::-webkit-scrollbar-thumb': {
                                                background: COLORS.accent,
                                                borderRadius: '3px',
                                            },
                                        }}
                                    >
                                        {files.map((file, index) => (
                                            file.type.startsWith('image/') ? (
                                                <Box
                                                    key={index}
                                                    sx={{
                                                        marginTop: '10px',
                                                        position: 'relative',
                                                        flexShrink: 0,
                                                        width: '84px',
                                                        height: '84px',
                                                    }}
                                                >
                                                    <img
                                                        src={fileUrls[index]}
                                                        alt={file.name}
                                                        style={{
                                                            width: '80px',
                                                            height: '80px',
                                                            objectFit: 'cover',
                                                            borderRadius: '8px',
                                                            border: `1px solid ${COLORS.border}`,
                                                        }}
                                                    />
                                                    <IconButton
                                                        onClick={() => {
                                                            const url = fileUrls[index];
                                                            setFiles(files.filter((_, i) => i !== index));
                                                            setFileUrls(urls => {
                                                                const newUrls = urls.filter((_, i) => i !== index);
                                                                URL.revokeObjectURL(url);
                                                                return newUrls;
                                                            });
                                                            if (fileInputRef.current) {
                                                                fileInputRef.current.value = null;
                                                            }
                                                        }}
                                                        sx={{
                                                            position: 'absolute',
                                                            top: '-10px',
                                                            right: '-10px',
                                                            bgcolor: 'rgba(0, 0, 0, 0.7)',
                                                            color: COLORS.textPrimary,
                                                            width: '24px',
                                                            height: '24px',
                                                            '&:hover': {
                                                                bgcolor: 'rgba(156, 39, 176, 0.5)',
                                                            },
                                                        }}
                                                        size="small"
                                                    >
                                                        <svg
                                                            width="14"
                                                            height="14"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                        >
                                                            <path
                                                                d="M6 6L18 18M6 18L18 6"
                                                                stroke={COLORS.textPrimary}
                                                                strokeWidth="2"
                                                                strokeLinecap="round"
                                                            />
                                                        </svg>
                                                    </IconButton>
                                                </Box>
                                            ) : file.type.startsWith('video/') ? (
                                                <Box
                                                    key={index}
                                                    sx={{
                                                        marginTop: '10px',
                                                        position: 'relative',
                                                        flexShrink: 0,
                                                        width: '84px',
                                                        height: '84px',
                                                    }}
                                                >
                                                    <video
                                                        src={fileUrls[index]}
                                                        style={{
                                                            width: '80px',
                                                            height: '80px',
                                                            objectFit: 'cover',
                                                            borderRadius: '8px',
                                                            border: `1px solid ${COLORS.border}`,
                                                        }}
                                                    />
                                                    <IconButton
                                                        onClick={() => {
                                                            const url = fileUrls[index];
                                                            setFiles(files.filter((_, i) => i !== index));
                                                            setFileUrls(urls => {
                                                                const newUrls = urls.filter((_, i) => i !== index);
                                                                URL.revokeObjectURL(url);
                                                                return newUrls;
                                                            });
                                                            if (fileInputRef.current) {
                                                                fileInputRef.current.value = null;
                                                            }
                                                        }}
                                                        sx={{
                                                            position: 'absolute',
                                                            top: '-10px',
                                                            right: '-10px',
                                                            bgcolor: 'rgba(0, 0, 0, 0.7)',
                                                            color: COLORS.textPrimary,
                                                            width: '24px',
                                                            height: '24px',
                                                            '&:hover': {
                                                                bgcolor: 'rgba(156, 39, 176, 0.5)',
                                                            },
                                                        }}
                                                        size="small"
                                                    >
                                                        <svg
                                                            width="14"
                                                            height="14"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                        >
                                                            <path
                                                                d="M6 6L18 18M6 18L18 6"
                                                                stroke={COLORS.textPrimary}
                                                                strokeWidth="2"
                                                                strokeLinecap="round"
                                                            />
                                                        </svg>
                                                    </IconButton>
                                                </Box>
                                            ) : (
                                                <Chip
                                                    key={index}
                                                    label={file.name}
                                                    onDelete={() => {
                                                        const url = fileUrls[index];
                                                        setFiles(files.filter((_, i) => i !== index));
                                                        setFileUrls(urls => {
                                                            const newUrls = urls.filter((_, i) => i !== index);
                                                            URL.revokeObjectURL(url);
                                                            return newUrls;
                                                        });
                                                        if (fileInputRef.current) {
                                                            fileInputRef.current.value = null;
                                                        }
                                                    }}
                                                    sx={{
                                                        bgcolor: 'rgba(156, 39, 176, 0.2)',
                                                        color: COLORS.textPrimary,
                                                        borderRadius: '10px',
                                                        fontSize: '12px',
                                                        height: SIZES.chipHeight,
                                                        backdropFilter: 'blur(10px)',
                                                        alignSelf: 'flex-start',
                                                    }}
                                                />
                                            )
                                        ))}
                                    </Box>
                                )}

                                {/* Emoji Picker */}
                                <Menu
                                    anchorEl={emojiAnchorEl}
                                    open={Boolean(emojiAnchorEl)}
                                    onClose={handleEmojiMenuClose}
                                    anchorOrigin={{vertical: 'top', horizontal: 'left'}}
                                    transformOrigin={{vertical: 'bottom', horizontal: 'left'}}
                                    PaperProps={{
                                        sx: {
                                            background: COLORS.chatBackground,
                                            color: COLORS.textPrimary,
                                            border: `1px solid ${COLORS.border}`,
                                            boxShadow: '0px 10px 25px rgba(0, 0, 0, 0.5)',
                                            width: '240px',
                                            padding: '8px',
                                            backdropFilter: 'blur(10px)',
                                        },
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(5, 1fr)',
                                            gap: '4px',
                                        }}
                                    >
                                        {emojis.map((emoji, index) => (
                                            <MenuItem
                                                key={index}
                                                onClick={() => handleEmojiSelect(emoji)}
                                                sx={{
                                                    width: '40px',
                                                    height: '40px',
                                                    padding: '0',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '24px',
                                                    minWidth: '0',
                                                    '&:hover': {
                                                        background: 'rgba(156, 39, 176, 0.2)',
                                                    },
                                                }}
                                            >
                                                {emoji}
                                            </MenuItem>
                                        ))}
                                    </Box>
                                </Menu>

                                {/* Link Dialog */}
                                <Dialog
                                    open={linkDialogOpen}
                                    onClose={() => setLinkDialogOpen(false)}
                                    maxWidth="xs"
                                    fullWidth
                                    sx={{
                                        '& .MuiDialog-paper': {
                                            background: COLORS.chatBackground,
                                            border: `1px solid ${COLORS.border}`,
                                            borderRadius: SIZES.borderRadius,
                                            backdropFilter: 'blur(15px)',
                                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
                                            color: COLORS.textPrimary,
                                        },
                                    }}
                                >
                                    <Box sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        p: SIZES.padding
                                    }}>
                                        <Typography variant="h6" sx={{color: COLORS.textPrimary}}>
                                            Вставити посилання
                                        </Typography>
                                        <IconButton
                                            onClick={() => setLinkDialogOpen(false)}
                                            sx={{color: COLORS.textSecondary, '&:hover': {color: COLORS.accent}}}
                                        >
                                            <Close/>
                                        </IconButton>
                                    </Box>
                                    <DialogContent sx={{p: SIZES.padding, pt: 0}}>
                                        <TextField
                                            fullWidth
                                            label="URL"
                                            value={linkUrl}
                                            onChange={(e) => setLinkUrl(e.target.value)}
                                            placeholder="https://example.com"
                                            sx={{
                                                '& .MuiInputBase-input': {color: COLORS.textPrimary},
                                                '& .MuiInputLabel-root': {color: COLORS.textSecondary},
                                                '& .MuiOutlinedInput-root': {
                                                    '& fieldset': {borderColor: COLORS.border},
                                                    '&:hover fieldset': {borderColor: COLORS.accent},
                                                    '&.Mui-focused fieldset': {borderColor: COLORS.accent},
                                                },
                                            }}
                                        />
                                    </DialogContent>
                                    <DialogActions sx={{p: SIZES.padding}}>
                                        <Button
                                            variant="contained"
                                            onClick={handleInsertLink}
                                            disabled={!linkUrl.trim()}
                                            sx={{
                                                bgcolor: COLORS.accent,
                                                '&:hover': {bgcolor: '#7b1fa2'},
                                                color: COLORS.textPrimary,
                                            }}
                                        >
                                            Вставити
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            onClick={() => setLinkDialogOpen(false)}
                                            sx={{
                                                color: COLORS.textPrimary,
                                                borderColor: COLORS.border,
                                                '&:hover': {borderColor: COLORS.accent},
                                            }}
                                        >
                                            Скасувати
                                        </Button>
                                    </DialogActions>
                                </Dialog>

                                {/* Input and Buttons Row */}
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        width: '100%',
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            gap: '4px',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <IconButton
                                            onClick={() => fileInputRef.current?.click()}
                                            sx={{color: COLORS.textPrimary, flexShrink: 0}}
                                        >
                                            <svg
                                                width="24"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                                                    stroke={COLORS.textPrimary}
                                                    strokeWidth="1.5"
                                                />
                                                <path
                                                    d="M12 8V16M8 12H16"
                                                    stroke={COLORS.textPrimary}
                                                    strokeWidth="1.5"
                                                    strokeLinecap="round"
                                                />
                                            </svg>
                                        </IconButton>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            style={{display: 'none'}}
                                            onChange={handleFileUpload}
                                            multiple
                                            accept="image/*,video/*"
                                        />
                                        <IconButton
                                            onClick={handleEmojiMenuOpen}
                                            sx={{color: COLORS.textPrimary, flexShrink: 0}}
                                        >
                                            <span style={{fontSize: '24px'}}>🙂</span>
                                        </IconButton>
                                    </Box>
                                    <Box
                                        sx={{
                                            flexGrow: 1,
                                            minWidth: '0',
                                        }}
                                    >
                                        <Box
                                            ref={inputRef}
                                            contentEditable
                                            onInput={handleInput}
                                            onKeyDown={handleKeyDown}
                                            onSelect={handleSelection}
                                            sx={{
                                                bgcolor: 'rgba(255, 255, 255, 0.05)',
                                                borderRadius: '12px',
                                                color: COLORS.textPrimary,
                                                border: `1px solid ${COLORS.border}`,
                                                fontSize: SIZES.fontSizeMessage,
                                                backdropFilter: 'blur(10px)',
                                                lineHeight: '1.5',
                                                padding: '10px 12px',
                                                minHeight: '40px',
                                                maxHeight: `${rows * 24 + 20}px`,
                                                overflowY: rows > 4 ? 'auto' : 'hidden',
                                                outline: 'none',
                                                width: '100%',
                                                boxSizing: 'border-box',
                                                cursor: 'text',
                                                '&:empty:before': {
                                                    content: '"Напишіть повідомлення..."',
                                                    color: 'rgba(255, 255, 255, 0.5)',
                                                    display: 'block',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                },
                                                '& b': {fontWeight: 700},
                                                '& i': {fontStyle: 'italic'},
                                                '& u': {textDecoration: 'underline'},
                                                '& ul': {paddingLeft: '20px', margin: 0},
                                                '& li': {listStyleType: 'disc'},
                                                '& a': {
                                                    color: COLORS.accent,
                                                    textDecoration: 'underline',
                                                    '&:hover': {textDecoration: 'none'},
                                                },
                                            }}
                                        />
                                        <Popper
                                            open={!!selection}
                                            anchorEl={inputRef.current}
                                            placement="top-start"
                                            transition
                                            modifiers={[
                                                {
                                                    name: 'offset',
                                                    options: {
                                                        offset: [selection?.bounds.left || 0, -10],
                                                    },
                                                },
                                                {
                                                    name: 'preventOverflow',
                                                    options: {
                                                        boundariesElement: inputContainerRef.current,
                                                    },
                                                },
                                            ]}
                                        >
                                            {({TransitionProps}) => (
                                                <Fade {...TransitionProps} timeout={200}>
                                                    <Paper
                                                        sx={{
                                                            bgcolor: COLORS.chatBackground,
                                                            border: `1px solid ${COLORS.border}`,
                                                            borderRadius: '10px',
                                                            p: 0.5,
                                                            display: 'flex',
                                                            gap: 0.5,
                                                            boxShadow: '0px 10px 25px rgba(0, 0, 0, 0.5)',
                                                            backdropFilter: 'blur(10px)',
                                                        }}
                                                    >
                                                        <IconButton
                                                            onClick={() => applyStyle('bold')}
                                                            size="small"
                                                            sx={{color: COLORS.textPrimary}}
                                                        >
                                                            <FormatBoldIcon fontSize="small"/>
                                                        </IconButton>
                                                        <IconButton
                                                            onClick={() => applyStyle('italic')}
                                                            size="small"
                                                            sx={{color: COLORS.textPrimary}}
                                                        >
                                                            <FormatItalicIcon fontSize="small"/>
                                                        </IconButton>
                                                        <IconButton
                                                            onClick={() => applyStyle('underline')}
                                                            size="small"
                                                            sx={{color: COLORS.textPrimary}}
                                                        >
                                                            <FormatUnderlinedIcon fontSize="small"/>
                                                        </IconButton>
                                                        <IconButton
                                                            onClick={() => applyStyle('list')}
                                                            size="small"
                                                            sx={{color: COLORS.textPrimary}}
                                                        >
                                                            <FormatListBulletedIcon fontSize="small"/>
                                                        </IconButton>
                                                        <IconButton
                                                            onClick={() => setLinkDialogOpen(true)}
                                                            size="small"
                                                            sx={{color: COLORS.textPrimary}}
                                                        >
                                                            <LinkIcon fontSize="small"/>
                                                        </IconButton>
                                                        <IconButton
                                                            onClick={() => applyStyle('removeFormat')}
                                                            size="small"
                                                            sx={{color: COLORS.textPrimary}}
                                                        >
                                                            <FormatClearIcon fontSize="small"/>
                                                        </IconButton>
                                                    </Paper>
                                                </Fade>
                                            )}
                                        </Popper>
                                    </Box>
                                    <IconButton
                                        onClick={handleSendMessage}
                                        disabled={!newMessage.trim() && files.length === 0}
                                        sx={{
                                            color: COLORS.accent,
                                            '&:disabled': {color: 'rgba(156, 39, 176, 0.3)'},
                                            flexShrink: 0,
                                            alignSelf: 'center',
                                        }}
                                    >
                                        <SendIcon fontSize="small"/>
                                    </IconButton>
                                </Box>
                            </Box>
                        </ClickAwayListener>
                    </Box>
                </Paper>
            </Box>
        </motion.div>
    );
};

export default ChatComponent;
