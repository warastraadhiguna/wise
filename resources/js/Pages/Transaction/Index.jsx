import AdminLayout from "@/Layouts/AdminLayout";
import { Link, router, usePage } from "@inertiajs/react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaMoneyBill, FaPencilAlt, FaRegTrashAlt } from "react-icons/fa";
import DeleteConfirmation from "@/Components/DeleteConfirmation";
import Pagination from "@/Components/Pagination";
import SearchingTable from "@/Components/SearchingTable";
import TransactionFilter from "@/Components/TransactionFilter";
import { MdOutlineAddCircleOutline } from "react-icons/md";
import dateFormat from "dateformat";
import PaymentList from "./PaymentList";

const Index = ({ title, transactions, searchingTextProps,startDate, endDate, paymentMethod, status, paymentStatuses, paymentStatus  }) => {

    const { flash } = usePage().props;
    const url = window.location.pathname;  

    const defaultValueData = {
        id: "", 
    };
    
    const [dataProps, setDataProps] = useState(defaultValueData);

    const [perPage, setPerPage]  = useState(transactions.per_page);
    const [searchingText, setSearchingText] = useState(searchingTextProps);
    
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [showPaymentList, setShowPaymentList] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [filters, setFilters] = useState({
        startDate: startDate,
        endDate: endDate,
        paymentMethod: paymentMethod,
        status: status,
        paymentStatus: paymentStatus
    });

    const filterParameter = `${url}?startDate=${filters.startDate}&endDate=${filters.endDate}&paymentMethod=${filters.paymentMethod}&status=${filters.status}&paymentStatus=${filters.paymentStatus}&page=1&perPage=${perPage}&searchingText=${searchingText}`;

    const handleDelete = () => {
        setIsProcessing(true);        
    
        router.delete(`/transaction/${dataProps.id}`,  {
            onFinish: () => {
                setShowDeleteConfirmation(false);
                setIsProcessing(false);                
            }
        });
    }    

    const handleDeleteConfirmation = (transaction) => {
        setShowDeleteConfirmation(true);
        setDataProps({
            ...transaction
        });
    }

    const handleFilterButton = (e) => {
        setIsProcessing(true);
        e.preventDefault();
        router.get(filterParameter, {}, {
            onFinish: () => {
                setIsProcessing(false);
            },
            
        });
    };

    useEffect(() => {
        flash.success && toast.success(flash.success);
        flash.error && toast.error(flash.error);
    }, [flash]);

    return (
        <AdminLayout title={title}>
            <TransactionFilter filters={filters} setFilters={setFilters} paymentStatuses={paymentStatuses} handleFilterButton={ handleFilterButton} />
            
            <div  className="flex items-center ml-1">
                <MdOutlineAddCircleOutline
                    size={40}
                    color="blue"
                    className="cursor-pointer ml-3 mb-3"
                    onClick={() => {
                        router.visit('transaction/create');
                    }}
                />   
            </div>            

            <SearchingTable perPage={perPage} setPerPage={setPerPage} searchingText={searchingText} setSearchingText={setSearchingText} isProcessing={ isProcessing } filterParameter={filterParameter} />
            
            <div className="relative overflow-x-auto">
                <table className="w-full text-sm text-left rtl:text-right text-black dark:text-gray-400">
                    <thead className="text-xs text-black btransaction-b uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">
                                No
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Store Branch
                            </th>                              
                            <th scope="col" className="px-6 py-3">
                                Info
                            </th>                        
                            <th scope="col" className="px-6 py-3">
                                Transaction
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
                        {transactions.data.map((transaction, i) => (
                            <tr
                                key={i}
                                className={`bg-white btransaction-b dark:bg-gray-800 dark:btransaction-gray-700  ${transaction.deleted_at? "line-through bg-yellow-50" : ""}`}
                            >
                                <td
                                    scope="row"
                                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white "
                                >
                                    {(transactions.current_page - 1) * transactions.per_page + i + 1}
                                </td>
                                <td className="px-6 py-4">{transaction.store_branch.name}</td>                                    
                                <td className="px-6 py-4">
                                    <table className="w-full">
                                    <tbody>
                                        <tr>
                                            <td className="font-semibold">
                                                Company
                                            </td>
                                            <td>:</td>
                                            <td>
                                                {transaction.company_name??"-"}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="font-semibold">
                                                Customer
                                            </td>
                                            <td>:</td>
                                            <td>
                                                {transaction.customer? transaction.customer.name : "-"}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="font-semibold">
                                                Payment
                                            </td>
                                            <td>:</td>
                                            <td>
                                                {transaction.payment_status.name}
                                            </td>
                                        </tr>                                            
                                    </tbody>
                                </table>    
                                </td>                                   
                                <td className="px-6 py-4">
                                    <table className="w-full">
                                        <tbody>
                                            <tr>
                                                <td className="font-semibold w-24">No</td>
                                                <td className="w-1">:</td>
                                                <td>{transaction.number}</td>
                                            </tr>
                                            <tr>
                                                <td className="font-semibold">Date</td>
                                                <td>:</td>
                                                <td>{transaction.transaction_date? dateFormat(transaction.transaction_date, 'dd-mm-yyyy') : ""}</td>
                                            </tr>
                                            <tr>
                                                <td className="font-semibold">User</td>
                                                <td>:</td>
                                                <td>{transaction.transaction_user? transaction.transaction_user.name : ""}</td>
                                            </tr>                                            
                                            <tr>
                                                <td className="font-semibold">Status</td>
                                                <td>:</td>
                                                <td>{transaction.approve_transaction_date ? 'Approved' : '-'}</td>
                                            </tr>
                                            <tr>
                                                <td className="font-semibold">Approved By</td>
                                                <td>:</td>
                                                <td>{transaction.approved_user ? transaction.approved_user.name : '-'}</td>
                                            </tr>
                                            <tr>
                                                <td className="font-semibold">Note</td>
                                                <td>:</td>
                                                <td>{transaction.note}</td>
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
                                                <td>Rp. {Number(transaction.total_amount).toLocaleString()}</td>
                                            </tr>
                                            <tr>
                                                <td className="font-semibold">Discount</td>
                                                <td>:</td>
                                                <td>Rp. {Number(transaction.discount).toLocaleString() } </td>
                                            </tr>
                                            <tr>
                                                <td className="font-semibold">Disc. Percent</td>
                                                <td>:</td>
                                                <td>{Number(transaction.discount_percent).toLocaleString() } %</td>
                                            </tr>
                                            <tr>
                                                <td className="font-semibold">PPn</td>
                                                <td>:</td>
                                                <td>{Number(transaction.ppn).toLocaleString() } %</td>
                                            </tr>  
                                            <tr>
                                                <td className="font-semibold">Grand Total</td>
                                                <td>:</td>
                                                <td>Rp. {Number(transaction.grand_total).toLocaleString() }</td>
                                            </tr>         
                                                <tr>
                                                    <td className="font-semibold">
                                                        Paid
                                                    </td>
                                                    <td>:</td>
                                                    <td>
                                                        Rp.{" "}
                                                        {Number(transaction.transaction_payments_sum_amount
                                                        ).toLocaleString()}
                                                    </td>
                                                </tr>                                               
                                        </tbody>
                                    </table>
                                </td>                                
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-center gap-2">
                                        <Link href={`transaction/${transaction.id}/edit`} className="flex items-center ml-1">
                                            <FaPencilAlt
                                                size={20}
                                                color={ transaction.deleted_at? "#c2bc42" : "green"}
                                                className="cursor-pointer"
                                            />    
                                        </Link>      
                                        {!transaction.approve_transaction_date &&
                                            <React.Fragment>
                                            {" "} | {" "}
                                                <FaRegTrashAlt
                                                size={20}
                                                color={ transaction.deleted_at? "#e18859" : "red"}
                                                className="cursor-pointer"
                                                onClick={() =>
                                                    handleDeleteConfirmation(transaction)
                                                }
                                                    />
                                            </React.Fragment>
                                        }{transaction.approve_transaction_date &&
                                            <React.Fragment>
                                                {" "} | {" "}
                                            <FaMoneyBill
                                                size={20}
                                                    color={transaction.deleted_at ? "#c2bc42" : "gold"}
                                                    onClick={() => {
                                                        setShowPaymentList(true);
                                                        setSelectedTransaction(transaction);
                                                    }}
                                                className="cursor-pointer"
                                            /> 
                                            </React.Fragment>
                                        }
                                        
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {showPaymentList && <PaymentList setShowPaymentList={setShowPaymentList} transaction={selectedTransaction} flash={ flash } />}            
            {showDeleteConfirmation && <DeleteConfirmation setShowDeleteConfirmation={setShowDeleteConfirmation} dataProps={dataProps} handleDelete={handleDelete} isProcessing={isProcessing}/>}            
            <Pagination data={transactions}></Pagination>
        </AdminLayout>
    );
};

export default Index;
