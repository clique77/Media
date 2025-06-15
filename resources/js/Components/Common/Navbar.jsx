import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppBar, Box, Drawer, IconButton, MenuItem, Toolbar, Typography, Divider, Collapse, List, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import Search from "./Search.jsx";
import AuthModal from "../Auth/AuthModal.jsx";
import HomeIcon from "@mui/icons-material/Home";
import MovieIcon from "@mui/icons-material/Movie";
import NetworkIcon from "@mui/icons-material/AccountTree";
import ForumIcon from "@mui/icons-material/Forum";
import StarIcon from "@mui/icons-material/Star";
import ChatIcon from "@mui/icons-material/Chat";
import PostIcon from "@mui/icons-material/PostAdd";
import CommentIcon from "@mui/icons-material/Comment";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import CategoryIcon from "@mui/icons-material/Category";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { useAuth } from "@/Components/Auth/AuthProvider.jsx";
import UserMenu from "@/Components/Social/UserMenu.jsx";
import { useAuthModal } from "@/Components/Auth/AuthModalProvider.jsx";
import NotificationsBell from "@/Components/Social/NotificationsBell.jsx";
import {People} from "@mui/icons-material";

const Navbar = () => {
    const navigate = useNavigate();
    const [openDrawer, setOpenDrawer] = useState(false);
    const [openSignIn, setOpenSignIn] = useState(false);
    const [hoveredMenu, setHoveredMenu] = useState(null);
    const [hoveredSubMenu, setHoveredSubMenu] = useState(null);
    const [isMobile, setIsMobile] = useState(false);
    const [expandedMenu, setExpandedMenu] = useState(null);
    const [activeMenu, setActiveMenu] = useState(null);
    const menuRefs = useRef({});
    const menuContainerRef = useRef(null);
    const hoverTimeoutRef = useRef(null);
    const { user } = useAuth();
    const { showModal } = useAuthModal();

    const setMenuRef = (menuName, ref) => {
        menuRefs.current[menuName] = ref;
    };

    const toggleDrawer = () => setOpenDrawer(!openDrawer);
    const handleSignInOpen = () => setOpenSignIn(true);
    const handleSignInClose = () => setOpenSignIn(false);

    const handleMenuEnter = (menuName) => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = null;
        }
        setHoveredMenu(menuName);
        setActiveMenu(menuName);
    };

    const handleMenuLeave = (menuName) => {
        hoverTimeoutRef.current = setTimeout(() => {
            const isHoveringSubmenu = document.querySelector('.submenu:hover');
            const isHoveringMenu = document.querySelector('.menu-item:hover');

            if (!isHoveringSubmenu && !isHoveringMenu) {
                setHoveredMenu(null);
                setActiveMenu(null);
            }
        }, 300);
    };

    const handleSubMenuEnter = () => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = null;
        }
    };

    const handleSubMenuLeave = () => {
        hoverTimeoutRef.current = setTimeout(() => {
            setHoveredMenu(null);
            setActiveMenu(null);
        }, 500);
    };

    const handleMenuClick = (menu) => {
        setExpandedMenu(expandedMenu === menu ? null : menu);
    };

    const handleMenuItemClick = (menuName) => {
        if (isMobile) {
            setOpenDrawer(false);
        }

        switch (menuName) {
            case "Головна":
                navigate("/");
                break;
            case "Пости":
                navigate("/posts");
                break;
            case "Чати":
                navigate("/chats");
                break;
            case "Користувачі":
                navigate("/users");
                break;
            case "Новинки":
                navigate("/movies/new");
                break;
            case "Популярне":
                navigate("/movies/popular");
                break;
            case "Жанри":
                navigate("/movies/genres");
                break;
            case "Форум":
                navigate("/forum");
                break;
            default:
                break;
        }
    };

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 600);
        window.addEventListener("resize", handleResize);
        handleResize();

        return () => {
            window.removeEventListener("resize", handleResize);
            if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current);
            }
        };
    }, []);

    const menuItemStyles = (menuName) => ({
        padding: "12px 20px",
        color: "rgba(255, 255, 255, 0.7)",
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        minHeight: "48px",
        width: "100%",
        justifyContent: "flex-start",
        backgroundColor: "transparent",
        '&.Mui-focusVisible': {
            backgroundColor: 'transparent !important',
            outline: 'none',
        },
        "&:hover": {
            color: "#ffffff",
            "&::after": {
                content: '""',
                position: "absolute",
                bottom: "-25px",
                left: "20%",
                width: "60%",
                height: "2px",
                background: "linear-gradient(90deg, transparent, #9c27b0, transparent)",
                boxShadow: "0 0 8px #9c27b0",
                animation: "$glow 1.5s infinite alternate",
                borderRadius: "1px",
                pointerEvents: "none"
            }
        },
        transition: "all 0.3s ease",
    });

    const subMenuStyles = (hovered) => ({
        backgroundColor: hovered ? "rgba(156, 39, 176, 0.1)" : "transparent",
        borderRadius: "4px",
        "&:hover": {
            backgroundColor: "rgba(156, 39, 176, 0.2)",
            "& svg": {
                transform: "scale(1.1)",
                color: "#9c27b0"
            }
        },
        padding: "8px 20px 8px 40px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        transition: "all 0.2s ease",
        minHeight: "40px",
    });

    const menuIcons = {
        "Головна": <HomeIcon fontSize="small" sx={{ fontSize: "20px" }} />,
        "Мережа": <NetworkIcon fontSize="small" sx={{ fontSize: "20px" }} />,
        "Фільми": <MovieIcon fontSize="small" sx={{ fontSize: "20px" }} />,
        "FAQ": <ForumIcon fontSize="small" sx={{ fontSize: "20px" }} />,
        "Чати": <ChatIcon fontSize="small" sx={{ fontSize: "20px" }} />,
        "Пости": <PostIcon fontSize="small" sx={{ fontSize: "20px" }} />,
        "Користувачі": <People fontSize="small" sx={{ fontSize: "20px" }} />,
        "Новинки": <StarIcon fontSize="small" sx={{ fontSize: "20px" }} />,
        "Популярне": <WhatshotIcon fontSize="small" sx={{ fontSize: "20px" }} />,
        "Жанри": <CategoryIcon fontSize="small" sx={{ fontSize: "20px" }} />,
    };

    const menuStructure = {
        "Головна": [],
        "Пости": [],
        "Користувачі": [],
        "Чати": []
    };

    const dropdownMenu = (menuName, items) => (
        <Box
            className="menu-item"
            onMouseEnter={() => handleMenuEnter(menuName)}
            onMouseLeave={() => handleMenuLeave(menuName)}
            ref={(el) => setMenuRef(menuName, el)}
            sx={{
                position: "relative",
                color: "rgba(255, 255, 255, 0.7)",
                "&:hover": { color: "#ffffff" },
                height: "100%",
                display: "flex",
                alignItems: "center",
                width: "100%"
            }}
        >
            <Box sx={{
                display: "flex",
                alignItems: "center",
                height: "100%",
                position: "relative",
                width: "100%"
            }}>
                <MenuItem
                    sx={{
                        ...menuItemStyles(menuName),
                        padding: "0 20px",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                        minWidth: "120px"
                    }}
                    disableRipple={!isMobile}
                    onClick={() => {
                        if (items.length === 0) {
                            handleMenuItemClick(menuName);
                        }
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: "8px", width: "100%" }}>
                        {menuIcons[menuName]}
                        <Typography variant="body1" sx={{ fontWeight: 500, lineHeight: 1 }}>
                            {menuName}
                        </Typography>
                    </Box>
                </MenuItem>

                {(hoveredMenu === menuName || activeMenu === menuName) && items.length > 0 && (
                    <Box
                        className="submenu"
                        ref={(el) => setMenuRef(`${menuName}-submenu`, el)}
                        onMouseEnter={handleSubMenuEnter}
                        onMouseLeave={handleSubMenuLeave}
                        sx={{
                            position: "absolute",
                            top: "calc(100% + 20px)",
                            left: 0,
                            backgroundColor: "rgba(10, 10, 15, 0.98)",
                            color: "#ffffff",
                            boxShadow: "0px 10px 25px rgba(0, 0, 0, 0.5)",
                            borderRadius: "0 0 8px 8px",
                            zIndex: 1300,
                            opacity: 1,
                            transform: "translateY(0)",
                            transition: "opacity 0.2s ease-out, transform 0.2s ease-out",
                            border: "1px solid rgba(156, 39, 176, 0.3)",
                            borderTop: "none",
                            overflow: "hidden",
                            width: "220px",
                            "&::before": {
                                content: '""',
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                height: "1px",
                                background: "linear-gradient(90deg, transparent, #9c27b0, transparent)",
                            }
                        }}
                    >
                        {items.map((item) => (
                            <MenuItem
                                key={item}
                                onMouseEnter={() => setHoveredSubMenu(item)}
                                onMouseLeave={() => setHoveredSubMenu(null)}
                                sx={subMenuStyles(hoveredSubMenu === item)}
                                onClick={() => handleMenuItemClick(item)}
                            >
                                {menuIcons[item]}
                                <Typography variant="body2" sx={{ lineHeight: 1.2 }}>
                                    {item}
                                </Typography>
                            </MenuItem>
                        ))}
                    </Box>
                )}
            </Box>
        </Box>
    );

    const mobileMenuItem = (menuName) => (
        <Box key={menuName} sx={{ width: "100%" }}>
            <ListItemButton
                onClick={() => {
                    handleMenuClick(menuName);
                    if (menuStructure[menuName].length === 0) {
                        handleMenuItemClick(menuName);
                    }
                }}
                sx={{
                    ...menuItemStyles(menuName),
                    "&:hover::after": { display: "none" },
                    "&:hover": {
                        backgroundColor: "rgba(156, 39, 176, 0.2)"
                    },
                    padding: "12px 20px",
                    alignItems: "center",
                    width: "100%",
                    justifyContent: "flex-start"
                }}
            >
                <ListItemIcon sx={{
                    color: "inherit",
                    minWidth: "36px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}>
                    {menuIcons[menuName]}
                </ListItemIcon>
                <ListItemText
                    primary={menuName}
                    primaryTypographyProps={{
                        fontWeight: 500,
                        sx: { lineHeight: 1.2 }
                    }}
                    sx={{ margin: 0 }}
                />
                {menuStructure[menuName].length > 0 ? (
                    expandedMenu === menuName ? <ExpandLess /> : <ExpandMore />
                ) : null}
            </ListItemButton>

            <Collapse in={expandedMenu === menuName} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                    {menuStructure[menuName].map((item) => (
                        <ListItemButton
                            key={item}
                            sx={{
                                ...subMenuStyles(false),
                                pl: "56px !important",
                                alignItems: "center",
                                width: "100%"
                            }}
                            onClick={() => {
                                toggleDrawer();
                                handleMenuItemClick(item);
                            }}
                        >
                            <ListItemIcon sx={{
                                color: "inherit",
                                minWidth: "36px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                            }}>
                                {menuIcons[item]}
                            </ListItemIcon>
                            <ListItemText
                                primary={item}
                                primaryTypographyProps={{
                                    variant: "body2",
                                    sx: { lineHeight: 1.2 }
                                }}
                                sx={{ margin: 0 }}
                            />
                        </ListItemButton>
                    ))}
                </List>
            </Collapse>
        </Box>
    );

    return (
        <>
            <AppBar position="sticky" sx={{
                background: "rgba(5, 5, 15, 0.7)",
                backdropFilter: "blur(12px)",
                boxShadow: "0 4px 30px rgba(0, 0, 0, 0.3)",
                borderBottom: "1px solid rgba(156, 39, 176, 0.2)",
                zIndex: 1200,
                height: "64px"
            }}>
                <Toolbar sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0 20px",
                    minHeight: "64px !important",
                    position: "relative"
                }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <IconButton
                            sx={{
                                display: { xs: "block", md: "none" },
                                color: "#ffffff",
                                fontSize: "30px",
                                padding: "8px",
                                borderRadius: "8px",
                                "&:hover": {
                                    backgroundColor: "rgba(156, 39, 176, 0.2)",
                                    boxShadow: "0 0 10px rgba(156, 39, 176, 0.5)"
                                },
                                marginLeft: "0px",
                                marginTop: "4px",
                            }}
                            edge="start"
                            onClick={toggleDrawer}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography
                            variant="h6"
                            onClick={() => navigate("/")}
                            sx={{
                                color: "#ffffff",
                                fontWeight: "bold",
                                textAlign: "left",
                                flexGrow: 1,
                                display: { xs: "none", md: "block" },
                                background: "linear-gradient(90deg, #ffffff, #e1bee7, #ffffff)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                textShadow: "0 0 10px rgba(156, 39, 176, 0.5)",
                                marginLeft: { xs: "20px", md: 0 },
                                cursor: "pointer"
                            }}
                        >
                            MediaVerse
                        </Typography>
                        <Box
                            ref={menuContainerRef}
                            sx={{
                                display: { xs: "none", md: "flex" },
                                gap: 0,
                                alignItems: "center",
                                height: "100%",
                                position: "relative"
                            }}
                        >
                            {Object.keys(menuStructure).map((menu) => (
                                dropdownMenu(menu, menuStructure[menu])
                            ))}
                        </Box>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Search isMobile={isMobile} />
                        <IconButton sx={{
                            color: "#ffffff",
                            "&:hover": {
                                backgroundColor: "rgba(156, 39, 176, 0.2)",
                                boxShadow: "0 0 10px rgba(156, 39, 176, 0.3)"
                            }
                        }}>
                            <NotificationsBell />
                        </IconButton>

                        <UserMenu onSignInClick={handleSignInOpen} />
                    </Box>
                </Toolbar>
            </AppBar>

            <Drawer
                anchor="left"
                open={openDrawer}
                onClose={toggleDrawer}
                sx={{
                    "& .MuiDrawer-paper": {
                        backgroundColor: "#0a0a15",
                        color: "#ffffff",
                        borderRight: "1px solid rgba(156, 39, 176, 0.2)",
                        boxShadow: "5px 0 30px rgba(0, 0, 0, 0.5)",
                        width: "280px"
                    }
                }}
            >
                <Box sx={{ position: "relative", height: "100%", display: "flex", flexDirection: "column" }}>
                    <Box sx={{
                        padding: "20px",
                        background: "linear-gradient(90deg, rgba(156, 39, 176, 0.1), transparent)",
                        borderBottom: "1px solid rgba(156, 39, 176, 0.2)",
                        textAlign: "left",
                        pl: "24px"
                    }}>
                        <Typography
                            variant="h6"
                            onClick={() => {
                                navigate("/");
                                toggleDrawer();
                            }}
                            sx={{
                                color: "#ffffff",
                                fontWeight: "bold",
                                background: "linear-gradient(90deg, #ffffff, #e1bee7, #ffffff)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                textShadow: "0 0 10px rgba(156, 39, 176, 0.5)",
                                textAlign: "left",
                                marginLeft: 0,
                                cursor: "pointer"
                            }}
                        >
                            MediaVerse
                        </Typography>
                    </Box>

                    <IconButton
                        sx={{
                            color: "#ffffff",
                            position: "absolute",
                            top: "15px",
                            right: "15px",
                            "&:hover": {
                                backgroundColor: "rgba(156, 39, 176, 0.3)"
                            }
                        }}
                        onClick={toggleDrawer}
                    >
                        <CloseIcon />
                    </IconButton>

                    <Box sx={{ padding: "10px 0", flexGrow: 1, overflowY: "auto" }}>
                        <List>
                            {Object.keys(menuStructure).map((menu) => (
                                mobileMenuItem(menu)
                            ))}
                        </List>
                    </Box>

                    <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.1)", margin: "10px 20px" }} />

                    <Box sx={{ padding: "20px" }}>
                        <Typography variant="body2" sx={{
                            color: "rgba(255, 255, 255, 0.5)",
                            textAlign: "center",
                            fontSize: "0.75rem"
                        }}>
                            © 2023 MediaVerse. Всі права захищені.
                        </Typography>
                    </Box>
                </Box>
            </Drawer>

            <AuthModal open={openSignIn} handleClose={handleSignInClose} />

            <style jsx global>{`
                @keyframes glow {
                    from {
                        box-shadow: 0 0 5px #9c27b0;
                    }
                    to {
                        box-shadow: 0 0 10px #9c27b0;
                    }
                }
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(5px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </>
    );
};

export default Navbar;
