import Navbar from '@/Components/Common/Navbar.jsx';
import { useAuthModal } from "@/Components/Auth/AuthModalProvider.jsx";
import { useEffect } from "react";
import { setShowModal } from "@/config/axios.js";

const AppLayout = ({ children }) => {
    const { showModal } = useAuthModal();

    useEffect(() => {
        setShowModal(showModal);
    }, [showModal]);

    return (
        <>
            <Navbar />
            <main>{children}</main>
        </>
    );
};

export default AppLayout;
