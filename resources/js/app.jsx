import './bootstrap';
import React from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import {routes} from './routes';
import {AuthProvider} from '@/Components/Auth/AuthProvider';
import {AuthModalProvider} from "@/Components/Auth/AuthModalProvider.jsx";
import AppLayout from "@/layouts/AppLayout.jsx";
import {ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import {OnlineUsersProvider} from "@/Components/Social/OnlineUsersProvider.jsx";
import {QueryClient, QueryClientProvider} from "react-query";
import NotFoundPage from "@/Pages/NotFoundPage.jsx";

const queryClient = new QueryClient();

const Root = () => (
    <BrowserRouter>
        <AuthProvider>
            <AuthModalProvider>
                <OnlineUsersProvider>
                    <QueryClientProvider client={queryClient}>
                    <AppLayout>
                        <ToastContainer
                            position="top-center"
                            autoClose={3500}
                            hideProgressBar={false}
                            newestOnTop={false}
                            closeOnClick
                            pauseOnFocusLoss
                            draggable
                            pauseOnHover
                            theme="dark"
                        />
                        <Routes>
                            {routes.map(({path, element}, index) => (
                                <Route key={index} path={path} element={element}/>
                            ))}
                            <Route path="*" element={<NotFoundPage />} />
                        </Routes>
                    </AppLayout>
                </QueryClientProvider>
            </OnlineUsersProvider>
        </AuthModalProvider>
    </AuthProvider>
</BrowserRouter>
)
;

ReactDOM.createRoot(document.getElementById('app')).render(<Root/>);
