import React, { useState } from 'react';
import { Box, Typography, Button, IconButton, Dialog, DialogContent, TextField, MenuItem, Avatar } from '@mui/material';
import { Edit, Close, Upload, Delete, Person, Public, Cake, Wc } from '@mui/icons-material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const quillModules = {
    toolbar: [
        ['bold', 'italic', 'underline'],
        ['link', 'blockquote', 'code-block'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['clean'],
    ],
};

const quillFormats = [
    'header',
    'bold',
    'italic',
    'underline',
    'link',
    'blockquote',
    'code-block',
    'list',
    'bullet',
];

const EditProfileDialog = ({ open, onClose, editForm, setEditForm, handleEditSave, isMobile, isTablet, updateUserMutation }) => {
    const [avatarPreview, setAvatarPreview] = useState(editForm.avatar);

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
                setEditForm({ ...editForm, avatar: file });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAvatarRemove = () => {
        setAvatarPreview(`https://i.pravatar.cc/150?img=${editForm.username}`);
        setEditForm({ ...editForm, avatar: '' });
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth={isMobile ? 'xs' : isTablet ? 'sm' : 'md'}
            fullWidth
            sx={{
                '& .MuiDialog-paper': {
                    backgroundColor: 'rgba(10, 10, 15, 0.9)',
                    border: '1px solid transparent',
                    borderImage: 'linear-gradient(to right, #9c27b0, rgba(156, 39, 176, 0.3)) 1',
                    borderRadius: 2,
                    backdropFilter: 'blur(15px)',
                    color: '#e0e0e0',
                },
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
                <Typography variant="h6" sx={{ color: '#ffffff' }}>
                    Редагувати профіль
                </Typography>
                <IconButton onClick={onClose} sx={{ color: '#b0b0b0' }}>
                    <Close />
                </IconButton>
            </Box>
            <DialogContent sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
                <TextField
                    label="Ім'я користувача"
                    value={editForm.username}
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                    fullWidth
                    sx={{ mb: 2, input: { color: '#e0e0e0' }, label: { color: '#b0b0b0' } }}
                    InputProps={{ style: { borderColor: 'rgba(156, 39, 176, 0.3)' }, startAdornment: <Edit sx={{ color: '#9c27b0', mr: 1 }} /> }}
                />
                <TextField
                    label="Ім'я"
                    value={editForm.first_name}
                    onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                    fullWidth
                    sx={{ mb: 2, input: { color: '#e0e0e0' }, label: { color: '#b0b0b0' } }}
                    InputProps={{ style: { borderColor: 'rgba(156, 39, 176, 0.3)' }, startAdornment: <Person sx={{ color: '#9c27b0', mr: 1 }} /> }}
                />
                <TextField
                    label="Прізвище"
                    value={editForm.last_name}
                    onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                    fullWidth
                    sx={{ mb: 2, input: { color: '#e0e0e0' }, label: { color: '#b0b0b0' } }}
                    InputProps={{ style: { borderColor: 'rgba(156, 39, 176, 0.3)' }, startAdornment: <Person sx={{ color: '#9c27b0', mr: 1 }} /> }}
                />
                <Typography variant="body2" sx={{ color: '#b0b0b0', mb: 1 }}>
                    Біографія
                </Typography>
                <ReactQuill
                    value={editForm.biography}
                    onChange={(value) => setEditForm({ ...editForm, biography: value })}
                    modules={quillModules}
                    formats={quillFormats}
                    theme="snow"
                    style={{ marginBottom: '16px', background: '#0a0a0f', color: '#e0e0e0' }}
                />
                <TextField
                    label="Країна"
                    value={editForm.country}
                    onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                    fullWidth
                    sx={{ mb: 2, input: { color: '#e0e0e0' }, label: { color: '#b0b0b0' } }}
                    InputProps={{ style: { borderColor: 'rgba(156, 39, 176, 0.3)' }, startAdornment: <Public sx={{ color: '#9c27b0', mr: 1 }} /> }}
                />
                <TextField
                    label="День народження"
                    type="date"
                    value={editForm.birthday}
                    onChange={(e) => setEditForm({ ...editForm, birthday: e.target.value })}
                    fullWidth
                    sx={{ mb: 2, input: { color: '#e0e0e0' }, label: { color: '#b0b0b0' } }}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{ style: { borderColor: 'rgba(156, 39, 176, 0.3)' }, startAdornment: <Cake sx={{ color: '#9c27b0', mr: 1 }} /> }}
                />
                <TextField
                    label="Стать"
                    select
                    value={editForm.gender}
                    onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                    fullWidth
                    sx={{
                        mb: 2,
                        input: { color: '#e0e0e0' },
                        label: { color: '#b0b0b0' },
                        '& .MuiSelect-select': { color: '#e0e0e0' },
                    }}
                    InputProps={{ style: { borderColor: 'rgba(156, 39, 176, 0.3)' }, startAdornment: <Wc sx={{ color: '#9c27b0', mr: 1 }} /> }}
                    SelectProps={{
                        MenuProps: {
                            PaperProps: {
                                sx: {
                                    bgcolor: '#0a0a0f',
                                    '& .MuiMenuItem-root': {
                                        color: '#e0e0e0',
                                        '&:hover': { bgcolor: 'rgba(156, 39, 176, 0.1)' },
                                        '&.Mui-selected': { bgcolor: 'rgba(156, 39, 176, 0.2)', color: '#fff' },
                                    },
                                },
                            },
                        },
                    }}
                >
                    <MenuItem value="">Не вказано</MenuItem>
                    <MenuItem value="male">Чоловік</MenuItem>
                    <MenuItem value="female">Жінка</MenuItem>
                    <MenuItem value="other">Інше</MenuItem>
                </TextField>
                <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ color: '#b0b0b0', mb: 1 }}>
                        Аватар
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                        {avatarPreview && (
                            <Avatar
                                src={avatarPreview}
                                alt="Прев'ю аватарки"
                                sx={{ width: 60, height: 60, border: '1px solid rgba(156, 39, 176, 0.3)' }}
                            />
                        )}
                        <Button
                            variant="outlined"
                            component="label"
                            startIcon={<Upload />}
                            sx={{
                                color: '#e0e0e0',
                                borderColor: 'rgba(156, 39, 176, 0.3)',
                                '&:hover': { borderColor: '#9c27b0', bgcolor: 'rgba(156, 39, 176, 0.1)' },
                            }}
                        >
                            Вибрати файл
                            <input
                                type="file"
                                accept="image/*"
                                hidden
                                onChange={handleAvatarChange}
                            />
                        </Button>
                        {avatarPreview && (
                            <Button
                                variant="outlined"
                                startIcon={<Delete />}
                                onClick={handleAvatarRemove}
                                sx={{
                                    color: '#ff4081',
                                    borderColor: 'rgba(255, 64, 129, 0.3)',
                                    '&:hover': { borderColor: '#ff4081', bgcolor: 'rgba(255, 64, 129, 0.1)' },
                                }}
                            >
                                Видалити
                            </Button>
                        )}
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button
                        variant="contained"
                        onClick={handleEditSave}
                        disabled={updateUserMutation.isLoading || !editForm.username.trim()}
                        sx={{ bgcolor: '#9c27b0', '&:hover': { bgcolor: '#7b1fa2' } }}
                    >
                        Зберегти
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={onClose}
                        sx={{ color: '#b0b0b0', borderColor: 'rgba(156, 39, 176, 0.3)' }}
                    >
                        Скасувати
                    </Button>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default EditProfileDialog;
