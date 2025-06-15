import React, { createContext, useContext, useState } from "react";
import AuthModal from "./AuthModal";

const AuthModalContext = createContext();

export const useAuthModal = () => useContext(AuthModalContext);

export const AuthModalProvider = ({ children }) => {
    const [open, setOpen] = useState(false);

    const showModal = () => setOpen(true);
    const hideModal = () => setOpen(false);

    return (
        <AuthModalContext.Provider value={{ showModal, hideModal }}>
            {children}
            <AuthModal open={open} handleClose={hideModal} />
        </AuthModalContext.Provider>
    );
};
