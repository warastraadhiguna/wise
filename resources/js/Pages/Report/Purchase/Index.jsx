import AdminLayout from "@/Layouts/AdminLayout";
import React, { useState } from "react";
import dateFormat from "dateformat";
import { router } from "@inertiajs/react";

const Index = ({ title, purchases,startDate, endDate, paymentMethod, status, paymentStatuses }) => {
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
                    <thead className="text-xs text-black bpurchase-b uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
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
                                Order
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Purchase
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Summary
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {purchases.map((purchase, i) => (
                            <React.Fragment key={i}>
                                <tr
                                    className={`bg-white dark:bg-gray-800 dark:bpurchase-gray-700  ${
                                        purchase.deleted_at
                                            ? "line-through bg-yellow-50"
                                            : ""
                                    }`}
                                >
                                    <td
                                        scope="row"
                                        className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white "
                                    >
                                        {i + 1}
                                    </td>
                                    <td className="px-6 py-4">
                                        {purchase.store_branch.name}
                                    </td>                                    
                                    <td className="px-6 py-4">
                                        <table className="w-full">
                                            <tbody>
                                                <tr>
                                                    <td className="font-semibold">
                                                        Company
                                                    </td>
                                                    <td>:</td>
                                                    <td>
                                                        {purchase.company_name}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="font-semibold">
                                                        Supplier
                                                    </td>
                                                    <td>:</td>
                                                    <td>
                                                        {purchase.supplier.name}
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
                                    <td
                                        className={`px-6 py-4 ${
                                            purchase.order_date
                                                ? ""
                                                : "text-center"
                                        }`}
                                    >
                                        {purchase.order_date ? (
                                            <table className="w-full">
                                                <tbody>
                                                    <tr>
                                                        <td className="font-semibold w-24">
                                                            No
                                                        </td>
                                                        <td className="w-1">
                                                            :
                                                        </td>
                                                        <td>
                                                            {
                                                                purchase.order_number
                                                            }
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td className="font-semibold">
                                                            Date
                                                        </td>
                                                        <td>:</td>
                                                        <td>
                                                            {dateFormat(
                                                                purchase.order_date,
                                                                "dd-mm-yyyy"
                                                            )}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td className="font-semibold">
                                                            User
                                                        </td>
                                                        <td>:</td>
                                                        <td>
                                                            {
                                                                purchase
                                                                    .order_user
                                                                    .name
                                                            }
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td className="font-semibold">
                                                            Status
                                                        </td>
                                                        <td>:</td>
                                                        <td>
                                                            {purchase.approve_order_date
                                                                ? "Approved"
                                                                : "-"}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td className="font-semibold">
                                                            Approved By
                                                        </td>
                                                        <td>:</td>
                                                        <td>
                                                            {purchase.approved_order_user
                                                                ? purchase
                                                                    .approved_order_user
                                                                    .name
                                                                : "-"}
                                                        </td>
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
                                        ) : (
                                            "-"
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <table className="w-full">
                                            <tbody>
                                                <tr>
                                                    <td className="font-semibold w-24">
                                                        No
                                                    </td>
                                                    <td className="w-1">:</td>
                                                    <td>
                                                        {
                                                            purchase.purchase_number
                                                        }
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="font-semibold">
                                                        Date
                                                    </td>
                                                    <td>:</td>
                                                    <td>
                                                        {purchase.purchase_date
                                                            ? dateFormat(
                                                                purchase.purchase_date,
                                                                "dd-mm-yyyy"
                                                            )
                                                            : ""}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="font-semibold">
                                                        User
                                                    </td>
                                                    <td>:</td>
                                                    <td>
                                                        {purchase.purchase_user
                                                            ? purchase
                                                                .purchase_user
                                                                .name
                                                            : ""}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="font-semibold">
                                                        Status
                                                    </td>
                                                    <td>:</td>
                                                    <td>
                                                        {purchase.approve_purchase_date
                                                            ? "Approved"
                                                            : "-"}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="font-semibold">
                                                        Approved By
                                                    </td>
                                                    <td>:</td>
                                                    <td>
                                                        {purchase.approved_user
                                                            ? purchase
                                                                .approved_user
                                                                .name
                                                            : "-"}
                                                    </td>
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
                                                    <td className="font-semibold w-24">
                                                        Total
                                                    </td>
                                                    <td className="w-1">:</td>
                                                    <td>
                                                        Rp.{" "}
                                                        {Number(
                                                            purchase.total_amount
                                                        ).toLocaleString()}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="font-semibold">
                                                        Discount
                                                    </td>
                                                    <td>:</td>
                                                    <td>
                                                        Rp.{" "}
                                                        {Number(
                                                            purchase.discount
                                                        ).toLocaleString()}{" "}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="font-semibold">
                                                        Disc. Percent
                                                    </td>
                                                    <td>:</td>
                                                    <td>
                                                        {Number(
                                                            purchase.discount_percent
                                                        ).toLocaleString()}{" "}
                                                        %
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="font-semibold">
                                                        Grand Total
                                                    </td>
                                                    <td>:</td>
                                                    <td>
                                                        Rp.{" "}
                                                        {Number(
                                                            purchase.total_amount -
                                                                purchase.discount -
                                                                (purchase.total_amount *
                                                                    purchase.discount_percent) /
                                                                    100 
                                                        ).toLocaleString()}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="font-semibold">
                                                        Paid
                                                    </td>
                                                    <td>:</td>
                                                    <td>
                                                        Rp.{" "}
                                                        {Number(purchase.purchase_payments_sum_amount
                                                        ).toLocaleString()}
                                                    </td>
                                                </tr>     
                                                <tr>
                                                    <td className="font-semibold">
                                                        PPn
                                                    </td>
                                                    <td>:</td>
                                                    <td>
                                                        {Number(
                                                            purchase.ppn
                                                        ).toLocaleString()}{" "}
                                                        %
                                                    </td>
                                                </tr>       
                                                <tr>
                                                    <td className="font-semibold">
                                                        DPP
                                                    </td>
                                                    <td>:</td>
                                                    <td>
                                                        Rp.{" "}
                                                        {Number(Math.round(
                                                            (purchase.total_amount -
                                                                purchase.discount -
                                                                (purchase.total_amount *
                                                                    purchase.discount_percent) /
                                                                    100 )*100/(100+purchase.ppn))
                                                        ).toLocaleString()}
                                                    </td>
                                                </tr>                                                   
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                                <tr className=" border-b">
                                    <td colSpan={2}></td>
                                    <td colSpan={4}>
                                        <table className="w-full text-sm text-left rtl:text-right text-black dark:text-gray-400">
                                            <thead className="text-xs text-black bpurchase-b uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
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
                                                {purchase.purchase_details.filter(purchaseDetail => purchaseDetail.quantity !== null) .map(
                                                    (purchaseDetail, j) => (
                                                        <tr
                                                            key={
                                                                "child" +
                                                                purchaseDetail.id
                                                            }
                                                            className={`bg-white border-b dark:bg-gray-800 dark:border-gray-700  ${
                                                                purchaseDetail.deleted_at
                                                                    ? "line-through bg-yellow-50"
                                                                    : ""
                                                            }`}
                                                            onDoubleClick={() => {
                                                                showEditingForm(
                                                                    purchaseDetail
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
                                                                {purchaseDetail.product
                                                                    ? purchaseDetail
                                                                        .product
                                                                        .name
                                                                    : ""}
                                                                {purchaseDetail.product
                                                                    ? " (" +
                                                                    purchaseDetail
                                                                        .product
                                                                        .code +
                                                                    ")"
                                                                    : ""}
                                                            </td>
                                                            <td>
                                                                {purchaseDetail.order_quantity
                                                                    ? Number(
                                                                        purchaseDetail.order_quantity
                                                                    ).toLocaleString() +
                                                                    ">>"
                                                                    : ""}
                                                                {Number(
                                                                    purchaseDetail.quantity
                                                                ).toLocaleString()}{" "}
                                                                {
                                                                    purchaseDetail
                                                                        .product
                                                                        .unit
                                                                        .name
                                                                }
                                                            </td>
                                                            <td className="px-6 py-4 cursor-pointer">
                                                                {Number(
                                                                    purchaseDetail.price
                                                                ).toLocaleString()}
                                                            </td>
                                                            <td className="px-6 py-4 cursor-pointer">
                                                                {Number(
                                                                    purchaseDetail.discount
                                                                ).toLocaleString()}
                                                            </td>
                                                            <td className="px-6 py-4 cursor-pointer">
                                                                {Number(
                                                                    purchaseDetail.discount_percent
                                                                ).toLocaleString()}
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                {Number(
                                                                    purchaseDetail.quantity *
                                                                        (purchaseDetail.price -
                                                                            purchaseDetail.discount -
                                                                            (purchaseDetail.price *
                                                                                purchaseDetail.discount_percent) /
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
