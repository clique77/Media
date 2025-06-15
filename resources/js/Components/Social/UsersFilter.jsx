import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Box,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Paper,
    InputAdornment,
    RadioGroup,
    FormControlLabel,
    Radio,
} from '@mui/material';
import {
    Person,
    Public,
    OnlinePrediction,
    Description,
    Sort,
    Wc,
} from '@mui/icons-material';

const UsersFilter = ({ isMobile, onClose, onApplyFilters }) => {
    const [username, setUsername] = useState('');
    const [country, setCountry] = useState('');
    const [isOnline, setIsOnline] = useState('');
    const [gender, setGender] = useState('');
    const [biography, setBiography] = useState('');
    const [sortBy, setSortBy] = useState('');

    const countries = ['Україна', 'Польща', 'Німеччина', 'Франція', 'Іспанія'];

    const handleApply = () => {
        const queryParams = [];

        if (username) queryParams.push(`filter[username]=${encodeURIComponent(username)}`);
        if (country) queryParams.push(`filter[country]=${encodeURIComponent(country)}`);
        if (isOnline) queryParams.push(`filter[is_online]=${isOnline}`);
        if (gender) queryParams.push(`filter[gender]=${gender}`);
        if (biography) queryParams.push(`filter[biography]=${encodeURIComponent(biography)}`);
        if (sortBy) {
            // Додаємо префікс "-" для зворотного сортування, якщо sortBy починається з "-"
            const sortValue = sortBy.startsWith('-') ? sortBy : `-${sortBy}`;
            queryParams.push(`sort=${sortValue}`);
        }

        const queryString = queryParams.join('&');
        onApplyFilters(queryString);

        if (isMobile) onClose();
    };

    const handleReset = () => {
        setUsername('');
        setCountry('');
        setIsOnline('');
        setGender('');
        setBiography('');
        setSortBy('');
        onApplyFilters('');
        if (isMobile) onClose();
    };

    const inputStyles = {
        '& .MuiInputBase-root': {
            height: '36px',
            fontSize: '0.875rem',
        },
        '& .MuiInputBase-input': {
            color: '#e0e0e0',
            padding: '8px 12px',
        },
        '& .MuiOutlinedInput-root': {
            '& fieldset': {
                borderColor: 'rgba(156, 39, 176, 0.5)',
            },
            '&:hover fieldset': {
                borderColor: '#9c27b0',
            },
            '&.Mui-focused fieldset': {
                borderColor: '#ff4081',
            },
        },
        transition: 'all 0.2s ease',
    };

    const selectStyles = {
        '& .MuiInputBase-root': {
            height: '36px',
            color: '#e0e0e0',
            backgroundColor: 'rgba(30, 30, 40, 0.5)',
            borderRadius: '4px',
        },
        '& .MuiSelect-select': {
            color: '#e0e0e0',
            fontSize: '0.875rem',
            padding: '8px 12px 8px 36px',
            display: 'flex',
            alignItems: 'center',
        },
        '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(156, 39, 176, 0.5)',
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#9c27b0',
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#ff4081',
        },
        '& .MuiSelect-icon': {
            color: '#e0e0e0',
            right: '8px',
        },
        '& .MuiInputAdornment-positionStart': {
            marginRight: '0',
            position: 'absolute',
            left: '10px',
            zIndex: 1,
        },
        transition: 'all 0.2s ease',
    };

    const menuProps = {
        PaperProps: {
            sx: {
                bgcolor: 'rgba(10, 10, 15, 0.95)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(156, 39, 176, 0.2)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                '& .MuiMenuItem-root': {
                    color: '#e0e0e0',
                    fontSize: '0.875rem',
                    '&:hover': {
                        backgroundColor: 'rgba(156, 39, 176, 0.1)',
                    },
                    '&.Mui-selected': {
                        backgroundColor: 'rgba(156, 39, 176, 0.2)',
                        '&:hover': {
                            backgroundColor: 'rgba(156, 39, 176, 0.3)',
                        },
                    },
                },
            },
        },
    };

    const labelStyles = {
        color: '#b0b0b0',
        fontSize: '0.875rem',
        mb: 0.5,
        position: 'static',
        transform: 'none',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Paper
                sx={{
                    p: 2,
                    backgroundColor: 'rgba(10, 10, 15, 0.9)',
                    backdropFilter: 'blur(12px)',
                    borderRadius: 2,
                    border: '1px solid rgba(156, 39, 176, 0.2)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                }}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: 0.1 }}
                    >
                        <InputLabel sx={labelStyles}>Ім'я користувача</InputLabel>
                        <TextField
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            fullWidth
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start" sx={{ mr: 1 }}>
                                        <Person sx={{ color: '#9c27b0', fontSize: 20 }} />
                                    </InputAdornment>
                                ),
                            }}
                            sx={inputStyles}
                        />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: 0.2 }}
                    >
                        <FormControl fullWidth>
                            <InputLabel sx={labelStyles}>Країна</InputLabel>
                            <Select
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                MenuProps={menuProps}
                                sx={selectStyles}
                                startAdornment={
                                    <InputAdornment position="start">
                                        <Public sx={{ color: '#9c27b0', fontSize: 20 }} />
                                    </InputAdornment>
                                }
                            >
                                <MenuItem value="">Усі країни</MenuItem>
                                {countries.map((c) => (
                                    <MenuItem key={c} value={c}>
                                        {c}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: 0.3 }}
                    >
                        <FormControl fullWidth>
                            <InputLabel sx={labelStyles}>Статус</InputLabel>
                            <Select
                                value={isOnline}
                                onChange={(e) => setIsOnline(e.target.value)}
                                MenuProps={menuProps}
                                sx={selectStyles}
                                startAdornment={
                                    <InputAdornment position="start">
                                        <OnlinePrediction sx={{ color: '#9c27b0', fontSize: 20 }} />
                                    </InputAdornment>
                                }
                            >
                                <MenuItem value="">Усі</MenuItem>
                                <MenuItem value="true">Онлайн</MenuItem>
                                <MenuItem value="false">Офлайн</MenuItem>
                            </Select>
                        </FormControl>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: 0.4 }}
                    >
                        <FormControl component="fieldset" fullWidth>
                            <InputLabel sx={labelStyles}>Стать</InputLabel>
                            <RadioGroup
                                value={gender}
                                onChange={(e) => setGender(e.target.value)}
                                sx={{
                                    flexDirection: 'row',
                                    flexWrap: 'wrap',
                                    gap: 1,
                                    minHeight: '36px',
                                    alignItems: 'flex-start',
                                    pb: 1,
                                }}
                            >
                                <FormControlLabel
                                    value=""
                                    control={
                                        <Radio
                                            sx={{
                                                color: '#b0b0b0',
                                                '&.Mui-checked': { color: '#9c27b0' },
                                                '& .MuiSvgIcon-root': { fontSize: 20 },
                                            }}
                                        />
                                    }
                                    label="Усі"
                                    sx={{
                                        color: '#e0e0e0',
                                        '& .MuiTypography-root': { fontSize: '0.875rem' },
                                        m: 0,
                                    }}
                                />
                                <FormControlLabel
                                    value="female"
                                    control={
                                        <Radio
                                            sx={{
                                                color: '#b0b0b0',
                                                '&.Mui-checked': { color: '#9c27b0' },
                                                '& .MuiSvgIcon-root': { fontSize: 20 },
                                            }}
                                        />
                                    }
                                    label="Жінка"
                                    sx={{
                                        color: '#e0e0e0',
                                        '& .MuiTypography-root': { fontSize: '0.875rem' },
                                        m: 0,
                                    }}
                                />
                                <FormControlLabel
                                    value="male"
                                    control={
                                        <Radio
                                            sx={{
                                                color: '#b0b0b0',
                                                '&.Mui-checked': { color: '#9c27b0' },
                                                '& .MuiSvgIcon-root': { fontSize: 20 },
                                            }}
                                        />
                                    }
                                    label="Чоловік"
                                    sx={{
                                        color: '#e0e0e0',
                                        '& .MuiTypography-root': { fontSize: '0.875rem' },
                                        m: 0,
                                    }}
                                />
                            </RadioGroup>
                        </FormControl>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: 0.5 }}
                    >
                        <InputLabel sx={labelStyles}>Біографія</InputLabel>
                        <TextField
                            value={biography}
                            onChange={(e) => setBiography(e.target.value)}
                            fullWidth
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start" sx={{ mr: 1 }}>
                                        <Description sx={{ color: '#9c27b0', fontSize: 20 }} />
                                    </InputAdornment>
                                ),
                            }}
                            sx={inputStyles}
                        />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: 0.6 }}
                    >
                        <FormControl fullWidth>
                            <InputLabel sx={labelStyles}>Сортування</InputLabel>
                            <Select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                MenuProps={menuProps}
                                sx={selectStyles}
                                startAdornment={
                                    <InputAdornment position="start">
                                        <Sort sx={{ color: '#9c27b0', fontSize: 20 }} />
                                    </InputAdornment>
                                }
                            >
                                <MenuItem value="">Без сортування</MenuItem>
                                <MenuItem value="username">За ім'ям (А-Я)</MenuItem>
                                <MenuItem value="-username">За ім'ям (Я-А)</MenuItem>
                                <MenuItem value="last_seen_at">За активністю (нові)</MenuItem>
                                <MenuItem value="-last_seen_at">За активністю (старі)</MenuItem>
                            </Select>
                        </FormControl>
                    </motion.div>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                        <Button
                            variant="contained"
                            onClick={handleApply}
                            sx={{
                                background: 'linear-gradient(135deg, rgba(74, 20, 140, 0.9), rgba(40, 26, 100, 0.9))',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, rgba(106, 27, 154, 1), rgba(61, 40, 143, 1))',
                                    boxShadow: '0 0 15px rgba(74, 20, 140, 0.5)',
                                },
                                height: '36px',
                                fontSize: '0.875rem',
                                px: 2,
                                borderRadius: '12px',
                                textTransform: 'none',
                                transition: 'all 0.2s ease',
                            }}
                        >
                            Застосувати
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={handleReset}
                            sx={{
                                color: '#e0e0e0',
                                borderColor: 'rgba(156, 39, 176, 0.5)',
                                '&:hover': {
                                    borderColor: '#9c27b0',
                                    backgroundColor: 'rgba(156, 39, 176, 0.1)',
                                    boxShadow: '0 0 10px rgba(156, 39, 176, 0.3)',
                                },
                                height: '36px',
                                fontSize: '0.875rem',
                                px: 2,
                                borderRadius: '12px',
                                textTransform: 'none',
                                transition: 'all 0.2s ease',
                            }}
                        >
                            Скинути
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </motion.div>
    );
};

export default UsersFilter;
