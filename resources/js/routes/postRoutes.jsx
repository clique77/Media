import PostsPage from "@/Pages/Social/PostsPage.jsx";
import PostDetailsPage from "@/Pages/Social/PostDetailsPage.jsx";
import CreatePostPage from "@/Pages/Social/CreatePostPage.jsx";
import PostCommentsThreadPage from "@/Pages/Social/PostCommentsThreadPage.jsx";
import EditPostPage from "@/Pages/Social/EditPostPage.jsx";

export const postRoutes = [
    {
        path: '/posts',
        element: <PostsPage/>,
    },
    {
        path: '/posts/:identifier',
        element: <PostDetailsPage/>,
    },
    {
        path: '/posts/create',
        element: <CreatePostPage/>,
    },
    {
        path: '/posts/:identifier/comments/:commentId',
        element: <PostCommentsThreadPage/>,
    },
    {
        path: '/posts/:identifier/edit',
        element: <EditPostPage/>,
    },
];
