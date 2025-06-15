import React from "react";
import { Box, Typography, Card, CardContent, Grid, Container, Button, Avatar, Chip, Divider, LinearProgress, IconButton } from "@mui/material";
import { motion } from "framer-motion";
import { FiArrowRight, FiPlay, FiMessageSquare, FiUsers, FiFilm, FiMusic, FiBook, FiHeart, FiMessageCircle, FiShare2, FiUserPlus, FiTrendingUp, FiAward, FiBarChart2, FiPieChart, FiClock, FiCalendar, FiUser, FiStar } from "react-icons/fi";
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import {useNavigate} from "react-router-dom";

const HomePage = () => {
    const navigate = useNavigate();

    const socialFeatures = [
        {
            title: "Спільноти",
            description: "Створюйте та приєднуйтесь до спільнот за інтересами",
            icon: <FiUsers size={24} />,
            color: "rgba(45, 170, 255, 0.7)"
        },
        {
            title: "Чати",
            description: "Спілкуйтесь у реальному часі з друзями та однодумцями",
            icon: <FiMessageSquare size={24} />,
            color: "rgba(170, 45, 255, 0.7)"
        },
        {
            title: "Обговорення",
            description: "Коментуйте фільми, музику та книги разом з іншими",
            icon: <FiMessageCircle size={24} />,
            color: "rgba(255, 45, 85, 0.7)"
        },
        {
            title: "Друзі",
            description: "Знаходьте нових друзів зі схожими інтересами",
            icon: <FiUserPlus size={24} />,
            color: "rgba(255, 170, 45, 0.7)"
        },
    ];

    const samplePosts = [
        {
            user: {
                name: "Анна Коваль",
                avatar: "",
                role: "Кіноман"
            },
            content: "Щойно переглянула 'Дюну' - неймовірний візуальний досвід! Хто ще дивився? Давайте обговоримо!",
            media: {
                type: "film",
                title: "Дюна",
                image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR2n-cDECXOHcePs8Ldh_uyWY7GwqUQ_QJE6SnUfl6SWa7zgj8Qqp73meUVxpqy_PDJTy4&usqp=CAU",
                rating: 4.8
            },
            likes: 124,
            comments: 42,
            shares: 18,
            timestamp: "2 години тому"
        },
        {
            user: {
                name: "Максим Петренко",
                avatar: "",
                role: "Музикант"
            },
            content: "Ділюсь своїм новим плейлистом для роботи - ідеальний білий шум з елементами ембієнту",
            media: {
                type: "playlist",
                title: "Фокус та продуктивність",
                image: "https://lkmp.app/images/screen/bg4.jpg",
                tracks: 24
            },
            likes: 89,
            comments: 15,
            shares: 7,
            timestamp: "5 годин тому"
        }
    ];

    const communityStats = [
        { value: "250K+", label: "Активних користувачів", icon: <FiTrendingUp /> },
        { value: "1.2M", label: "Щоденних повідомлень", icon: <FiMessageSquare /> },
        { value: "50K+", label: "Спільнот за інтересами", icon: <FiUsers /> },
        { value: "10K+", label: "Нових дописів щодня", icon: <FiAward /> }
    ];

    const contentDistribution = [
        { name: "Фільми", value: 45, color: "#ff2d55" },
        { name: "Музика", value: 30, color: "#2dffd1" },
        { name: "Книги", value: 15, color: "#b82dff" },
        { name: "Інше", value: 10, color: "#ff9d2d" }
    ];

    const activityData = [
        { day: "Пн", active: 65 },
        { day: "Вт", active: 70 },
        { day: "Ср", active: 80 },
        { day: "Чт", active: 75 },
        { day: "Пт", active: 90 },
        { day: "Сб", active: 85 },
        { day: "Нд", active: 60 }
    ];

    const engagementData = [
        { name: 'Січ', posts: 4000, comments: 2400, likes: 2400 },
        { name: 'Лют', posts: 3000, comments: 1398, likes: 2210 },
        { name: 'Бер', posts: 2000, comments: 9800, likes: 2290 },
        { name: 'Кві', posts: 2780, comments: 3908, likes: 2000 },
        { name: 'Тра', posts: 1890, comments: 4800, likes: 2181 },
        { name: 'Чер', posts: 2390, comments: 3800, likes: 2500 },
        { name: 'Лип', posts: 3490, comments: 4300, likes: 2100 },
    ];

    const demographicsData = [
        { subject: '18-24', A: 120, B: 110, fullMark: 150 },
        { subject: '25-34', A: 98, B: 130, fullMark: 150 },
        { subject: '35-44', A: 86, B: 130, fullMark: 150 },
        { subject: '45-54', A: 99, B: 100, fullMark: 150 },
        { subject: '55+', A: 85, B: 90, fullMark: 150 },
    ];

    const animatedBorderVariant = {
        initial: {
            backgroundPosition: "0% 50%"
        },
        animate: {
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            transition: {
                duration: 6,
                repeat: Infinity,
                ease: "linear"
            }
        }
    };

    const floatingDecorations = [
        { id: 1, size: 120, top: '5%', left: '3%', opacity: 0.3, animationDuration: 25, shape: 'circle', color: "rgba(45, 170, 255, 0.3)" },
        { id: 2, size: 80, top: '15%', right: '8%', opacity: 0.25, animationDuration: 30, shape: 'triangle', color: "rgba(170, 45, 255, 0.3)" },
        { id: 3, size: 150, bottom: '10%', left: '5%', opacity: 0.35, animationDuration: 40, shape: 'square', color: "rgba(255, 45, 85, 0.3)" },
        { id: 4, size: 100, bottom: '20%', right: '7%', opacity: 0.3, animationDuration: 35, shape: 'circle', color: "rgba(255, 170, 45, 0.3)" },
        { id: 5, size: 90, top: '35%', left: '2%', opacity: 0.3, animationDuration: 28, shape: 'triangle', color: "rgba(45, 255, 170, 0.3)" },
        { id: 6, size: 110, top: '50%', right: '4%', opacity: 0.4, animationDuration: 32, shape: 'square', color: "rgba(185, 45, 255, 0.3)" },
        { id: 7, size: 70, top: '70%', left: '10%', opacity: 0.25, animationDuration: 38, shape: 'circle', color: "rgba(255, 45, 170, 0.3)" },
        { id: 8, size: 130, top: '80%', right: '12%', opacity: 0.35, animationDuration: 45, shape: 'triangle', color: "rgba(45, 255, 255, 0.3)" },
    ];

    return (
        <>
            {/* Floating decoration elements - now more visible */}
            {floatingDecorations.map((element) => (
                <Box
                    key={element.id}
                    component={motion.div}
                    initial={{ opacity: 0 }}
                    animate={{
                        opacity: [0, element.opacity, 0],
                        y: ["0%", "-20%", "0%"],
                        rotate: element.shape === 'triangle' ? [0, 180, 360] : [0, 0, 0]
                    }}
                    transition={{
                        duration: element.animationDuration,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut"
                    }}
                    style={{
                        position: "fixed",
                        width: element.size,
                        height: element.size,
                        top: element.top,
                        left: element.left,
                        right: element.right,
                        bottom: element.bottom,
                        background: `radial-gradient(circle, ${element.color} 0%, transparent 70%)`,
                        borderRadius: element.shape === 'circle' ? '50%' : '0%',
                        clipPath: element.shape === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' :
                            element.shape === 'square' ? 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)' : '',
                        zIndex: -1,
                    }}
                />
            ))}

            {/* Hero Section */}
            <Box
                sx={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    pt: { xs: 12, md: 0 },
                    pb: 4,
                    px: { xs: 2, md: 6 },
                    position: "relative",
                    overflow: "hidden",
                    background: "linear-gradient(to bottom, rgba(10, 8, 25, 0.7) 0%, transparent 100%)"
                }}
            >
                <Container maxWidth="xl">
                    <Grid container spacing={6} alignItems="center">
                        <Grid item xs={12} md={6} sx={{ mt: { xs: 6, md: 0 } }}>
                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                            >
                                <Typography
                                    variant="h1"
                                    sx={{
                                        fontWeight: "bold",
                                        mb: 2,
                                        color: "#ffffff",
                                        fontSize: { xs: "3rem", md: "4.5rem" },
                                        lineHeight: 1.2,
                                        textShadow: "0 0 15px rgba(255,255,255,0.5)"
                                    }}
                                >
                                    MediaVerse
                                </Typography>
                                <Typography
                                    variant="h3"
                                    sx={{
                                        fontWeight: "bold",
                                        mb: 3,
                                        color: "rgba(255, 255, 255, 0.9)",
                                        fontSize: { xs: "1.8rem", md: "2.5rem" },
                                        lineHeight: 1.3,
                                        background: "linear-gradient(90deg, #ff2d55, #b82dff)",
                                        WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent"
                                    }}
                                >
                                    Соціальна мережа для творчих людей
                                </Typography>

                                <Typography
                                    variant="h5"
                                    sx={{
                                        lineHeight: 1.6,
                                        color: "rgba(255, 255, 255, 0.8)",
                                        mb: 4,
                                        fontSize: { xs: "1.1rem", md: "1.3rem" },
                                        maxWidth: "600px"
                                    }}
                                >
                                    Спілкуйтесь, діліться враженнями, знаходьте однодумців та відкривайте новий контент разом з нашою спільнотою. Приєднуйтесь до мільйонів творчих людей по всьому світу!
                                </Typography>

                                <Box sx={{ display: "flex", gap: 3, mt: 4, flexWrap: "wrap" }}>
                                    <Button
                                        component={motion.button}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => {
                                            navigate('/posts');
                                        }}
                                        variant="contained"
                                        size="large"
                                        sx={{
                                            background: "linear-gradient(45deg, #ff2d55, #b82dff)",
                                            borderRadius: "50px",
                                            px: 4,
                                            py: 1.5,
                                            fontWeight: "bold",
                                            fontSize: "1rem",
                                            minWidth: "200px",
                                            boxShadow: "0 0 15px rgba(255,45,85,0.5)"
                                        }}
                                        endIcon={<FiArrowRight />}
                                    >
                                        Приєднатися
                                    </Button>

                                    <Button
                                        component={motion.button}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        variant="outlined"
                                        size="large"
                                        sx={{
                                            color: "#ffffff",
                                            borderColor: "rgba(255, 255, 255, 0.3)",
                                            borderRadius: "50px",
                                            px: 4,
                                            py: 1.5,
                                            fontWeight: "bold",
                                            fontSize: "1rem",
                                            minWidth: "200px",
                                            "&:hover": {
                                                borderColor: "rgba(255,255,255,0.7)"
                                            }
                                        }}
                                        startIcon={<FiPlay />}
                                    >
                                        Демо
                                    </Button>
                                </Box>

                                <Box sx={{ display: "flex", gap: 2, mt: 4, flexWrap: "wrap" }}>
                                    {[
                                        { icon: <FiUser />, text: "12K+ Щоденних реєстрацій" },
                                        { icon: <FiClock />, text: "24/7 Підтримка" },
                                        { icon: <FiCalendar />, text: "Щоденні івенти" }
                                    ].map((item, index) => (
                                        <Chip
                                            key={index}
                                            icon={item.icon}
                                            label={item.text}
                                            sx={{
                                                background: "rgba(255,255,255,0.1)",
                                                color: "#ffffff",
                                                backdropFilter: "blur(5px)",
                                                border: "1px solid rgba(255,255,255,0.2)"
                                            }}
                                        />
                                    ))}
                                </Box>
                            </motion.div>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                            >
                                <Box
                                    component={motion.div}
                                    variants={animatedBorderVariant}
                                    initial="initial"
                                    animate="animate"
                                    sx={{
                                        position: "relative",
                                        borderRadius: "16px",
                                        overflow: "hidden",
                                        p: "3px",
                                        background: "linear-gradient(90deg, #ff2d55, #b82dff, #2dffd1, #ff9d2d, #ff2d55)",
                                        backgroundSize: "400% 400%",
                                        boxShadow: "0 0 30px rgba(185,45,255,0.3)"
                                    }}
                                >
                                    <Box
                                        sx={{
                                            background: "rgba(15, 10, 25, 0.8)",
                                            borderRadius: "14px",
                                            overflow: "hidden",
                                            backdropFilter: "blur(10px)"
                                        }}
                                    >
                                        <Box sx={{ p: 4 }}>
                                            <Typography variant="h6" sx={{ color: "#ffffff", mb: 1, fontWeight: "bold" }}>
                                                Останні події у спільноті
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
                                                12,345 активних користувачів обговорюють 3,421 тему
                                            </Typography>

                                            <Box sx={{ mt: 3 }}>
                                                <ResponsiveContainer width="100%" height={200}>
                                                    <LineChart data={engagementData.slice(0, 5)}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                                        <XAxis dataKey="name" stroke="rgba(255,255,255,0.7)" />
                                                        <YAxis stroke="rgba(255,255,255,0.7)" />
                                                        <Tooltip
                                                            contentStyle={{
                                                                background: "rgba(30,30,60,0.9)",
                                                                border: "1px solid rgba(255,255,255,0.2)",
                                                                borderRadius: "8px"
                                                            }}
                                                        />
                                                        <Line type="monotone" dataKey="posts" stroke="#ff2d55" strokeWidth={2} />
                                                        <Line type="monotone" dataKey="comments" stroke="#2dffd1" strokeWidth={2} />
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            </Box>
                                        </Box>
                                    </Box>
                                </Box>
                            </motion.div>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* Social Features Section */}
            <Box sx={{ py: 10, position: "relative", background: "linear-gradient(to bottom, transparent 0%, rgba(10, 8, 25, 0.5) 100%)" }}>
                <Container maxWidth="lg">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <Typography
                            variant="h2"
                            sx={{
                                textAlign: "center",
                                mb: 2,
                                fontWeight: "bold",
                                color: "#ffffff",
                                fontSize: { xs: "2.2rem", md: "3rem" }
                            }}
                        >
                            Соціальні можливості
                        </Typography>

                        <Typography
                            variant="h6"
                            sx={{
                                textAlign: "center",
                                mb: 6,
                                color: "rgba(255, 255, 255, 0.7)",
                                maxWidth: "700px",
                                mx: "auto",
                                fontSize: { xs: "1rem", md: "1.2rem" }
                            }}
                        >
                            Спілкування та взаємодія - основа нашої спільноти
                        </Typography>

                        <Grid container spacing={4}>
                            {socialFeatures.map((feature, index) => (
                                <Grid item xs={12} sm={6} md={3} key={index}>
                                    <Card
                                        component={motion.div}
                                        initial={{ opacity: 0, y: 50 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                        whileHover={{ y: -10, boxShadow: `0 10px 20px ${feature.color}40` }}
                                        sx={{
                                            background: "rgba(30, 30, 60, 0.3)",
                                            backdropFilter: "blur(10px)",
                                            color: "#ffffff",
                                            borderRadius: "16px",
                                            border: `1px solid ${feature.color}`,
                                            height: "100%",
                                            position: "relative",
                                            overflow: "hidden"
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                position: "absolute",
                                                top: 0,
                                                right: 0,
                                                width: "100%",
                                                height: "100%",
                                                background: `radial-gradient(circle at 70% 20%, ${feature.color} 0%, transparent 70%)`,
                                                opacity: 0.1,
                                                zIndex: 0
                                            }}
                                        />
                                        <CardContent sx={{ p: 4, position: "relative", zIndex: 1 }}>
                                            <Box
                                                sx={{
                                                    width: "80px",
                                                    height: "80px",
                                                    borderRadius: "50%",
                                                    background: `radial-gradient(circle, ${feature.color} 0%, transparent 70%)`,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    margin: "0 auto 20px",
                                                    color: "#fff",
                                                    fontSize: "32px",
                                                    boxShadow: `0 0 20px ${feature.color}`
                                                }}
                                            >
                                                {feature.icon}
                                            </Box>
                                            <Typography
                                                variant="h5"
                                                sx={{
                                                    fontWeight: "bold",
                                                    mb: 2,
                                                    textAlign: "center",
                                                    color: feature.color,
                                                    fontSize: { xs: "1.3rem", md: "1.5rem" }
                                                }}
                                            >
                                                {feature.title}
                                            </Typography>
                                            <Typography
                                                variant="body1"
                                                sx={{
                                                    color: "rgba(255, 255, 255, 0.7)",
                                                    mb: 3,
                                                    textAlign: "center",
                                                    fontSize: { xs: "0.9rem", md: "1rem" }
                                                }}
                                            >
                                                {feature.description}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </motion.div>
                </Container>
            </Box>

            {/* Sample Posts Section */}
            <Box sx={{ py: 10, background: "linear-gradient(to bottom, rgba(10, 8, 25, 0.5) 0%, rgba(10, 8, 25, 0.7) 100%)" }}>
                <Container maxWidth="md">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <Typography
                            variant="h2"
                            sx={{
                                textAlign: "center",
                                mb: 2,
                                fontWeight: "bold",
                                color: "#ffffff",
                                fontSize: { xs: "2.2rem", md: "3rem" }
                            }}
                        >
                            Останні дописи
                        </Typography>

                        <Typography
                            variant="h6"
                            sx={{
                                textAlign: "center",
                                mb: 6,
                                color: "rgba(255, 255, 255, 0.7)",
                                maxWidth: "700px",
                                mx: "auto",
                                fontSize: { xs: "1rem", md: "1.2rem" }
                            }}
                        >
                            Подивіться, що обговорюють у спільноті прямо зараз
                        </Typography>

                        <Grid container spacing={4}>
                            {samplePosts.map((post, index) => (
                                <Grid item xs={12} key={index}>
                                    <Card
                                        component={motion.div}
                                        initial={{ opacity: 0, y: 50 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                        whileHover={{ y: -10 }}
                                        sx={{
                                            background: "rgba(30, 30, 60, 0.4)",
                                            backdropFilter: "blur(10px)",
                                            color: "#ffffff",
                                            borderRadius: "16px",
                                            border: "1px solid rgba(255, 255, 255, 0.1)",
                                            overflow: "hidden",
                                            boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
                                        }}
                                    >
                                        <CardContent sx={{ p: 0 }}>
                                            <Box sx={{ p: 4 }}>
                                                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                                                    <Avatar src={post.user.avatar} sx={{ width: 56, height: 56 }} />
                                                    <Box sx={{ ml: 3 }}>
                                                        <Typography variant="subtitle1" sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>
                                                            {post.user.name}
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.5)" }}>
                                                            {post.user.role} • {post.timestamp}
                                                        </Typography>
                                                    </Box>
                                                </Box>

                                                <Typography variant="body1" sx={{ mb: 4, fontSize: "1.1rem" }}>
                                                    {post.content}
                                                </Typography>

                                                {post.media && (
                                                    <Box
                                                        component={motion.div}
                                                        variants={animatedBorderVariant}
                                                        initial="initial"
                                                        animate="animate"
                                                        sx={{
                                                            position: "relative",
                                                            borderRadius: "12px",
                                                            overflow: "hidden",
                                                            p: "2px",
                                                            background: "linear-gradient(90deg, #ff2d55, #b82dff, #2dffd1, #ff9d2d, #ff2d55)",
                                                            backgroundSize: "400% 400%",
                                                            mb: 4
                                                        }}
                                                    >
                                                        <Box
                                                            sx={{
                                                                background: "rgba(15, 10, 25, 0.8)",
                                                                borderRadius: "10px",
                                                                overflow: "hidden",
                                                                backdropFilter: "blur(5px)"
                                                            }}
                                                        >
                                                            <Box sx={{ display: "flex" }}>
                                                                <img
                                                                    src={post.media.image}
                                                                    alt={post.media.title}
                                                                    style={{
                                                                        width: "120px",
                                                                        height: "120px",
                                                                        objectFit: "cover"
                                                                    }}
                                                                />
                                                                <Box sx={{ p: 3, flex: 1 }}>
                                                                    <Typography variant="subtitle2" sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>
                                                                        {post.media.title}
                                                                    </Typography>
                                                                    {post.media.rating && (
                                                                        <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
                                                                            <FiStar color="#ff9d2d" size={20} />
                                                                            <Typography variant="body2" sx={{ ml: 1, color: "#ff9d2d", fontSize: "1rem" }}>
                                                                                {post.media.rating}/5
                                                                            </Typography>
                                                                        </Box>
                                                                    )}
                                                                    {post.media.tracks && (
                                                                        <Typography variant="body2" sx={{ mt: 2, color: "rgba(255,255,255,0.7)", fontSize: "1rem" }}>
                                                                            {post.media.tracks} треків
                                                                        </Typography>
                                                                    )}
                                                                </Box>
                                                            </Box>
                                                        </Box>
                                                    </Box>
                                                )}

                                                <Box sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
                                                    <Button
                                                        startIcon={<FiHeart />}
                                                        sx={{
                                                            color: "rgba(255, 255, 255, 0.7)",
                                                            "&:hover": {
                                                                color: "#ff2d55"
                                                            }
                                                        }}
                                                    >
                                                        {post.likes} Вподобань
                                                    </Button>
                                                    <Button
                                                        startIcon={<FiMessageCircle />}
                                                        sx={{
                                                            color: "rgba(255, 255, 255, 0.7)",
                                                            "&:hover": {
                                                                color: "#2dffd1"
                                                            }
                                                        }}
                                                    >
                                                        {post.comments} Коментарів
                                                    </Button>
                                                    <Button
                                                        startIcon={<FiShare2 />}
                                                        sx={{
                                                            color: "rgba(255, 255, 255, 0.7)",
                                                            "&:hover": {
                                                                color: "#b82dff"
                                                            }
                                                        }}
                                                    >
                                                        {post.shares} Поділились
                                                    </Button>
                                                </Box>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </motion.div>
                </Container>
            </Box>

            {/* Community Stats Section */}
            <Box sx={{ py: 10, background: "linear-gradient(to bottom, rgba(10, 8, 25, 0.7) 0%, rgba(10, 8, 25, 0.5) 100%)" }}>
                <Container maxWidth="lg">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <Typography
                            variant="h2"
                            sx={{
                                textAlign: "center",
                                mb: 6,
                                fontWeight: "bold",
                                color: "#ffffff",
                                fontSize: { xs: "2.2rem", md: "3rem" }
                            }}
                        >
                            Наша спільнота в цифрах
                        </Typography>

                        <Grid container spacing={4}>
                            {communityStats.map((stat, index) => (
                                <Grid item xs={12} sm={6} md={3} key={index}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 50 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                    >
                                        <Box
                                            sx={{
                                                background: "rgba(30, 30, 60, 0.4)",
                                                backdropFilter: "blur(10px)",
                                                borderRadius: "16px",
                                                p: 4,
                                                textAlign: "center",
                                                border: "1px solid rgba(255, 255, 255, 0.1)",
                                                height: "100%",
                                                boxShadow: "0 10px 20px rgba(0,0,0,0.2)"
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    width: "80px",
                                                    height: "80px",
                                                    borderRadius: "50%",
                                                    background: "rgba(255,255,255,0.1)",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    margin: "0 auto 20px",
                                                    color: "#ffffff",
                                                    fontSize: "32px"
                                                }}
                                            >
                                                {stat.icon}
                                            </Box>
                                            <Typography
                                                variant="h3"
                                                sx={{
                                                    fontWeight: "bold",
                                                    mb: 1,
                                                    background: "linear-gradient(90deg, #ff2d55, #b82dff)",
                                                    WebkitBackgroundClip: "text",
                                                    WebkitTextFillColor: "transparent",
                                                    fontSize: { xs: "2rem", md: "2.5rem" }
                                                }}
                                            >
                                                {stat.value}
                                            </Typography>
                                            <Typography variant="body1" sx={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "1.1rem" }}>
                                                {stat.label}
                                            </Typography>
                                        </Box>
                                    </motion.div>
                                </Grid>
                            ))}
                        </Grid>
                    </motion.div>
                </Container>
            </Box>

            {/* Content Distribution Section */}
            <Box sx={{ py: 10, background: "linear-gradient(to bottom, rgba(10, 8, 25, 0.5) 0%, rgba(10, 8, 25, 0.7) 100%)" }}>
                <Container maxWidth="lg">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <Typography
                            variant="h2"
                            sx={{
                                textAlign: "center",
                                mb: 6,
                                fontWeight: "bold",
                                color: "#ffffff",
                                fontSize: { xs: "2.2rem", md: "3rem" }
                            }}
                        >
                            Аналітика спільноти
                        </Typography>

                        <Grid container spacing={4} alignItems="center">
                            <Grid item xs={12} md={6}>
                                <Card
                                    component={motion.div}
                                    initial={{ opacity: 0, x: -50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6 }}
                                    sx={{
                                        background: "rgba(30, 30, 60, 0.4)",
                                        backdropFilter: "blur(10px)",
                                        borderRadius: "16px",
                                        p: 4,
                                        border: "1px solid rgba(255, 255, 255, 0.1)",
                                        height: "100%",
                                        boxShadow: "0 10px 20px rgba(0,0,0,0.2)"
                                    }}
                                >
                                    <Typography variant="h5" sx={{ mb: 3, color: "#ffffff", fontWeight: "bold", textAlign: "center" }}>
                                        Розподіл контенту
                                    </Typography>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={contentDistribution}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            >
                                                {contentDistribution.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{
                                                    background: "rgba(30,30,60,0.9)",
                                                    border: "1px solid rgba(255,255,255,0.2)",
                                                    borderRadius: "8px"
                                                }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </Card>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Card
                                    component={motion.div}
                                    initial={{ opacity: 0, x: 50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6 }}
                                    sx={{
                                        background: "rgba(30, 30, 60, 0.4)",
                                        backdropFilter: "blur(10px)",
                                        borderRadius: "16px",
                                        p: 4,
                                        border: "1px solid rgba(255, 255, 255, 0.1)",
                                        height: "100%",
                                        boxShadow: "0 10px 20px rgba(0,0,0,0.2)"
                                    }}
                                >
                                    <Typography variant="h5" sx={{ mb: 3, color: "#ffffff", fontWeight: "bold", textAlign: "center" }}>
                                        Активність користувачів
                                    </Typography>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={engagementData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                            <XAxis dataKey="name" stroke="rgba(255,255,255,0.7)" />
                                            <YAxis stroke="rgba(255,255,255,0.7)" />
                                            <Tooltip
                                                contentStyle={{
                                                    background: "rgba(30,30,60,0.9)",
                                                    border: "1px solid rgba(255,255,255,0.2)",
                                                    borderRadius: "8px"
                                                }}
                                            />
                                            <Legend />
                                            <Bar dataKey="posts" fill="#ff2d55" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="comments" fill="#2dffd1" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="likes" fill="#b82dff" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Card>
                            </Grid>

                            <Grid item xs={12}>
                                <Card
                                    component={motion.div}
                                    initial={{ opacity: 0, y: 50 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6 }}
                                    sx={{
                                        background: "rgba(30, 30, 60, 0.4)",
                                        backdropFilter: "blur(10px)",
                                        borderRadius: "16px",
                                        p: 4,
                                        border: "1px solid rgba(255, 255, 255, 0.1)",
                                        boxShadow: "0 10px 20px rgba(0,0,0,0.2)"
                                    }}
                                >
                                    <Typography variant="h5" sx={{ mb: 3, color: "#ffffff", fontWeight: "bold", textAlign: "center" }}>
                                        Демографія користувачів
                                    </Typography>
                                    <ResponsiveContainer width="100%" height={400}>
                                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={demographicsData}>
                                            <PolarGrid stroke="rgba(255,255,255,0.3)" />
                                            <PolarAngleAxis dataKey="subject" stroke="rgba(255,255,255,0.7)" />
                                            <PolarRadiusAxis angle={30} domain={[0, 150]} stroke="rgba(255,255,255,0.3)" />
                                            <Radar name="Чоловіки" dataKey="A" stroke="#ff2d55" fill="#ff2d55" fillOpacity={0.6} />
                                            <Radar name="Жінки" dataKey="B" stroke="#2dffd1" fill="#2dffd1" fillOpacity={0.6} />
                                            <Legend />
                                            <Tooltip
                                                contentStyle={{
                                                    background: "rgba(30,30,60,0.9)",
                                                    border: "1px solid rgba(255,255,255,0.2)",
                                                    borderRadius: "8px"
                                                }}
                                            />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </Card>
                            </Grid>
                        </Grid>
                    </motion.div>
                </Container>
            </Box>

            {/* Testimonials Section - Improved design */}
            <Box sx={{ py: 10, background: "linear-gradient(to bottom, rgba(10, 8, 25, 0.7) 0%, rgba(10, 8, 25, 0.5) 100%)" }}>
                <Container maxWidth="md">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <Typography
                            variant="h2"
                            sx={{
                                textAlign: "center",
                                mb: 6,
                                fontWeight: "bold",
                                color: "#ffffff",
                                fontSize: { xs: "2.2rem", md: "3rem" }
                            }}
                        >
                            Відгуки наших користувачів
                        </Typography>

                        <Grid container spacing={4}>
                            {[
                                {
                                    name: "Олександр Петров",
                                    role: "Кінофан",
                                    avatar: "",
                                    comment: "Найкраще місце для обговорення фільмів! Знайшов багато однодумців. Спільнота дуже активна та дружня.",
                                    rating: 5,
                                    color: "#ff2d55"
                                },
                                {
                                    name: "Марія Іванова",
                                    role: "Музикант",
                                    avatar: "",
                                    comment: "Чудова платформа для обміну музикою та знайомств з творчими людьми. Особливо подобаються тематичні спільноти.",
                                    rating: 4,
                                    color: "#2dffd1"
                                },
                                {
                                    name: "Іван Сидоренко",
                                    role: "Блогер",
                                    avatar: "",
                                    comment: "Люблю цю спільноту за її атмосферу та якісний контент. Модератори дбають про якість обговорень.",
                                    rating: 5,
                                    color: "#b82dff"
                                }
                            ].map((testimonial, index) => (
                                <Grid item xs={12} md={4} key={index}>
                                    <Card
                                        component={motion.div}
                                        initial={{ opacity: 0, y: 50 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                        whileHover={{ y: -10 }}
                                        sx={{
                                            background: "rgba(30, 30, 60, 0.4)",
                                            backdropFilter: "blur(10px)",
                                            borderRadius: "16px",
                                            p: 4,
                                            border: `1px solid ${testimonial.color}`,
                                            height: "100%",
                                            boxShadow: `0 10px 20px ${testimonial.color}40`,
                                            position: "relative",
                                            overflow: "hidden"
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                position: "absolute",
                                                top: 0,
                                                right: 0,
                                                width: "100%",
                                                height: "100%",
                                                background: `radial-gradient(circle at 70% 20%, ${testimonial.color} 0%, transparent 70%)`,
                                                opacity: 0.1,
                                                zIndex: 0
                                            }}
                                        />
                                        <Box sx={{ position: "relative", zIndex: 1 }}>
                                            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                                                <Avatar
                                                    src={testimonial.avatar}
                                                    sx={{
                                                        width: 56,
                                                        height: 56,
                                                        border: `2px solid ${testimonial.color}`
                                                    }}
                                                />
                                                <Box sx={{ ml: 3 }}>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>
                                                        {testimonial.name}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.5)" }}>
                                                        {testimonial.role}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Typography
                                                variant="body1"
                                                sx={{
                                                    mb: 3,
                                                    color: "rgba(255, 255, 255, 0.9)",
                                                    fontSize: "1rem",
                                                    fontStyle: "italic",
                                                    position: "relative",
                                                    pl: 2,
                                                    "&:before": {
                                                        content: '""',
                                                        position: "absolute",
                                                        left: 0,
                                                        top: 0,
                                                        bottom: 0,
                                                        width: "3px",
                                                        background: testimonial.color,
                                                        borderRadius: "3px"
                                                    }
                                                }}
                                            >
                                                "{testimonial.comment}"
                                            </Typography>
                                            <Box sx={{ display: "flex" }}>
                                                {[...Array(5)].map((_, i) => (
                                                    <FiStar
                                                        key={i}
                                                        color={i < testimonial.rating ? testimonial.color : "rgba(255,255,255,0.2)"}
                                                        style={{ marginRight: 2 }}
                                                        size={20}
                                                    />
                                                ))}
                                            </Box>
                                        </Box>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </motion.div>
                </Container>
            </Box>

            {/* CTA Section */}
            <Box sx={{ py: 10, background: "linear-gradient(to bottom, rgba(10, 8, 25, 0.5) 0%, rgba(10, 8, 25, 0.8) 100%)" }}>
                <Container maxWidth="md">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <Card
                            sx={{
                                background: "rgba(30, 30, 60, 0.4)",
                                backdropFilter: "blur(10px)",
                                borderRadius: "16px",
                                p: 6,
                                border: "1px solid rgba(255, 255, 255, 0.1)",
                                textAlign: "center",
                                boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                                position: "relative",
                                overflow: "hidden"
                            }}
                        >
                            <Box
                                sx={{
                                    position: "absolute",
                                    top: 0,
                                    right: 0,
                                    width: "100%",
                                    height: "100%",
                                    background: "linear-gradient(45deg, rgba(255,45,85,0.1), rgba(185,45,255,0.1))",
                                    zIndex: 0
                                }}
                            />
                            <Box sx={{ position: "relative", zIndex: 1 }}>
                                <Typography
                                    variant="h2"
                                    sx={{
                                        mb: 3,
                                        fontWeight: "bold",
                                        color: "#ffffff",
                                        fontSize: { xs: "2rem", md: "2.5rem" }
                                    }}
                                >
                                    Приєднуйтесь до нашої спільноти
                                </Typography>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        mb: 4,
                                        color: "rgba(255, 255, 255, 0.7)",
                                        maxWidth: "600px",
                                        mx: "auto",
                                        fontSize: { xs: "1rem", md: "1.2rem" }
                                    }}
                                >
                                    Станьте частиною творчої спільноти вже сьогодні. Шукайте друзів, створюйте чати, обговорюйте спільні теми та діліться враженнями!
                                </Typography>
                                <Button
                                    component={motion.button}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    variant="contained"
                                    onClick={() => {
                                        navigate('/users')
                                    }}
                                    size="large"
                                    sx={{
                                        background: "linear-gradient(45deg, #ff2d55, #b82dff)",
                                        borderRadius: "50px",
                                        px: 6,
                                        py: 1.5,
                                        fontWeight: "bold",
                                        fontSize: "1.1rem",
                                        boxShadow: "0 0 20px rgba(255,45,85,0.5)"
                                    }}
                                    endIcon={<FiArrowRight />}
                                >
                                    Знайти друзів
                                </Button>
                            </Box>
                        </Card>
                    </motion.div>
                </Container>
            </Box>
        </>
    );
};

export default HomePage;
