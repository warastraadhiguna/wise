import AdminLayout from "@/Layouts/AdminLayout";
import React, {  useEffect, useState } from "react";
import { FaChevronRight, FaChevronLeft, FaMoneyBill } from "react-icons/fa";
import Pagination from "@/Components/Pagination";
import SearchingTable from "@/Components/SearchingTable";
import { router,usePage } from '@inertiajs/react';
import toast from "react-hot-toast";

const Index = ({ title, stocks, selectedStock, searchingTextProps, perPageProps, pageProps }) => {
    const { flash} = usePage().props;    
    const [perPage, setPerPage]  = useState(stocks.per_page);
    const [searchingText, setSearchingText] = useState(searchingTextProps);
    const [prices, setPrices] = useState(selectedStock? selectedStock.prices : 0); 
    const [isCollapsed, setIsCollapsed] = useState(selectedStock?.property); //selectedStock?.property =>untuk cek object ada isinya tidak
    const url = window.location.pathname;
    const [isEditNumberInput, setIsEditNumberInput] = useState("");      

    const handleShowPriceForm = (e, productId) => {
        e.preventDefault();
        router.get(`${url}?page=${pageProps}&perPage=${perPageProps}&searchingText=${searchingTextProps}&selectedProductId=${productId}&isCollapsed=false`);         
    };

    const handlePriceChange = (event, index) => {
        const value = event.target.value;

        const isDecimal = /^[0-9]*\.?[0-9]+$/.test(value);
        
        const values = [...prices];
        values[index].value = isDecimal? event.target.value : 0;
        setPrices(values);
    };

    const handleDefaultChange = (selectedIndex) => {
        const updatedPrices = prices.map((price, index) => ({
            ...price,
            is_default: index === selectedIndex ? "1" : "0"
        }));
        setPrices(updatedPrices);
    };    

    const handleSavePrice = (e) => {
        e.preventDefault();
        router.post("product-price-relation", prices, {
            onFinish: () => {
                flash.success = "";
                flash.error = "";
                setIsEditNumberInput("");                     
        }});           
    };

    useEffect(() => {
        flash.success && toast.success(flash.success);
        flash.error && toast.error(flash.error);
    }, [flash]);
    // console.log(isEditNumberInput);
    return (
        <AdminLayout title={title}>
            <div className="flex">
                <div className={`transition-all duration-300 ${isCollapsed ? 'w-full' : 'w-4/5'} pr-4`}>
                    <SearchingTable perPage={perPage} setPerPage={setPerPage} searchingText={ searchingText } setSearchingText={ setSearchingText } />
                    
                    <div className="relative overflow-x-auto">
                        <table className="w-full text-sm text-left rtl:text-right text-black dark:text-gray-400">
                            <thead className="text-xs text-black border-b uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th scope="col" className="px-6 py-3">
                                        No
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        Barcode
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        Name
                                    </th>        
                                    <th scope="col" className="px-6 py-3">
                                        Category
                                    </th>  
                                    <th scope="col" className="px-6 py-3">
                                        Brand
                                    </th>                 
                                    <th scope="col" className="px-6 py-3">
                                        Unit
                                    </th>                              
                                    <th scope="col" className="px-6 py-3">
                                        Note
                                    </th>                         
                                    <th scope="col" className="px-6 py-3">
                                        Quantity
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-center">
                                        #
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {stocks.data.map((stock, i) => (
                                    <tr
                                        key={i}
                                        className={`bg-white border-b dark:bg-gray-800 dark:border-gray-700  ${stock.deleted_at? "line-through bg-yellow-50" : ""}`}
                                    >
                                        <td
                                            scope="row"
                                            className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white "
                                        >
                                            {(stocks.current_page - 1) * stocks.per_page + i + 1}
                                        </td>
                                        <td className="px-6 py-4"> {stock.code}</td>
                                        <td className="px-6 py-4">{stock.name}</td>
                                        <td className="px-6 py-4">{stock.category_name}</td>
                                        <td className="px-6 py-4">{stock.brand_name}</td>
                                        <td className="px-6 py-4">{stock.unit_name}</td>                                
                                        <td className="px-6 py-4">{stock.note}</td>                                      
                                        <td className="px-6 py-4">{Number(stock.quantity).toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <FaMoneyBill
                                                    size={20}
                                                    color={ stock.deleted_at? "#c2bc42" : "green"}
                                                    className="cursor-pointer"
                                                    onClick={(event) => handleShowPriceForm(event,stock.id)}
                                                />   
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <Pagination data={stocks}></Pagination>
                </div>    
                <div className={`transition-all duration-300 ${isCollapsed ? 'hidden' : 'w-1/5'} pl-4 bg-gray-100 p-4 rounded shadow-md`}>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Product Info</h2>
                        <button onClick={() => setIsCollapsed(!isCollapsed)} className="text-gray-600">
                            <FaChevronRight size={20} />
                        </button>
                    </div>
                    {!isCollapsed && selectedStock && selectedStock.lastInfo && (
                        <div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Barcode</label>
                                <input
                                    type="text"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                    value={`${selectedStock.lastInfo.code}`}
                                    disabled
                                />
                            </div>                            
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                <input
                                    type="text"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                    value={`${selectedStock.lastInfo.name} (${selectedStock.lastInfo.unit_name})`}
                                    disabled
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Last Price</label>
                                <input
                                    type="text"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                    value={`${Number(selectedStock.lastInfo.last_price).toLocaleString()}`}
                                    disabled
                                />
                            </div>        
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Average Price</label>
                                <input
                                    type="text"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                    value={`${Number(selectedStock.lastInfo.average_price).toLocaleString()}`}
                                    disabled
                                />
                            </div>            
                            <hr /> 
                            <form onSubmit={handleSavePrice}>
                                <h2 className="text-2xl font-semibold text-center mb-6 mt-3">Price Setting</h2>                                
                                {prices.map((price, index) => (
                                    <div className="mb-4 flex items-center" key={index}>
                                        <label className="block text-sm font-medium text-gray-700">{price.name}</label>
                                        <div className="flex items-center gap-2">
                                        <input
                                            type={isEditNumberInput === price.name ? "number" : "text"}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"             
                                            value={isEditNumberInput === price.name? price.value : Number(price.value).toLocaleString()}                                            
                                            onChange={(event) => handlePriceChange(event, index)}
                                            onFocus={() => setIsEditNumberInput(price.name)}
                                            onBlur={() => setIsEditNumberInput("")}                                            
                                            />
                                        </div>
                                        <div className="flex items-center gap-1">
                                        <input
                                            type="radio"
                                            name="is_default"
                                            className="ml-4"
                                            checked={price.is_default === "1"}
                                            onChange={() => handleDefaultChange(index)}
                                            />           
                                            <span className="text-xs text-gray-500" onClick={() => handleDefaultChange(index)}>Set as Default</span>
                                        </div>    
                                    </div>  
                                ))}

                                <button
                                    className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition"
                                    onClick={handleSavePrice}
                                >
                                    Save Price
                                </button>
                            </form>


                        </div>
                    )}
                </div>               
            </div>
        </AdminLayout>
    );
};

export default Index;
