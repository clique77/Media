import ChatsPage from "@/Pages/Social/ChatsPage.jsx";
import ChatPage from "@/Pages/Social/ChatPage.jsx";


export const chatRoutes = [
    {
        path: '/chats',
        element: <ChatsPage/>,
    },
    {
        path: '/chats/:chatId',
        element: <ChatPage/>,
    },
];
