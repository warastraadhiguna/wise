import AdminLayout from "@/Layouts/AdminLayout";
import React, { useState } from "react";
import dateFormat from "dateformat";
import { router } from "@inertiajs/react";

const Index = ({ title, transactions,startDate, endDate, paymentMethod, status, paymentStatuses }) => {
    const url = window.location.pathname;    

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
    // console.log(transactions);
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
                                                <td className="font-semibold">PPn</td>
                                                <td>:</td>
                                                <td>{Number(transaction.ppn).toLocaleString() } %</td>
                                            </tr>  
                                            <tr>
                                                <td className="font-semibold">Grand Total</td>
                                                <td>:</td>
                                                <td>Rp. {Number((transaction.total_amount - transaction.discount - (transaction.total_amount * transaction.discount_percent / 100)) + (transaction.total_amount - transaction.discount - (transaction.total_amount * transaction.discount_percent / 100))*transaction.ppn/100).toLocaleString() }</td>
                                            </tr>         
                                                <tr>
                                                    <td className="font-semibold">
                                                        Paid
                                                    </td>
                                                    <td>:</td>
                                                    <td>
                                                        Rp.{" "}
                                                        {Number(transaction.transaction_payment_sum_amount
                                                        ).toLocaleString()}
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

export default Index;