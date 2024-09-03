import { Head, Link, usePage } from "@inertiajs/react";
import React, { useState } from "react";
import { Toaster } from "react-hot-toast";
import { AiOutlineMenu, AiOutlineClose, AiFillDashboard } from "react-icons/ai";
import { FaRegUser, FaUsers, FaCriticalRole } from "react-icons/fa";
import { GrUserExpert } from "react-icons/gr";
import { IoIosLogOut } from "react-icons/io";
import { MdPolicy } from "react-icons/md";

const AdminLayout = ({ children, title }) => {
    const { component } = usePage();
    const { auth, appName } = usePage().props;

    const [nav, setNav] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const menuItems = [
        {
            icon: <AiFillDashboard size={25} className="mr-1" />,
            text: "Dashboard",
            componentLink: "Dashboard",
            link: "/dashboard",
        },
        {
            icon: <FaUsers size={25} className="mr-1" />,
            text: "User",
            componentLink: "User/Index",
            link: "/user",
        },
        {
            icon: <MdPolicy size={25} className="mr-1" />,
            text: "Authority",
            componentLink: "Authority/Index",
            link: "/authority",
        },        
    ];
    // console.log(component);
    return (
        <>
            <div className="max-w-[1640px] mx-auto flex justify-between items-center p-4 shadow-sm bg-blue-300">
                {/* Left side */}
                <div className="flex items-center">
                    <div
                        onClick={() => setNav(!nav)}
                        className="cursor-pointer"
                    >
                        <AiOutlineMenu size={30} />
                    </div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl px-2">
                        <span className="font-bold">{appName}</span>
                    </h1>
                </div>

                <button
                    className="bg-black text-white flex items-center py-2 rounded-full border border-black px-5"
                    onClick={toggleDropdown}
                >
                    <FaRegUser size={20} />
                </button>
                {isOpen && (
                    <div
                        className="origin-top-right absolute right-0 mt-40 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                        role="menu"
                        aria-orientation="vertical"
                        aria-labelledby="options-menu"
                    >
                        <div className="py-1" role="none">
                            <a
                                href="#"
                                className="text-gray-700 flex items-center px-4 py-2 text-sm hover:bg-gray-100"
                                role="menuitem"
                            >
                                <GrUserExpert className="mr-2" />{" "}
                                {auth.user.name}
                            </a>
                            <a
                                href="#"
                                className="text-gray-700 flex items-center px-4 py-2 text-sm hover:bg-gray-100"
                                role="menuitem"
                            >
                                <FaCriticalRole className="mr-2" />{" "}
                                {auth.user.role}
                            </a>
                            <a
                                href="/logout"
                                className="text-gray-700 flex items-center px-4 py-2 text-sm hover:bg-gray-100"
                                role="menuitem"
                            >
                                <IoIosLogOut className="mr-2" /> Logout
                            </a>
                        </div>
                    </div>
                )}
                {/* Mobile Menu */}
                {/* Overlay */}
                {nav ? (
                    <div className="bg-black/80 fixed w-full h-screen z-10 top-0 left-0"></div>
                ) : (
                    ""
                )}

                {/* Side drawer menu */}
                <div
                    className={
                        nav
                            ? "fixed top-0 left-0 w-[300px] h-screen bg-blue-50 z-10 duration-300"
                            : "fixed top-0 left-[-100%] w-[300px] h-screen bg-white z-10 duration-300"
                    }
                >
                    <AiOutlineClose
                        onClick={() => setNav(!nav)}
                        size={30}
                        className="absolute right-4 top-4 cursor-pointer"
                    />
                    <h2 className="text-2xl p-4">
                        <span className="font-bold">{appName}</span>
                    </h2>
                    <nav>
                        <ul className="flex flex-col text-gray-800">
                            {menuItems.map(
                                (
                                    { icon, text, componentLink, link },
                                    index
                                ) => {
                                    return (
                                        <div key={index} className="py-2">
                                            <li
                                                className={`text-xl flex cursor-pointer w-[80%] rounded-full mx-auto hover:text-white hover:bg-black ${
                                                    component == componentLink
                                                        ? "font-semibold text-blue-500"
                                                        : ""
                                                }`}
                                            >
                                                <Link
                                                    href={link}
                                                    className="flex items-center ml-1"
                                                >
                                                    {icon} {text}
                                                </Link>
                                            </li>
                                        </div>
                                    );
                                }
                            )}
                        </ul>
                    </nav>
                </div>
            </div>

            <div className="flex flex-col min-h-screen">
                <div>
                    <Toaster />
                </div>
                <Head title={title} />

                <main className="mt-10 flex-grow">
                    <div className="container mx-auto bg-blue-100 p-4">     
                        <div className="px-3 py-3 text-2xl font-bold">
                            {title}
                        </div>
                    </div>                        
                    <div className="container mx-auto bg-white border border-e-emerald-950 p-4">                    
                        <div className="px-3 py-3 ">{children}</div>
                    </div>
                </main>

                <footer className="bg-blue-100 text-black py-4 mt-2">
                    <div className="container mx-auto text-center">
                        <p className="text-sm">
                            &copy; 2024 WAn. All rights reserved.
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
};

export default AdminLayout;
