import React, { useState } from "react";
import { Button, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import SearchModal from "@/Components/Social/SearchModal.jsx";

const Search = ({ isMobile }) => {
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    return (
        <>
            {/* Кнопка для відкриття пошуку */}
            <Button
                onClick={handleOpen}
                sx={{
                    backgroundColor: "#1b1222",
                    color: "#d3d3d3",
                    textTransform: "none",
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: isMobile ? "center" : "flex-start",
                    gap: isMobile ? "0" : "8px",
                    borderRadius: "6px",
                    border: "1px solid #333",
                    padding: isMobile ? "0" : "6px 12px",
                    width: isMobile ? "42px" : "180px",
                    height: isMobile ? "36px" : "auto",
                    minWidth: "36px",
                    transition: "width 0.15s ease",
                    transformOrigin: "100% center",
                    '&:hover': {
                        backgroundColor: "#2a1b33",
                        width: isMobile ? "42px" : "220px",
                    },
                }}
            >
                <SearchIcon sx={{ fontSize: 16 }} />
                {!isMobile && (
                    <Typography sx={{ fontSize: "14px", fontWeight: "normal" }}>
                        Пошук...
                    </Typography>
                )}
            </Button>

            {/* Модальне вікно пошуку */}
            <SearchModal open={open} handleClose={handleClose} />
        </>
    );
};

export default Search;
