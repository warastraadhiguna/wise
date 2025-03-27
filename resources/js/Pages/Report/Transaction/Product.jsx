import TransactionFilter from '@/Components/TransactionFilter'
import AdminLayout from '@/Layouts/AdminLayout'
import { router } from '@inertiajs/react';
import React from 'react'
import { useState } from 'react';
import dateFormat from "dateformat";
import SearchingOnlyTable from '@/Components/SearchingOnlyTable';

const Product = ({ title, soldProducts, startDate, endDate, paymentMethod, category, status, paymentStatuses, paymentStatus, searchingTextProps }) => {

    const url = window.location.pathname;    
    const [searchingText, setSearchingText] = useState(searchingTextProps);
    const [isProcessing, setIsProcessing] = useState(false);    
    const [filters, setFilters] = useState({
        startDate: startDate,
        endDate: endDate,
        paymentMethod: paymentMethod,
        status: status,
        paymentStatus: paymentStatus,
        category:category
    });
    const filterParameter = `${url}?startDate=${filters.startDate}&endDate=${filters.endDate}&paymentMethod=${filters.paymentMethod}&status=${filters.status}&paymentStatus=${filters.paymentStatus}&category=${filters.category}&searchingText=${searchingText}`;

    const handleFilterButton = (e) => {
        setIsProcessing(true);
        e.preventDefault();
        router.get(filterParameter, {}, {
            onFinish: () => {
                setIsProcessing(false);
            },
            
        });
    };

    return (
            <AdminLayout title={title}>
            <TransactionFilter filters={filters} setFilters={setFilters} paymentStatuses={paymentStatuses} handleFilterButton={handleFilterButton} isProcessing={isProcessing} />    

            <SearchingOnlyTable  searchingText={searchingText} setSearchingText={setSearchingText} isProcessing={isProcessing} filterParameter={filterParameter} />
            
                <div className="relative overflow-x-auto">
                    <table className="w-full text-sm text-left rtl:text-right text-black dark:text-gray-400">
                        <thead className="text-xs text-black btransaction-b uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">
                                    No
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Code
                                </th>                              
                                <th scope="col" className="px-6 py-3">
                                    Name
                                </th>                        
                                <th scope="col" className="px-6 py-3">
                                    Unit
                                </th>             
                                <th scope="col" className="px-6 py-3" width="22%">
                                    Qty
                                </th>    
                                {category=="detail" && 
                                <th  scope="col" className="px-6 py-3">
                                    Date
                                </th>}
                            </tr>
                        </thead>
                        <tbody>
                            {soldProducts.map((soldProduct, i) => (
                                <React.Fragment key={i}>
                                <tr
                                    key={i}
                                    className={`bg-white btransaction-b dark:bg-gray-800 dark:btransaction-gray-700`}
                                >
                                    <td
                                        scope="row"
                                        className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white "
                                    >
                                        {i + 1}
                                    </td>
                                    <td className="px-6 py-4">{ soldProduct.product.code}</td>                                    
                                    <td className="px-6 py-4">{ soldProduct.product.name}</td>                                   
                                    <td className="px-6 py-4">{ soldProduct.product.unit.name}</td>   
                                    <td className="px-6 py-4">{Number(soldProduct.total_quantity).toLocaleString()}</td>  
                                                                    {category=="detail" && 
                                    <td className="px-6 py-4">
                                        {  dateFormat(soldProduct.transaction.transaction_date, 'dd-mm-yyyy')}
                                    </td>}    
                                </tr>
                                <tr className=" border-b">
                                </tr>
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>            
            </AdminLayout>
    )
}

export default Product