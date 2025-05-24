import React from "react";
import { Sidebar } from "primereact/sidebar";
import { Button } from "primereact/button";

export const SidebarComponent = ({ visible, onHide }) => {
    return (
        <Sidebar
            visible={visible}
            onHide={onHide}
            className="bg-white shadow-lg p-2 w-[70%]"
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold font-montserrat text-blue-800">SKINGRAM</h2>
                    <Button icon="pi pi-times" onClick={onHide} className="p-button-rounded p-button-danger" />
                </div>
            }
        >
            <ul className="space-y-4">
                <li>
                    <span className="text-blue-800 cursor-pointer hover:underline transition duration-200 font-montserrat">Home</span>
                </li>
                <li>
                    <span className="text-blue-800 cursor-pointer hover:underline transition duration-200 font-montserrat">Technology</span>
                </li>
                <li>
                    <span className="text-blue-800 cursor-pointer hover:underline transition duration-200 font-montserrat">Color Intelligence Platform</span>
                </li>
            </ul>
        </Sidebar>
    );
};

export default SidebarComponent;
