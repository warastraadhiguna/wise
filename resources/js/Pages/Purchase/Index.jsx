import AdminLayout from "@/Layouts/AdminLayout";
import { Link, router, usePage } from "@inertiajs/react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaPencilAlt, FaRegTrashAlt } from "react-icons/fa";
import DeleteConfirmation from "@/Components/DeleteConfirmation";
import Pagination from "@/Components/Pagination";
import SearchingTable from "@/Components/SearchingTable";
import { MdOutlineAddCircleOutline } from "react-icons/md";
import dateFormat from "dateformat";

const Index = ({ title, purchases, searchingTextProps,startDate, endDate, paymentMethod, status, paymentStatuses }) => {
    const url = window.location.pathname;  
    const { flash } = usePage().props;

    const defaultValueData = {
        id: "", 
    };
    
    const [dataProps, setDataProps] = useState(defaultValueData);

    const [perPage, setPerPage]  = useState(purchases.per_page);
    const [searchingText, setSearchingText] = useState(searchingTextProps);
    
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const [filters, setFilters] = useState({
        startDate: startDate,
        endDate: endDate,
        paymentMethod: paymentMethod,
        status: status
    });

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters({ ...filters, [name]: value });
    };

    const handleFilterButton = (e) => {
        setIsProcessing(true);
        e.preventDefault();
        router.get(`${url}?startDate=${filters.startDate}&endDate=${filters.endDate}&paymentMethod=${filters.paymentMethod}&status=${filters.status}`, {}, {
            onFinish: () => {
                setIsProcessing(false);
            },
            
        });
    };
    const handleDelete = () => {
        setIsProcessing(true);        
    
        router.delete(`/purchase/${dataProps.id}`,  {
            onFinish: () => {
                setShowDeleteConfirmation(false);
                setIsProcessing(false);                
            }
        });
    }    

    const handleDeleteConfirmation = (purchase) => {
        setShowDeleteConfirmation(true);
        setDataProps({
            ...purchase
        });
    }

    useEffect(() => {
        flash.success && toast.success(flash.success);
        flash.error && toast.error(flash.error);
    }, [flash]);

    return (
        <AdminLayout title={title}>
            <div className="mb-10">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4  items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Start Date</label>
                        <input
                            type="date"
                            name="startDate"
                            value={filters.startDate}
                            onChange={handleFilterChange}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">End Date</label>
                        <input
                            type="date"
                            name="endDate"
                            value={filters.endDate}
                            onChange={handleFilterChange}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                        <select
                            name="paymentMethod"
                            value={filters.paymentMethod}
                            onChange={handleFilterChange}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                            <option value="">All</option>
                            {paymentStatuses.map((status, i) => (
                                <option key={i} value={status.id}>{status.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <select
                            name="status"
                            value={filters.status}
                            onChange={handleFilterChange}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                            <option value="">All</option>
                            <option value="approved">Approved</option>
                            <option value="pending">Pending</option>
                        </select>
                    </div>
                    <div>
                        <button
                            type="submit"
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            onClick={handleFilterButton}
                            disabled={isProcessing}
                        >
                            Filter
                        </button>
                    </div>
                </div>
            </div>                
            <Link href='purchase/create' className="flex items-center ml-1">
                <MdOutlineAddCircleOutline
                    size={40}
                    color="blue"
                    className="cursor-pointer ml-3 mb-3"
                />   
            </Link>            

            <SearchingTable perPage={perPage} setPerPage={setPerPage} searchingText={ searchingText } setSearchingText={ setSearchingText } />
            
            <div className="relative overflow-x-auto">
                <table className="w-full text-sm text-left rtl:text-right text-black dark:text-gray-400">
                    <thead className="text-xs text-black border-b uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3" width="2%">
                                No
                            </th>                    
                            <th scope="col" className="px-6 py-3" width="7%">
                                Store Branch
                            </th>                              
                            <th scope="col" className="px-6 py-3">
                                Info
                            </th>                                
                            <th scope="col" className="px-6 py-3" width="20%">
                                Order
                            </th>        
                            <th scope="col" className="px-6 py-3" width="20%">
                                Purchase
                            </th>       
                            <th scope="col" className="px-6 py-3" width="22%">
                                Summary
                            </th>                               
                            <th scope="col" className="px-6 py-3 text-center" width="5%">
                                #
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {purchases.data.map((purchase, i) => (
                            <tr
                                key={i}
                                className={`bg-white bpurchase-b dark:bg-gray-800 dark:bpurchase-gray-700  ${purchase.deleted_at? "line-through bg-yellow-50" : ""}`}
                            >
                                <td
                                    scope="row"
                                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white "
                                >
                                    {(purchases.current_page - 1) * purchases.per_page + i + 1}
                                </td>
                                <td className="px-6 py-4">{purchase.store_branch.name}</td>                                 
                                <td className="px-6 py-4">
                                        <table className="w-full">
                                            <tbody>
                                                <tr>
                                                    <td className="font-semibold">
                                                        Company
                                                    </td>
                                                    <td>:</td>
                                                    <td>
                                                        {purchase.company_name??"-"}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="font-semibold">
                                                        Supplier
                                                    </td>
                                                    <td>:</td>
                                                    <td>
                                                        {purchase.supplier? purchase.supplier.name : "-"}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="font-semibold">
                                                        Payment
                                                    </td>
                                                    <td>:</td>
                                                    <td>
                                                        {purchase.payment_status.name}
                                                    </td>
                                                </tr>                                            
                                            </tbody>
                                        </table>                                  
                                </td>    


                                
                                <td className={`px-6 py-4 ${purchase.order_date? '' : 'text-center'}`}>
                                    {purchase.order_date ?
                                        <table className="w-full">
                                            <tbody>
                                                <tr>
                                                    <td className="font-semibold w-24">No</td>
                                                    <td className="w-1">:</td>
                                                    <td>{purchase.order_number}</td>
                                                </tr>
                                                <tr>
                                                    <td className="font-semibold">Date</td>
                                                    <td>:</td>
                                                    <td>{dateFormat(purchase.order_date, 'dd-mm-yyyy')}</td>
                                                </tr>
                                                <tr>
                                                    <td className="font-semibold">User</td>
                                                    <td>:</td>
                                                    <td>{purchase.order_user.name}</td>
                                                </tr>
                                                <tr>
                                                    <td className="font-semibold">Status</td>
                                                    <td>:</td>
                                                    <td>{purchase.approve_order_date ? 'Approved' : '-'}</td>
                                                </tr>
                                                <tr>
                                                    <td className="font-semibold">Approved By</td>
                                                    <td>:</td>
                                                    <td>{purchase.approved_order_user ? purchase.approved_order_user.name : '-'}</td>
                                                </tr>
                                                <tr>
                                                    <td className="font-semibold">
                                                        Note
                                                    </td>
                                                    <td>:</td>
                                                    <td>
                                                        {
                                                            purchase
                                                                .order_note
                                                        }
                                                    </td>
                                                </tr>                                                  
                                            </tbody>
                                        </table>
                                    : "-"
                                    }
                                </td>               
                                <td className="px-6 py-4">
                                    <table className="w-full">
                                        <tbody>
                                            <tr>
                                                <td className="font-semibold w-24">No</td>
                                                <td className="w-1">:</td>
                                                <td>{purchase.purchase_number}</td>
                                            </tr>
                                            <tr>
                                                <td className="font-semibold">Date</td>
                                                <td>:</td>
                                                <td>{purchase.purchase_date? dateFormat(purchase.purchase_date, 'dd-mm-yyyy') : ""}</td>
                                            </tr>
                                            <tr>
                                                <td className="font-semibold">User</td>
                                                <td>:</td>
                                                <td>{purchase.purchase_user? purchase.purchase_user.name : ""}</td>
                                            </tr>                                            
                                            <tr>
                                                <td className="font-semibold">Status</td>
                                                <td>:</td>
                                                <td>{purchase.approve_purchase_date ? 'Approved' : '-'}</td>
                                            </tr>
                                            <tr>
                                                <td className="font-semibold">Approved By</td>
                                                <td>:</td>
                                                <td>{purchase.approved_user ? purchase.approved_user.name : '-'}</td>
                                            </tr>
                                            <tr>
                                                <td className="font-semibold">
                                                    Note
                                                </td>
                                                <td>:</td>
                                                <td>
                                                    {
                                                        purchase
                                                            .purchase_note
                                                    }
                                                </td>
                                            </tr>                                             
                                        </tbody>
                                    </table>
                                </td>      
                                <td>
                                    <table className="w-full">
                                        <tbody>
                                            <tr>
                                                <td className="font-semibold w-24">Total</td>
                                                <td className="w-1">:</td>
                                                <td>Rp. {Number(purchase.total_amount).toLocaleString()}</td>
                                            </tr>
                                            <tr>
                                                <td className="font-semibold">Discount</td>
                                                <td>:</td>
                                                <td>Rp. {Number(purchase.discount).toLocaleString() } </td>
                                            </tr>
                                            <tr>
                                                <td className="font-semibold">Disc. Percent</td>
                                                <td>:</td>
                                                <td>{Number(purchase.discount_percent).toLocaleString() } %</td>
                                            </tr>
                                            <tr>
                                                <td className="font-semibold">PPn</td>
                                                <td>:</td>
                                                <td>{Number(purchase.ppn).toLocaleString() } %</td>
                                            </tr>  
                                            <tr>
                                                <td className="font-semibold">Grand Total</td>
                                                <td>:</td>
                                                <td>Rp. {Number((purchase.total_amount - purchase.discount - (purchase.total_amount * purchase.discount_percent / 100)) + (purchase.total_amount - purchase.discount - (purchase.total_amount * purchase.discount_percent / 100))*purchase.ppn/100).toLocaleString() }</td>
                                            </tr>         
                                                <tr>
                                                    <td className="font-semibold">
                                                        Paid
                                                    </td>
                                                    <td>:</td>
                                                    <td>
                                                        Rp.{" "}
                                                        {Number(purchase.purchase_payment_sum_amount
                                                        ).toLocaleString()}
                                                    </td>
                                                </tr>                                               
                                        </tbody>
                                    </table>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-center gap-2">
                                        <Link href={`purchase/${purchase.id}/edit`} className="flex items-center ml-1">
                                            <FaPencilAlt
                                                size={20}
                                                color={ purchase.deleted_at? "#c2bc42" : "green"}
                                                className="cursor-pointer"
                                            />    
                                        </Link>      
                                        {" "} | {" "}    
                                        {!purchase.approve_purchase_date &&<FaRegTrashAlt
                                            size={20}
                                            color={ purchase.deleted_at? "#e18859" : "red"}
                                            className="cursor-pointer"
                                            onClick={() =>
                                                handleDeleteConfirmation(purchase)
                                            }
                                        />}
                                        
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {showDeleteConfirmation && <DeleteConfirmation setShowDeleteConfirmation={setShowDeleteConfirmation} dataProps={dataProps} handleDelete={handleDelete} isProcessing={isProcessing}/>}            
            <Pagination data={purchases}></Pagination>
        </AdminLayout>
    );
};

export default Index;
