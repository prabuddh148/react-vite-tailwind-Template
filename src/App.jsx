import { lazy, Suspense, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Bounce, ToastContainer } from "react-toastify";
import { ConfirmDialog } from "primereact/confirmdialog";

const Home = lazy(() => import("./features/home/pages/home"));
const Layout = lazy(() => import("./layouts/index"));

function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
}

function App() {
    return (
        <BrowserRouter>
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnHover theme="colored" transition={Bounce} />
            <ConfirmDialog
                icon={null}
                pt={{
                    message: { className: "min-w-[320px] m-0" },
                    icon: { className: "hidden" },
                    acceptButton: { className: "px-3 py-2 w-fit" },
                }}
            />
            <Suspense>
                <ScrollToTop />
                <Routes>
                    <Route path="/" element={<Layout />}>
                        <Route index element={<Home />} />
                        
                    </Route>
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
}

export default App;
