import UserProfilePage from "@/Pages/Social/UserProfilePage.jsx";
import UserSettingsPage from "@/Pages/Social/UserSettingsPage.jsx";
import UserPage from "@/Pages/Social/UsersPage.jsx";

export const userRoutes = [
    {
        path: '/users/:username',
        element: <UserProfilePage/>,
    },
    {
        path: '/users',
        element: <UserPage/>,
    },
    {
        path: '/settings',
        element: <UserSettingsPage/>,
    },
];
