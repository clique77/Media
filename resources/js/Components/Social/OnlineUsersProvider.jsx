import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { userStatusActions } from "@/api/actions/index.js";
import { userStatusUrls } from "@/api/urls/index.js";
import { useAuth } from "@/Components/Auth/AuthProvider.jsx";

export const OnlineUsersContext = createContext({
    onlineUserIds: [],
});

export const OnlineUsersProvider = ({ children }) => {
    const [onlineUserIds, setOnlineUserIds] = useState([]);
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        const channel = window.Echo.channel("public-user-status");

        channel.listen(".user.online", (event) => {
            setOnlineUserIds((prev) => [...new Set([...prev, event.id])]);
        });

        channel.listen(".user.offline", (event) => {
            setOnlineUserIds((prev) => prev.filter((id) => id !== event.id));
        });

        userStatusActions.getOnlineUserIds().then((res) => {
            setOnlineUserIds(res.data);
        });

        const handleBeforeUnload = () => {
            if (isAuthenticated) {
                userStatusActions.setUserOffline();
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        if (isAuthenticated) {
            userStatusActions.setUserOnline();
        }

        return () => {
            window.Echo.leaveChannel("public-user-status");
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [isAuthenticated]);

    const contextValue = useMemo(() => ({ onlineUserIds }), [onlineUserIds]);

    return (
        <OnlineUsersContext.Provider value={contextValue}>
            {children}
        </OnlineUsersContext.Provider>
    );
};

export const useOnlineUsers = () => {
    return useContext(OnlineUsersContext);
};

export const useIsUserOnline = (userId) => {
    const { onlineUserIds } = useOnlineUsers();
    return onlineUserIds.includes(userId);
};
