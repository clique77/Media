import React, {useRef, useState} from "react";
import {Avatar, Box, Divider, IconButton, Menu, MenuItem, Typography} from "@mui/material";
import {AccountCircle, AdminPanelSettings, ExitToApp, Person, Settings} from "@mui/icons-material";
import {useAuth} from "@/Components/Auth/AuthProvider.jsx";
import {toast} from "react-toastify";
import {useNavigate} from "react-router-dom";

const UserMenu = ({onSignInClick}) => {
    const {user, logout} = useAuth();
    const [anchorEl, setAnchorEl] = useState(null);
    const avatarRef = useRef(null);
    const open = Boolean(anchorEl);
    const navigate = useNavigate();

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleProfileOpen = () => {
        navigate(`/users/${user.username}`)
        handleMenuClose();
    };

    const handleSettingsOpen = () => {
        navigate(`/settings`)
        handleMenuClose();
    };

    const handleLogout = () => {
        logout();
        handleMenuClose();
        toast.success("Успішний вихід.");
    };

    const handleAdminPanel = () => {
        window.location.href = '/admin-dashboard';
        handleMenuClose();
    };

    const getAvatarContent = () => {
        if (user) {
            if (user.avatar) {
                return <Avatar src={user.avatar} alt={user.username}/>;
            }
            if (user.username) {
                return (
                    <Avatar sx={{bgcolor: "#9c27b0"}}>
                        {user.username.charAt(0).toUpperCase()}
                    </Avatar>
                );
            }
            if (user.email) {
                return (
                    <Avatar sx={{bgcolor: "#9c27b0"}}>
                        {user.email.charAt(0).toUpperCase()}
                    </Avatar>
                );
            }
        }
        return (
            <Avatar sx={{
                bgcolor: "transparent",
                color: "white"
            }}>
                <AccountCircle sx={{color: "white"}}/>
            </Avatar>
        );
    };

    return (
        <Box>
            <IconButton
                ref={avatarRef}
                onClick={user ? handleMenuOpen : onSignInClick}
                sx={{
                    padding: 0,
                    "&:hover": {
                        "& .MuiAvatar-root": {
                            transform: "scale(1.1)",
                            boxShadow: "0 0 10px rgba(156, 39, 176, 0.7)",
                            borderColor: "#9c27b0"
                        }
                    }
                }}
            >
                {getAvatarContent()}
            </IconButton>

            {user && (
                <Menu
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleMenuClose}
                    anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "right"
                    }}
                    transformOrigin={{
                        vertical: "top",
                        horizontal: "right"
                    }}
                    PaperProps={{
                        sx: {
                            backgroundColor: "rgba(10, 10, 15, 0.98)",
                            color: "#ffffff",
                            border: "1px solid rgba(156, 39, 176, 0.3)",
                            boxShadow: "0px 10px 25px rgba(0, 0, 0, 0.5)",
                            marginTop: "8px",
                            minWidth: "200px",
                            "&::before": {
                                content: '""',
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                height: "1px",
                                background: "linear-gradient(90deg, transparent, #9c27b0, transparent)"
                            },
                            "& .MuiMenuItem-root": {
                                padding: "10px 16px",
                                "&:hover": {
                                    backgroundColor: "rgba(156, 39, 176, 0.2)"
                                }
                            }
                        }
                    }}
                >
                    <Box sx={{padding: "12px 16px", textAlign: "center"}}>
                        <Typography variant="subtitle1" sx={{fontWeight: 500}}>
                            {user.username || user.email.split("@")[0]}
                        </Typography>
                        {user.email && (
                            <Typography variant="caption" sx={{color: "rgba(255, 255, 255, 0.7)"}}>
                                {user.email}
                            </Typography>
                        )}
                    </Box>
                    <Divider sx={{borderColor: "rgba(255, 255, 255, 0.1)"}}/>

                    <MenuItem onClick={handleProfileOpen}>
                        <Person sx={{marginRight: 2, fontSize: "20px", color: "white"}}/>
                        <Typography variant="body2">Профіль</Typography>
                    </MenuItem>

                    <MenuItem onClick={handleSettingsOpen}>
                        <Settings sx={{marginRight: 2, fontSize: "20px", color: "white"}}/>
                        <Typography variant="body2">Налаштування</Typography>
                    </MenuItem>
                    {user.role === 'admin' && (
                        <MenuItem onClick={handleAdminPanel}>
                            <AdminPanelSettings sx={{marginRight: 2, fontSize: "20px", color: "white"}}/>
                            <Typography variant="body2">Адмін-панель</Typography>
                        </MenuItem>
                    )}
                    <Divider sx={{borderColor: "rgba(255, 255, 255, 0.1)"}}/>

                    <MenuItem onClick={handleLogout}>
                        <ExitToApp sx={{marginRight: 2, fontSize: "20px", color: "white"}}/>
                        <Typography variant="body2">Вийти</Typography>
                    </MenuItem>
                </Menu>
            )}
        </Box>
    );
};

export default UserMenu;
