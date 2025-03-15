import Pagination from '@/Components/Pagination';
import SearchingTable from '@/Components/SearchingTable';
import React from 'react'
import { useState } from 'react';
import dateFormat from "dateformat";

const Detail = ({ detailStock, stockHistories, searchingTextProps}) => {
    const [perPage, setPerPage] = useState(stockHistories.per_page);
        const [searchingText, setSearchingText] = useState(searchingTextProps);
    return (
<div className="container mx-auto">

        <div className="flex flex-col">
            {/* Judul Ditengah */}
            <div className="bg-gray-100 p-3 rounded-lg text-center text-lg font-semibold text-gray-800 mb-4">
                Stock Detail
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md mb-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-700">
                    <div>
                        <span className="font-semibold">Product Barcode:</span> {detailStock.code}
                    </div>
                    <div>
                        <span className="font-semibold">Category:</span> {detailStock.product_category? detailStock.product_category.name : ""}
                    </div>
                    <div>
                        <span className="font-semibold">Brand:</span> {detailStock.brand? detailStock.brand.name : ""}
                    </div>
                    <div>
                        <span className="font-semibold">Unit :</span> {detailStock.unit? detailStock.unit.name : ""}
                    </div>
                </div>
            </div>          
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
                                    Category
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Quantity
                                </th>        
                                <th scope="col" className="px-6 py-3">
                                    Date
                                </th>  
                            </tr>
                        </thead>
                        <tbody>
                                {stockHistories.data.map((stock, i) => (
                                    <tr
                                        key={i}
                                        className={`bg-white border-b dark:bg-gray-800 dark:border-gray-700  ${stock.deleted_at? "line-through bg-yellow-50" : ""}`}
                                    >
                                        <td
                                            scope="row"
                                            className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white "
                                        >
                                            {(stockHistories.current_page - 1) * stockHistories.per_page + i + 1}
                                        </td>
                                        <td className="px-6 py-4"> {stock.category}</td>
                                        <td className="px-6 py-4">{stock.quantity}</td>
                                        <td className="px-6 py-4">{dateFormat(stock.date, 'dd-mm-yyyy')}</td>        
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
                <Pagination data={stockHistories}></Pagination>
            </div>               
            </div>
            
        </div>
    )
}

export default Detail