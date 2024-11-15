import AdminLayout from "@/Layouts/AdminLayout";
import { Link, router, usePage } from "@inertiajs/react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaPencilAlt, FaRegTrashAlt } from "react-icons/fa";
import DeleteConfirmation from "@/Components/DeleteConfirmation";
import Pagination from "@/Components/Pagination";
import SearchingTable from "@/Components/SearchingTable";
import { MdOutlineAddCircleOutline } from "react-icons/md";
import { CiShoppingBasket } from "react-icons/ci";
import dateFormat from "dateformat";

const Index = ({ title, orders, searchingTextProps }) => {

    const { flash } = usePage().props;

    const defaultValueData = {
        id: "", 
    };
    
    const [dataProps, setDataProps] = useState(defaultValueData);

    const [perPage, setPerPage]  = useState(orders.per_page);
    const [searchingText, setSearchingText] = useState(searchingTextProps);
    
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleDelete = () => {
        setIsProcessing(true);        
    
        router.delete(`/order/${dataProps.id}`,  {
            onFinish: () => {
                setShowDeleteConfirmation(false);
                setIsProcessing(false);                
            }
        });
    }    

    const handleDeleteConfirmation = (order) => {
        setShowDeleteConfirmation(true);
        setDataProps({
            ...order
        });
    }

    useEffect(() => {
        flash.success && toast.success(flash.success);
        flash.error && toast.error(flash.error);
    }, [flash]);
    // console.log(orders);
    return (
        <AdminLayout title={title}>
            <Link href='order/create' className="flex items-center ml-1">
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
                            <th scope="col" className="px-6 py-3">
                                No
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Name - Company Name
                            </th>                        
                            <th scope="col" className="px-6 py-3">
                                Store Branch
                            </th>                              
                            <th scope="col" className="px-6 py-3">
                                Order
                            </th>        
                            <th scope="col" className="px-6 py-3">
                                Purchase
                            </th>                             
                            <th scope="col" className="px-6 py-3 text-center" width="5%">
                                #
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.data.map((order, i) => (
                            <tr
                                key={i}
                                className={`bg-white border-b dark:bg-gray-800 dark:border-gray-700  ${order.deleted_at? "line-through bg-yellow-50" : ""}`}
                            >
                                <td
                                    scope="row"
                                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white "
                                >
                                    {(orders.current_page - 1) * orders.per_page + i + 1}
                                </td>
                                <td className="px-6 py-4">{order.name} - {order.company_name}</td>    
                                <td className="px-6 py-4">{order.store_branch.name}</td>                                   

                                
                                <td className="px-6 py-4">
                                    <table className="w-full">
                                        <tbody>
                                            <tr>
                                                <td className="font-semibold w-24">No</td>
                                                <td className="w-1">:</td>
                                                <td>{order.order_number}</td>
                                            </tr>
                                            <tr>
                                                <td className="font-semibold">Date</td>
                                                <td>:</td>
                                                <td>{dateFormat(order.order_date, 'dd-mm-yyyy')}</td>
                                            </tr>
                                            <tr>
                                                <td className="font-semibold">User</td>
                                                <td>:</td>
                                                <td>{order.order_user?order.order_user.name : ""}</td>
                                            </tr>                                            
                                            <tr>
                                                <td className="font-semibold">Status</td>
                                                <td>:</td>
                                                <td>{order.approve_order_date ? 'Approved' : '-'}</td>
                                            </tr>
                                            <tr>
                                                <td className="font-semibold">Approved By</td>
                                                <td>:</td>
                                                <td>{order.approved_order_user ? order.approved_order_user.name : '-'}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>               
                                <td className={`px-6 py-4 ${order.purchase_user? '' : 'text-center'}`}>
                                    {order.purchase_user?                                     <table className="w-full">
                                        <tbody>
                                            <tr>
                                                <td className="font-semibold w-24">No</td>
                                                <td className="w-1">:</td>
                                                <td>{order.purchase_number}</td>
                                            </tr>
                                            <tr>
                                                <td className="font-semibold">Date</td>
                                                <td>:</td>
                                                <td>{order.purchase_date? dateFormat(order.purchase_date, 'dd-mm-yyyy') : ""}</td>
                                            </tr>
                                            <tr>
                                                <td className="font-semibold">User</td>
                                                <td>:</td>
                                                <td>{order.purchase_user? order.purchase_user.name : ""}</td>
                                            </tr>                                            
                                            <tr>
                                                <td className="font-semibold">Status</td>
                                                <td>:</td>
                                                <td>{order.approve_purchase_date ? 'Approved' : '-'}</td>
                                            </tr>
                                            <tr>
                                                <td className="font-semibold">Approved By</td>
                                                <td>:</td>
                                                <td>{order.approved_user ? order.approved_user.name : '-'}</td>
                                            </tr>
                                        </tbody>
                                    </table> : "-"}
                                </td>                                      
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-center gap-2">
                                        <Link href={`order/${order.id}/edit`} className="flex items-center ml-1">
                                            <FaPencilAlt
                                                size={20}
                                                color={ order.deleted_at? "#c2bc42" : "green"}
                                                className="cursor-pointer"
                                            />    
                                        </Link>      

                                        {" "} | {" "}                                        
                                        {!order.approve_order_date?
                                            <FaRegTrashAlt
                                                size={20}
                                                color={ order.deleted_at? "#e18859" : "red"}
                                                className="cursor-pointer"
                                                onClick={() =>
                                                    handleDeleteConfirmation(order)
                                                }
                                            />
                                            :
                                            <Link href={`purchase/${order.id}/edit`} className="flex items-center ml-1">
                                                <CiShoppingBasket
                                                size={32}
                                                color="blue"
                                                className="cursor-pointer"/>
                                            </Link> 
                                        }
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {showDeleteConfirmation && <DeleteConfirmation setShowDeleteConfirmation={setShowDeleteConfirmation} dataProps={dataProps} handleDelete={handleDelete} isProcessing={isProcessing}/>}            
            <Pagination data={orders}></Pagination>
        </AdminLayout>
    );
};

export default Index;
