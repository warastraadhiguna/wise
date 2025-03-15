import AdminLayout from "@/Layouts/AdminLayout";
import React, {  useEffect, useState } from "react";
import { FaMoneyBill, FaSearch } from "react-icons/fa";
import Pagination from "@/Components/Pagination";
import SearchingTable from "@/Components/SearchingTable";
import { router,usePage } from '@inertiajs/react';
import toast from "react-hot-toast";
import Info from "./Info";

const Index = ({ title, stocks, selectedStock, searchingTextProps, perPageProps, pageProps, priceCategories, showInfoProps }) => {
    const { flash } = usePage().props;    
    const [perPage, setPerPage]  = useState(stocks.per_page);
    const [searchingText, setSearchingText] = useState(searchingTextProps);
    const url = window.location.pathname;
    const [showInfo, setShowInfo] = useState(showInfoProps && selectedStock);

    const handleShowPriceForm = (e, productId) => {
        e.preventDefault();
        router.get(`${url}?page=${pageProps}&perPage=${perPageProps}&searchingText=${searchingTextProps}&selectedProductId=${productId}`);         
    };

    useEffect(() => {
        flash.success && toast.success(flash.success);
        flash.error && toast.error(flash.error);
    }, [flash]);

    return (
        <AdminLayout title={title}>
            {showInfo && (
                <Info
                    setShowInfo={setShowInfo}
                    selectedStock={selectedStock}
                />
            )}

            <div className="flex">
                <div className={`transition-all duration-300 w-full pr-4`}>
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
                                    {
                                        priceCategories.map((priceCategory, i) => (
                                            <th key={i} scope="col" className="px-6 py-3">
                                                {priceCategory.name}
                                            </th>
                                        ))
                                    }
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
                                        {
                                            priceCategories.map((priceCategory, i) => (
                                                <td key={i} className="px-6 py-4">
                                                    {Number(stock[`priceCategory_${priceCategory.id}`]).toLocaleString()}
                                                </td>
                                            ))
                                        }                                        
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <FaMoneyBill
                                                    size={20}
                                                    color={ stock.deleted_at? "#c2bc42" : "green"}
                                                    className="cursor-pointer"
                                                    onClick={(event) => handleShowPriceForm(event,stock.id)}
                                                />   
                                                {" "}
                                                <FaSearch
                                                    color="blue"
                                                    size={15}
                                                    className="cursor-pointer"
                                                    onClick={() => {
                                                            const width = 800;
                                                            const height = 600;
                                                            const left = (window.screen.width / 2) - (width / 2);
                                                            const top = (window.screen.height / 2) - (height / 2);

                                                            const printWindow = window.open(
                                                            `/stock/${stock.id}`,
                                                            '_blank',
                                                            `width=${width},height=${height},top=${top},left=${left}`
                                                            );
                                                        }}
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
            </div>
        </AdminLayout>
    );
};

export default Index;
