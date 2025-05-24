import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Header = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const handleNavigation = () => {
        navigate("/");
    };

    const toggleSidebar = () => {
        setIsOpen((prev) => !prev);
    };

    return (
        <header >
        

        </header>
    );
};

export default Header;
