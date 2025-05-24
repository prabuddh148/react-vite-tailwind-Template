import Header from "../components/header";
import Footer from "../components/footer";
import { Outlet } from "react-router-dom";

export const Layout = () => {
    return (
        <div>
            <Header />
            <div className="min-h-screen">
                <Outlet />
            </div>
            <Footer />
        </div>
    );
};

export default Layout;
