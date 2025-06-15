import React, {useEffect, useState} from "react";
import {
    Box,
    Button,
    CircularProgress,
    Collapse,
    Divider,
    Fade,
    FormHelperText,
    Grid,
    Grow,
    IconButton,
    Modal,
    Slide,
    TextField,
    Typography,
    useMediaQuery,
    useTheme,
    Zoom
} from "@mui/material";
import {Close, GitHub, Google, Mail, Send} from "@mui/icons-material";
import {Field, Form, Formik} from "formik";
import * as Yup from "yup";
import {useAuth} from '@/Components/Auth/AuthProvider.jsx';
import {emailActions} from "@/api/actions/index.js";
import {toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {authUrls} from "@/api/urls/index.js";

const validationSchema = Yup.object({
    username: Yup.string().when('isSignUp', {
        is: true,
        then: Yup.string().required("Обов'язкове поле"),
    }),
    email: Yup.string().email("Невірний формат емейлу").required("Обов'язкове поле"),
    password: Yup.string().min(8, "Не менше 8 символів").required("Обов'язкове поле"),
});

const AuthModal = ({open, handleClose, isSignUp = false}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const [isSignIn, setIsSignIn] = useState(!isSignUp);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showVerification, setShowVerification] = useState(false);
    const [emailForVerification, setEmailForVerification] = useState("");
    const {user, login, register} = useAuth();

    useEffect(() => {
        if (open && user && !user.email_verified_at) {
            setShowVerification(true);
            setEmailForVerification(user.email);
        } else {
            setShowVerification(false);
            setEmailForVerification("");
        }
    }, [open, user]);

    const toggleForm = (resetForm) => {
        if (isLoading) return;
        setIsAnimating(true);
        resetForm();
        setTimeout(() => {
            setIsSignIn(prev => !prev);
            setIsAnimating(false);
        }, 300);
    };

    const handleResendVerification = async () => {
        setIsLoading(true);
        try {
            await emailActions.resendEmailVerification();
            toast.success("Лист з підтвердженням відправлено повторно!");
        } catch (err) {
            toast.error(err.response?.data?.message || "Не вдалося відправити лист. Спробуйте пізніше.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (values) => {
        if (user) {
            toast.error("Ви вже увійшли в акаунт.");
            return;
        }
        setIsLoading(true);
        try {
            if (isSignIn) {
                await login({
                    email: values.email,
                    password: values.password
                });
                toast.success("Успішний вхід!");
                handleClose();
            } else {
                await register({
                    username: values.username,
                    email: values.email,
                    password: values.password
                });
                setEmailForVerification(values.email);
                toast.success("Реєстрація успішна! Будь ласка, підтвердьте ваш email.");
                setIsAnimating(true);
                setTimeout(() => {
                    setShowVerification(true);
                    setIsAnimating(false);
                }, 500);
            }
        } catch (err) {
            console.log(err.response);
            toast.error(Object.values(err.response?.data?.errors || {}).flat().join('\n') ||
                (isSignIn
                    ? "Помилка входу. Перевірте дані."
                    : "Помилка реєстрації. Можливо, email вже використовується.")
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleSocialLogin = (provider) => {
        if (isLoading) return;
        window.location.href = authUrls.oAuth2Redirect(provider);
    };

    return (
        <>
            <Modal
                open={open}
                onClose={!isLoading ? handleClose : undefined}
                closeAfterTransition
                BackdropProps={{
                    style: {
                        backgroundColor: "rgba(0, 0, 0, 0.8)",
                        backdropFilter: "blur(10px)",
                    },
                }}
                componentsProps={{
                    backdrop: {
                        timeout: 500,
                    },
                }}
            >
                <Fade in={open} timeout={500}>
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            minHeight: "100vh",
                            outline: "none",
                        }}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                backgroundColor: "#000",
                                padding: 3,
                                borderRadius: 2,
                                width: "90%",
                                maxWidth: 765,
                                boxShadow: 24,
                                textAlign: "center",
                                position: "relative",
                                flexDirection: isMobile ? "column" : "row",
                                color: "#fff",
                                maxHeight: "600px",
                                overflowY: "auto",
                                "&::-webkit-scrollbar": {
                                    display: "none",
                                },
                                "-ms-overflow-style": "none",
                                "scrollbar-width": "none",
                                opacity: isLoading ? 0.9 : 1,
                                filter: isLoading ? "blur(0.5px)" : "none",
                                transition: "all 0.3s ease",
                            }}
                        >
                            {!isMobile && (
                                <Grow in={open} timeout={800}>
                                    <Box
                                        sx={{
                                            backgroundImage: 'url("https://i.pinimg.com/736x/2a/40/ae/2a40aed937ae205bf827aa5cbf64a2b0.jpg")',
                                            backgroundSize: "cover",
                                            backgroundPosition: "center",
                                            borderRadius: 2,
                                            flex: 1,
                                            aspectRatio: "16 / 9",
                                            transition: "transform 0.3s ease",
                                            "&:hover": {
                                                transform: isLoading ? "none" : "scale(1.02)",
                                            },
                                        }}
                                    />
                                </Grow>
                            )}

                            <Box
                                sx={{
                                    flex: 1,
                                    padding: 3,
                                    borderRadius: 2,
                                    textAlign: "center",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "center",
                                    position: "relative",
                                }}
                            >
                                {isLoading && (
                                    <Box
                                        sx={{
                                            position: "absolute",
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            zIndex: 10,
                                            pointerEvents: "none",
                                        }}
                                    >
                                        <CircularProgress
                                            size={50}
                                            thickness={3}
                                            sx={{
                                                color: "#ff4081",
                                            }}
                                        />
                                    </Box>
                                )}

                                <Zoom in={open} timeout={500}>
                                    <IconButton
                                        onClick={!isLoading ? handleClose : undefined}
                                        disabled={isLoading}
                                        sx={{
                                            position: "absolute",
                                            top: 16,
                                            right: 16,
                                            color: "#fff",
                                            transition: "transform 0.2s",
                                            "&:hover": {
                                                transform: "rotate(90deg)",
                                            },
                                        }}
                                    >
                                        <Close/>
                                    </IconButton>
                                </Zoom>

                                <Collapse in={showVerification} timeout={500} unmountOnExit>
                                    <Box sx={{
                                        animation: "fadeIn 0.5s ease",
                                        "@keyframes fadeIn": {
                                            "0%": {opacity: 0, transform: "translateY(20px)"},
                                            "100%": {opacity: 1, transform: "translateY(0)"}
                                        }
                                    }}>
                                        <Slide in={!isAnimating} direction="down" timeout={300}>
                                            <Box>
                                                <Mail sx={{
                                                    fontSize: 60,
                                                    color: "#ff4081",
                                                    mb: 2,
                                                    animation: "pulse 2s infinite",
                                                    "@keyframes pulse": {
                                                        "0%": {transform: "scale(1)"},
                                                        "50%": {transform: "scale(1.1)"},
                                                        "100%": {transform: "scale(1)"}
                                                    }
                                                }}/>
                                                <Typography variant="h5" sx={{fontWeight: 600, color: "#fff", mb: 2}}>
                                                    Підтвердіть вашу електронну адресу
                                                </Typography>
                                            </Box>
                                        </Slide>

                                        <Slide in={!isAnimating} direction="down" timeout={400}>
                                            <Box sx={{color: "#bbb", mb: 4}}>
                                                <Typography variant="body1" sx={{mb: 2}}>
                                                    Ми надіслали лист з посиланням для підтвердження на:
                                                </Typography>
                                                <Box sx={{
                                                    backgroundColor: "rgba(255, 64, 129, 0.1)",
                                                    borderLeft: "4px solid #ff4081",
                                                    padding: 2,
                                                    mb: 3,
                                                    textAlign: "center",
                                                    borderRadius: "4px"
                                                }}>
                                                    <Typography variant="body1" sx={{fontWeight: 600}}>
                                                        {emailForVerification}
                                                    </Typography>
                                                </Box>
                                                <Typography variant="body2" sx={{mb: 3}}>
                                                    Перевірте вашу поштову скриньку та натисніть на посилання в листі.
                                                </Typography>
                                                <Divider sx={{my: 2, backgroundColor: "rgba(255,255,255,0.1)"}}/>
                                                <Typography variant="body2" sx={{color: "#aaa", mb: 3}}>
                                                    Не отримали лист? Перевірте папку "Спам" або спробуйте відправити ще
                                                    раз.
                                                </Typography>
                                            </Box>
                                        </Slide>

                                        <Box>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                fullWidth
                                                disabled={isLoading}
                                                sx={{
                                                    py: 1.5,
                                                    backgroundColor: "#ff4081",
                                                    transition: "all 0.3s",
                                                    "&:hover": {
                                                        backgroundColor: isLoading ? "#ff4081" : "#e60073",
                                                        transform: isLoading ? "none" : "translateY(-2px)",
                                                    },
                                                }}
                                                startIcon={isLoading ? <CircularProgress size={24} color="inherit"/> :
                                                    <Send/>}
                                                onClick={handleResendVerification}
                                            >
                                                {isLoading ? "Відправка..." : "Надіслати лист повторно"}
                                            </Button>
                                        </Box>
                                    </Box>
                                </Collapse>

                                <Collapse in={!showVerification} timeout={500} unmountOnExit>
                                    <Box sx={{
                                        animation: "fadeIn 0.5s ease",
                                        "@keyframes fadeIn": {
                                            "0%": {opacity: 0, transform: "translateY(20px)"},
                                            "100%": {opacity: 1, transform: "translateY(0)"}
                                        }
                                    }}>
                                        <Slide in={!isAnimating} direction="down" timeout={300}>
                                            <Typography variant="h5" sx={{fontWeight: 600, color: "#fff", mb: 2}}>
                                                MediaVerse
                                            </Typography>
                                        </Slide>

                                        <Slide in={!isAnimating} direction="down" timeout={400}>
                                            <Typography variant="body2" sx={{color: "#bbb", mb: 2}}>
                                                {isSignIn
                                                    ? "Будь ласка, увійдіть, щоб продовжити."
                                                    : "Будь ласка, зареєструйтесь, щоб продовжити."}
                                            </Typography>
                                        </Slide>

                                        <Formik
                                            initialValues={{username: "", email: "", password: ""}}
                                            validationSchema={validationSchema}
                                            onSubmit={handleSubmit}
                                        >
                                            {({errors, touched, resetForm}) => (
                                                <Form>
                                                    <Grid container direction="column" spacing={1}>
                                                        {!isSignIn && (
                                                            <Grow in={!isSignIn && !isAnimating} timeout={500}>
                                                                <Grid item>
                                                                    <Field
                                                                        as={TextField}
                                                                        label="Username"
                                                                        fullWidth
                                                                        name="username"
                                                                        error={touched.username && Boolean(errors.username)}
                                                                        variant="outlined"
                                                                        margin="dense"
                                                                        disabled={isLoading}
                                                                        sx={{
                                                                            input: {color: "#fff"},
                                                                            label: {color: "#bbb"},
                                                                            backgroundColor: "#0c0c0d",
                                                                            borderRadius: "7px",
                                                                            "& .MuiOutlinedInput-root": {
                                                                                "& fieldset": {
                                                                                    borderColor: "#1d1d1e",
                                                                                    borderRadius: "7px",
                                                                                },
                                                                                "&:hover fieldset": {
                                                                                    borderColor: "#4b0505",
                                                                                },
                                                                            },
                                                                        }}
                                                                    />
                                                                    {touched.username && errors.username && (
                                                                        <FormHelperText
                                                                            sx={{color: "#f44336", textAlign: "left"}}>
                                                                            {errors.username}
                                                                        </FormHelperText>
                                                                    )}
                                                                </Grid>
                                                            </Grow>
                                                        )}

                                                        <Grid item>
                                                            <Field
                                                                as={TextField}
                                                                label="Email"
                                                                fullWidth
                                                                name="email"
                                                                type="email"
                                                                error={touched.email && Boolean(errors.email)}
                                                                variant="outlined"
                                                                margin="dense"
                                                                disabled={isLoading}
                                                                sx={{
                                                                    input: {color: "#fff"},
                                                                    label: {color: "#bbb"},
                                                                    backgroundColor: "#0c0c0d",
                                                                    borderRadius: "7px",
                                                                    "& .MuiOutlinedInput-root": {
                                                                        "& fieldset": {
                                                                            borderColor: "#1d1d1e",
                                                                            borderRadius: "7px",
                                                                        },
                                                                        "&:hover fieldset": {
                                                                            borderColor: "#4b0505",
                                                                        },
                                                                    },
                                                                }}
                                                            />
                                                            {touched.email && errors.email && (
                                                                <FormHelperText
                                                                    sx={{color: "#f44336", textAlign: "left"}}>
                                                                    {errors.email}
                                                                </FormHelperText>
                                                            )}
                                                        </Grid>

                                                        <Grid item>
                                                            <Field
                                                                as={TextField}
                                                                label="Password"
                                                                type="password"
                                                                fullWidth
                                                                name="password"
                                                                error={touched.password && Boolean(errors.password)}
                                                                variant="outlined"
                                                                margin="dense"
                                                                disabled={isLoading}
                                                                sx={{
                                                                    input: {color: "#fff"},
                                                                    label: {color: "#bbb"},
                                                                    backgroundColor: "#0c0c0d",
                                                                    borderRadius: "7px",
                                                                    "& .MuiOutlinedInput-root": {
                                                                        "& fieldset": {
                                                                            borderColor: "#1d1d1e",
                                                                            borderRadius: "7px",
                                                                        },
                                                                        "&:hover fieldset": {
                                                                            borderColor: "#4b0505",
                                                                        },
                                                                    },
                                                                }}
                                                            />
                                                            {touched.password && errors.password && (
                                                                <FormHelperText
                                                                    sx={{color: "#f44336", textAlign: "left"}}>
                                                                    {errors.password}
                                                                </FormHelperText>
                                                            )}
                                                        </Grid>

                                                        <Grid item>
                                                            <Button
                                                                type="submit"
                                                                variant="contained"
                                                                color="primary"
                                                                fullWidth
                                                                disabled={isLoading}
                                                                sx={{
                                                                    py: 1,
                                                                    mt: 1,
                                                                    backgroundColor: "#ff4081",
                                                                    transition: "transform 0.2s, background-color 0.3s",
                                                                    "&:hover": {
                                                                        backgroundColor: isLoading ? "#ff4081" : "#e60073",
                                                                        transform: isLoading ? "none" : "scale(1.02)",
                                                                    },
                                                                }}
                                                            >
                                                                {isLoading ? (
                                                                    <Box sx={{
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        justifyContent: "center"
                                                                    }}>
                                                                        <CircularProgress size={24} color="inherit"
                                                                                          sx={{mr: 1}}/>
                                                                        {isSignIn ? "Вхід..." : "Реєстрація..."}
                                                                    </Box>
                                                                ) : isSignIn ? "Увійти" : "Зареєструватися"}
                                                            </Button>
                                                        </Grid>

                                                        <Slide in={!isAnimating} direction="up" timeout={900}>
                                                            <Grid item>
                                                                <Button
                                                                    variant="outlined"
                                                                    fullWidth
                                                                    disabled={isLoading}
                                                                    sx={{
                                                                        py: 1,
                                                                        mt: 1,
                                                                        borderColor: "#ff4081",
                                                                        color: "#ff4081",
                                                                        transition: "all 0.3s",
                                                                        "&:hover": {
                                                                            borderColor: isLoading ? "#ff4081" : "#e60073",
                                                                            color: isLoading ? "#ff4081" : "#e60073",
                                                                            transform: isLoading ? "none" : "translateY(-2px)",
                                                                        },
                                                                    }}
                                                                    onClick={() => toggleForm(resetForm)}
                                                                >
                                                                    {isSignIn ? "Реєстрація" : "Увійти"}
                                                                </Button>
                                                            </Grid>
                                                        </Slide>

                                                        <Grid item>
                                                            <Button
                                                                variant="contained"
                                                                color="error"
                                                                fullWidth
                                                                disabled={isLoading}
                                                                sx={{
                                                                    py: 1,
                                                                    mt: 1,
                                                                    backgroundColor: "#db4437",
                                                                    transition: "all 0.3s",
                                                                    "&:hover": {
                                                                        backgroundColor: isLoading ? "#db4437" : "#c1351d",
                                                                        transform: isLoading ? "none" : "scale(1.02)",
                                                                    },
                                                                }}
                                                                startIcon={isLoading ?
                                                                    <CircularProgress size={24} color="inherit"/> :
                                                                    <Google/>}
                                                                onClick={() => handleSocialLogin("google")}
                                                            >
                                                                Увійти з Google
                                                            </Button>
                                                        </Grid>

                                                        <Grid item>
                                                            <Button
                                                                variant="contained"
                                                                color="secondary"
                                                                fullWidth
                                                                disabled={isLoading}
                                                                sx={{
                                                                    py: 1,
                                                                    mt: 1,
                                                                    backgroundColor: "#24292f",
                                                                    transition: "all 0.3s",
                                                                    "&:hover": {
                                                                        backgroundColor: isLoading ? "#24292f" : "#181a1b",
                                                                        transform: isLoading ? "none" : "scale(1.02)",
                                                                    },
                                                                }}
                                                                startIcon={isLoading ?
                                                                    <CircularProgress size={24} color="inherit"/> :
                                                                    <GitHub/>}
                                                                onClick={() => handleSocialLogin("github")}
                                                            >
                                                                Увійти з GitHub
                                                            </Button>
                                                        </Grid>
                                                    </Grid>
                                                </Form>
                                            )}
                                        </Formik>
                                    </Box>
                                </Collapse>
                            </Box>
                        </Box>
                    </Box>
                </Fade>
            </Modal>
        </>
    );
};

export default AuthModal;
