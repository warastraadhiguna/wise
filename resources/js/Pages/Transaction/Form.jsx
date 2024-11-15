import AdminLayout from "@/Layouts/AdminLayout";
import { Link, router, usePage } from "@inertiajs/react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Select from "react-select";
import Detail from "./Detail";
import { FiChevronUp, FiChevronDown } from 'react-icons/fi'; 

const Form = ({ title, transaction, previousUrl, customers, products, transactionDetails, paymentStatuses}) => {

    const { flash, errors,auth } = usePage().props;
    const [isEditNumberInput, setIsEditNumberInput] = useState("");  

    const [isCollapsed, setIsCollapsed] = useState(transaction.transaction_date);     

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed); 
    };    
    

    const [dataProps, setDataProps] = useState({
        id: transaction.id, 
        customer_id: transaction.customer_id, 
        number: transaction.number, 
        transaction_date: transaction.transaction_date, 
        transaction_note: transaction.transaction_note, 
        payment_status_id: transaction.payment_status_id,
        discount: transaction.discount,
        discount_percent: transaction.discount_percent,
        ppn: transaction.ppn
    });

    const customerOptions = Object.keys(customers).map((key) => ({
        value: customers[key].id,
        label: customers[key].name + " - " + customers[key].company_name,
    }));    

    const paymentStatusOptions = Object.keys(paymentStatuses).map((key) => ({
        value: paymentStatuses[key].id,
        label: paymentStatuses[key].name.toUpperCase(),
    }));        

    const seletedSupplierOption = customerOptions.find(option => option.value === transaction.customer_id);
    const seletedPaymentStatusOption = paymentStatusOptions.find(option => option.value === transaction.payment_status_id);
    
    const [isProcessing, setIsProcessing] = useState(false);

    const handleChange = (event) => {
        setDataProps((prevData) => ({
            ...prevData,
            [event.target.name]: event.target.value,
        }));
    };

    const handleOptionChange = (selectedOption, name = "") => {
        setDataProps((prevData) => ({
            ...prevData,
            [name]: selectedOption? selectedOption.value : null,
        }));
    };    

    const actionForm = (e) => {
        e.preventDefault();        
        setIsProcessing(true);

        router.put(`/transaction/${dataProps.id}`, dataProps, {
            onFinish:()=> {
                if (flash) {
                    flash.success = "";
                    flash.error = "";
                    setIsEditNumberInput("");                    
                }
                setIsProcessing(false);
            }
        });
    }    

    useEffect(() => {
        flash.success && toast.success(flash.success);
        flash.error && toast.error(flash.error);
    }, [flash]);

    return (
        <AdminLayout title={title}>
            <div className="w-full mx-auto  border-2 border-gray-300 p-5 relative">
                <button 
                    className="absolute right-2 top-2 text-gray-600"
                    onClick={toggleCollapse}
                >
                    {isCollapsed ? <FiChevronDown size={24} /> : <FiChevronUp size={24} />}
                </button>

                {!isCollapsed || transaction.deleted_at ? (
                    <form
                        className="w-full"
                        onSubmit={(event) => actionForm(event)}
                        autoComplete="off"
                    >
                        <div className="flex flex-wrap -mx-3 mb-6">
                            <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                                <label
                                    className="block uppercase tracking-wide text-black text-xs font-bold mb-2"
                                    htmlFor="grid-name"
                                >
                                    Purchase Number
                                </label>
                                <input
                                    className="appearance-none block w-full bg-white text-black border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                    id="grid-transaction-number"
                                    name="number"
                                    value={dataProps.number}
                                    type="text"
                                    disabled={true}
                                    onChange={(event) => handleChange(event)}
                                />
                                {errors && errors.number && (
                                    <div className="text-red-700 text-sm mt-2">
                                        {errors.number}
                                    </div>
                                )}
                            </div>
                            <div className="w-full md:w-1/2 px-3">
                                <label
                                    className="block uppercase tracking-wide text-black text-xs font-bold mb-2"
                                    htmlFor="grid-transaction-date"
                                >
                                    Transaction Date
                                </label>
                                <input
                                    className="appearance-none block w-full bg-white text-black border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                    id="grid-transaction-date"
                                    type="date"
                                    name="transaction_date"
                                    value={"2024-11-12"}
                                    disabled={
                                        transaction.deleted_at || isProcessing || transaction.approve_transaction_date
                                    }
                                    onChange={(event) => handleChange(event)}
                                />
                                {errors && errors.transaction_date && (
                                    <div className="text-red-700 text-sm mt-2">
                                        {errors.transaction_date}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-wrap -mx-3 mb-6">
                            <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                                <label
                                    className="block uppercase tracking-wide text-black text-xs font-bold mb-2"
                                    htmlFor="grid-transaction-note"
                                >
                                    Note
                                </label>
                                <textarea
                                    className="appearance-none block w-full bg-white text-black border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                    id="grid-transaction-note"
                                    name="transaction_note"
                                    value={dataProps.transaction_note ?? ""}
                                    disabled={
                                        transaction.deleted_at || isProcessing || transaction.approve_transaction_date
                                    }
                                    onChange={(event) => handleChange(event)} />
                                {errors && errors.transaction_note && (
                                    <div className="text-red-700 text-sm mt-2">
                                        {errors.transaction_note}
                                    </div>
                                )}
                            </div>
                            
                            <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                                <label
                                    className="block uppercase tracking-wide text-black text-xs font-bold mb-2"
                                    htmlFor="grid-customer"
                                >
                                    Customer
                                </label>
                                <div className="inline-block relative w-full">
                                    <Select
                                        name="customer_id"
                                        options={customerOptions}
                                        className="basic-single"
                                        classNamePrefix="select"
                                        onChange={(selectedOption) => handleOptionChange(selectedOption, 'customer_id')}
                                        defaultValue={seletedSupplierOption}
                                        isDisabled={transaction.deleted_at || isProcessing || transaction.approve_order_date || transaction.approve_transaction_date  }
                                        isClearable={true} 
                                    />
                                </div>
                                {errors && errors.customer_id && (
                                    <div className="text-red-700 text-sm mt-2">
                                        {errors.customer_id}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-wrap -mx-3 mb-6">
                            <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                                <label
                                    className="block uppercase tracking-wide text-black text-xs font-bold mb-2"
                                    htmlFor="grid-customer"
                                >
                                    Status
                                </label>
                                <div className="inline-block relative w-full">
                                    <Select
                                        name="payment_status_id"
                                        options={paymentStatusOptions}
                                        className="basic-single"
                                        classNamePrefix="select"
                                        onChange={(selectedOption) => handleOptionChange(selectedOption, 'payment_status_id')}
                                        defaultValue={seletedPaymentStatusOption }
                                        isDisabled={transaction.deleted_at || isProcessing || transaction.approve_transaction_date }
                                    />
                                </div>
                                {errors && errors.payment_status_id && (
                                    <div className="text-red-700 text-sm mt-2">
                                        {errors.payment_status_id}
                                    </div>
                                )}
                            </div>
    
                            <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                                <label
                                    className="block uppercase tracking-wide text-black text-xs font-bold mb-2"
                                    htmlFor="grid-name"
                                >
                                    PPn
                                </label>
                                <input
                                    className="appearance-none block w-full bg-white text-black border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                    id="grid-transaction-discount"
                                    name="ppn"
                                    value={isEditNumberInput == 'ppn'? dataProps.ppn : Number(dataProps.ppn).toLocaleString()}
                                    type={isEditNumberInput == 'ppn' ? "number" : "text"}
                                    step="0.1"
                                    min="0"                                    
                                    disabled={transaction.deleted_at || isProcessing || transaction.approve_transaction_date || auth.user.role != 'superadmin'}
                                    onFocus={(event) => setIsEditNumberInput(event.target.name)}
                                    onBlur={() => setIsEditNumberInput("")}
                                    onChange={(event) => handleChange(event)}                                
                                />
                                {errors && errors.ppn && (
                                    <div className="text-red-700 text-sm mt-2">
                                        {errors.ppn}
                                    </div>
                                )}
                            </div>                                   
                        </div>
                        <div className="flex flex-wrap -mx-3 mb-6">
                            <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                                <label
                                    className="block uppercase tracking-wide text-black text-xs font-bold mb-2"
                                    htmlFor="grid-name"
                                >
                                    Discount
                                </label>
                                <input
                                    className="appearance-none block w-full bg-white text-black border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                    id="grid-transaction-discount"
                                    name="discount"
                                    value={isEditNumberInput == 'discount'? dataProps.discount : Number(dataProps.discount).toLocaleString()}
                                    type={isEditNumberInput == 'discount' ? "number" : "text"}
                                    step="0.1"
                                    min="0"                                    
                                    disabled={transaction.deleted_at || isProcessing || transaction.approve_transaction_date}
                                    onFocus={(event) => setIsEditNumberInput(event.target.name)}
                                    onBlur={() => setIsEditNumberInput("")}
                                    onChange={(event) => handleChange(event)}                                
                                />
                                {errors && errors.discount && (
                                    <div className="text-red-700 text-sm mt-2">
                                        {errors.discount}
                                    </div>
                                )}
                            </div>
                            <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                                <label
                                    className="block uppercase tracking-wide text-black text-xs font-bold mb-2"
                                    htmlFor="grid-name"
                                >
                                    Discount Percent
                                </label>
                                <input
                                    className="appearance-none block w-full bg-white text-black border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                    id="grid-transaction-discount"
                                    name="discount_percent"
                                    value={isEditNumberInput == 'discount_percent'? dataProps.discount_percent : Number(dataProps.discount_percent).toLocaleString()}
                                    type={isEditNumberInput == 'discount_percent' ? "number" : "text"}
                                    step="0.1"
                                    min="0"                                    
                                    disabled={transaction.deleted_at || isProcessing || transaction.approve_transaction_date}
                                    onFocus={(event) => setIsEditNumberInput(event.target.name)}
                                    onBlur={() => setIsEditNumberInput("")}
                                    onChange={(event) => handleChange(event)}                                
                                />
                                {errors && errors.discount_percent && (
                                    <div className="text-red-700 text-sm mt-2">
                                        {errors.discount_percent}
                                    </div>
                                )}
                            </div>                               
                        </div>


                        <div className="mt-4 flex justify-end">
                            {!transaction.approve_transaction_date ?
                                <button
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mr-4"
                                    type="submit"
                                    disabled={isProcessing}
                                >
                                    {transaction &&
                                        transaction.id &&
                                        transaction.deleted_at
                                        ? "Restore"
                                        : "Save"}
                                </button> :
                                <button
                                    className="print:hidden bg-blue-500 text-white font-bold  py-1 px-2   mr-2 rounded hover:bg-blue-700"
                                    onClick={() => window.print()}
                                >
                                    Print
                                </button>
                            }
                                <Link href={previousUrl} className="print:hidden  bg-red-500 text-white font-bold py-1 px-2 rounded hover:bg-red-700">
                                    Back
                                </Link>

                        </div>
                    </form>
                ) : <div className="text-sm text-right mr-3" onClick={toggleCollapse}>Click to more transaction information</div> }
            </div>    

            <Detail transaction={transaction} products={ products } transactionDetails={transactionDetails} />

        </AdminLayout>
    );
};

export default Form;
