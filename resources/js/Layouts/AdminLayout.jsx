import { Head, Link, usePage } from "@inertiajs/react";
import React, { useState } from "react";
import { Toaster } from "react-hot-toast";
import { AiOutlineMenu, AiOutlineClose, AiFillDashboard, AiOutlineDown, AiOutlineRight } from "react-icons/ai";
import { FaRegUser, FaUsers, FaCriticalRole, FaBuilding } from "react-icons/fa";
import { GrUserExpert } from "react-icons/gr";
import { IoIosLogOut } from "react-icons/io";
import { MdInventory, MdPolicy } from "react-icons/md";
import { PiBasketFill } from "react-icons/pi";
import { BiSolidPurchaseTag, BiSolidReport } from "react-icons/bi";

const AdminLayout = ({ children, title }) => {
    const { component } = usePage();
    const { auth, appName } = usePage().props;

    const [nav, setNav] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [openSubMenu, setOpenSubMenu] = useState(null); 

    const currentYear = new Date().getFullYear();
    const startYear = 2024;

    // Logika untuk menentukan tahun yang akan ditampilkan
    const displayYear = currentYear === startYear 
        ? `${startYear}` 
        : `${startYear} - ${currentYear}`;

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const handleSubMenuToggle = (index) => {
        setOpenSubMenu(openSubMenu === index ? null : index); 
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
            link: "/user"  
        },
        {
            icon: <MdPolicy size={25} className="mr-1" />,
            text: "Authority",
            componentLink: "Authority/Index",
            link: "/authority",
        },        
        {
            icon: <BiSolidPurchaseTag size={25} className="mr-1" />,
            text: "Purchasing",
            componentLink: "Order/Index;Purchase/Index",
            link: "#",
            subMenu: [
                { text: "Order", link: "/order", subComponentLink: "Order/Index" },           
                { text: "Purchase", link: "/purchase", subComponentLink : "Purchase/Index" },                     
            ],            
        },             
        {
            icon: <PiBasketFill size={25} className="mr-1" />,
            text: "Sales",
            componentLink: "Sales/Index;PriceCategory/Index;Customer/Index;Transaction/Index",
            link: "#",
            subMenu: [
                { text: "Transaction", link: "/transaction", subComponentLink : "Transaction/Index" },            
                { text: "Price Category", link: "/price-category", subComponentLink : "PriceCategory/Index" },
                { text: "Customer", link: "/customer", subComponentLink : "Customer/Index" },                
            ],            
        },         
        {
            icon: <MdInventory size={25} className="mr-1" />,
            text: "Inventories",
            componentLink: "Stock/Index;Unit/Index;Brand/Index;Product/Index;ProductCategory/Index;Supplier/Index;Distribution/Index",
            link: "#",
            subMenu: [
                { text: "Stock", link: "/stock", subComponentLink: "Stock/Index" },
                { text: "Distribution", link: "/distribution", subComponentLink : "Distribution/Index" },                
                { text: "Unit", link: "/unit", subComponentLink : "Unit/Index" },
                { text: "Brand", link: "/brand", subComponentLink : "Brand/Index"  },                
                { text: "Product Category", link: "/product-category", subComponentLink: "ProductCategory/Index" },
                { text: "Product", link: "/product", subComponentLink : "Product/Index"  },                
                { text: "Supplier", link: "/supplier", subComponentLink : "Supplier/Index"  },                    
            ],            
        },
        {
            icon: <FaBuilding size={25} className="mr-1" />,
            text: "Company Master",
            componentLink: "StoreBranch/Index;",
            link: "#",
            subMenu: [
                { text: "Store Branch", link: "/store-branch", subComponentLink : "StoreBranch/Index" },              
            ],            
        },        
        {
            icon: <BiSolidReport size={25}  className="mr-1" />,
            text: "Report",
            componentLink: "Report/Purchase/Index;Report/Transaction/List",
            link: "#",
            subMenu: [
                { text: "Purchase", link: "/purchase-report", subComponentLink: "Report/Purchase/Index" },             
                { text: "Transaction", link: "/transaction-report", subComponentLink : "Report/Transaction/List" },                    
            ],            
        },           
    ];
    // console.log(component);
    return (
        <>
            <div className="fixed top-0 left-0 w-full max-w-full mx-auto flex justify-between items-center p-4 shadow-sm bg-blue-300 z-50  print:hidden">
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
                <div className={nav ? "fixed top-0 left-0 w-[300px] h-screen bg-blue-50 z-10 duration-300 overflow-y-auto" : "fixed top-0 left-[-100%] w-[300px] h-screen bg-white z-10 duration-300"}>
                    <AiOutlineClose onClick={() => setNav(!nav)} size={30} className="absolute right-4 top-4 cursor-pointer" />
                    <h2 className="text-2xl p-4">
                        <span className="font-bold">{appName}</span>
                    </h2>
                    <nav>
                        <ul className="flex flex-col text-gray-800">
                            {menuItems.map(({ icon, text, componentLink, link, subMenu }, index) => {
                                const componentsArray = componentLink.split(";");
                                return (
                                    <React.Fragment key={index}>
                                        <li
                                            className={`py-2 text-xl flex justify-between items-center cursor-pointer w-[80%] rounded-full mx-auto hover:text-white hover:bg-black ${componentsArray.includes(component) ? "font-semibold text-blue-500" : ""
                                                }`}
                                            onClick={() => handleSubMenuToggle(index)}
                                        >
                                            {link === "#" &&
                                                <div className="flex items-center ml-1">
                                                    {icon} {text}
                                                </div>
                                            }
                                            {link !== "#" &&
                                                <Link href={link} className="flex items-center ml-1">
                                                    {icon} {text}
                                                </Link>
                                            }
                                            {subMenu && (
                                                <div className="mr-2">
                                                    {openSubMenu === index ? (
                                                        <AiOutlineDown size={20} />
                                                    ) : (
                                                        <AiOutlineRight size={20} />
                                                    )}
                                                </div>
                                            )}
                                        </li>
                                        {subMenu && (openSubMenu === index || componentLink.includes(component)) && (
                                            <ul className="ml-8">
                                                {subMenu.map((subItem, subIndex) => (
                                                
                                                    <li key={subIndex} className={`py-1 text-xl flex cursor-pointer w-[80%] rounded-full mx-auto hover:text-white hover:bg-black  ${subItem.subComponentLink === component ? "font-extrabold text-blue-400" : ""
                                                        }`}>
                                                        <Link href={subItem.link} className="flex items-center ml-1">
                                                            {subItem.text}
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </React.Fragment>
                                )
                            })}
                        </ul>
                    </nav>
                </div>
            </div>

            <div className="flex flex-col min-h-screen mt-10">
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
                    <div className="container mx-auto bg-white border border-emerald-100 p-4">                    
                        <div className="px-3 py-3">{children}</div>
                    </div>
                </main>

                <footer className="bg-blue-100 text-black py-4 mt-2  print:hidden">
                    <div className="container mx-auto text-center">
                        <p className="text-sm">
                            &copy; {displayYear}  WAn. All rights reserved.
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
};

export default AdminLayout;
