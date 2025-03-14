import AdminLayout from "@/Layouts/AdminLayout";
import React, { useState } from "react";
import dateFormat from "dateformat";
import { router } from "@inertiajs/react";
import TransactionFilter from "@/Components/TransactionFilter";

const List = ({ title, transactions,startDate, endDate, paymentMethod, status, paymentStatuses,paymentStatus }) => {
    const url = window.location.pathname;    

    const [isProcessing, setIsProcessing] = useState(false);    
    const [filters, setFilters] = useState({
        startDate: startDate,
        endDate: endDate,
        paymentMethod: paymentMethod,
        status: status,
        paymentStatus: paymentStatus        
    });


    const handleFilterButton = (e) => {
        setIsProcessing(true);
        e.preventDefault();
        router.get(`${url}?startDate=${filters.startDate}&endDate=${filters.endDate}&paymentMethod=${filters.paymentMethod}&status=${filters.status}&paymentStatus=${filters.paymentStatus}`, {}, {
            onFinish: () => {
                setIsProcessing(false);
            },
            
        });
    };
    // console.log(transactions);
    return (
        <AdminLayout title={title}>
            <TransactionFilter filters={filters} setFilters={setFilters} paymentStatuses={paymentStatuses} handleFilterButton={ handleFilterButton} />         
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
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((transaction, i) => (
                            <React.Fragment key={i}>
                            <tr
                                key={i}
                                className={`bg-white btransaction-b dark:bg-gray-800 dark:btransaction-gray-700  ${transaction.deleted_at? "line-through bg-yellow-50" : ""}`}
                            >
                                <td
                                    scope="row"
                                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white "
                                >
                                    {i + 1}
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
                                            <tr>
                                                <td className="font-semibold">PPn</td>
                                                <td>:</td>
                                                <td>{Number(transaction.ppn).toLocaleString() } %</td>
                                                </tr>         
                                                <tr>
                                                    <td className="font-semibold">
                                                        DPP
                                                    </td>
                                                    <td>:</td>
                                                    <td>
                                                        Rp.{" "}
                                                        {Number(Math.round(transaction.grand_total*100/(100+transaction.ppn
                                                        ))).toLocaleString()}
                                                    </td>
                                                </tr>                                                   
                                        </tbody>
                                    </table>
                                </td>    
                            </tr>
                            <tr className=" border-b">
                                <td colSpan={1}></td>
                                <td colSpan={4}>
                                    <table className="w-full text-sm text-left rtl:text-right text-black dark:text-gray-400">
                                        <thead className="text-xs text-black btransaction-b uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                            <tr>
                                                <th
                                                    scope="col"
                                                    className="px-6 py-3"
                                                    width="5%"
                                                >
                                                    No
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-6 py-3"
                                                >
                                                    Name
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-6 py-3"
                                                >
                                                    Qty
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-6 py-3"
                                                >
                                                    Price
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-6 py-3"
                                                >
                                                    Disc.
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-6 py-3"
                                                >
                                                    Disc. %
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-6 py-3"
                                                >
                                                    Total
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {transaction.transaction_details.filter(transactionDetail => transactionDetail.quantity !== null) .map(
                                                (transactionDetail, j) => (
                                                    <tr
                                                        key={
                                                            "child" +
                                                            transactionDetail.id
                                                        }
                                                        className={`bg-white border-b dark:bg-gray-800 dark:border-gray-700  ${
                                                            transactionDetail.deleted_at
                                                                ? "line-through bg-yellow-50"
                                                                : ""
                                                        }`}
                                                        onDoubleClick={() => {
                                                            showEditingForm(
                                                                transactionDetail
                                                            );
                                                        }}
                                                    >
                                                        <td
                                                            scope="row"
                                                            className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white "
                                                        >
                                                            {j + 1}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            {transactionDetail.product
                                                                ? transactionDetail
                                                                    .product
                                                                    .name
                                                                : ""}
                                                            {transactionDetail.product
                                                                ? " (" +
                                                                transactionDetail
                                                                    .product
                                                                    .code +
                                                                ")"
                                                                : ""}
                                                        </td>
                                                        <td>
                                                            {transactionDetail.order_quantity
                                                                ? Number(
                                                                    transactionDetail.order_quantity
                                                                ).toLocaleString() +
                                                                ">>"
                                                                : ""}
                                                            {Number(
                                                                transactionDetail.quantity
                                                            ).toLocaleString()}{" "}
                                                            {
                                                                transactionDetail
                                                                    .product
                                                                    .unit
                                                                    .name
                                                            }
                                                        </td>
                                                        <td className="px-6 py-4 cursor-pointer">
                                                            {Number(
                                                                transactionDetail.price
                                                            ).toLocaleString()}
                                                        </td>
                                                        <td className="px-6 py-4 cursor-pointer">
                                                            {Number(
                                                                transactionDetail.discount
                                                            ).toLocaleString()}
                                                        </td>
                                                        <td className="px-6 py-4 cursor-pointer">
                                                            {Number(
                                                                transactionDetail.discount_percent
                                                            ).toLocaleString()}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            {Number(
                                                                transactionDetail.quantity *
                                                                    (transactionDetail.price -
                                                                        transactionDetail.discount -
                                                                        (transactionDetail.price *
                                                                            transactionDetail.discount_percent) /
                                                                            100)
                                                            ).toLocaleString()}
                                                        </td>
                                                    </tr>
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
};

export default List;
