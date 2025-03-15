import AdminLayout from "@/Layouts/AdminLayout";
import { Link, router, usePage } from "@inertiajs/react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Select from "react-select";
import Detail from "./Detail";
import Payment from "./Payment";
import { FiChevronUp, FiChevronDown } from 'react-icons/fi'; 

const Form = ({ title, transaction, previousUrl, customers, products, transactionDetails, paymentStatuses}) => {

    const { flash, errors,auth } = usePage().props;
    const [isEditNumberInput, setIsEditNumberInput] = useState("");  
    const [showPaymentForm, setShowPaymentForm] = useState(false);    
    const [isCollapsed, setIsCollapsed] = useState(transaction.transaction_date);     
    const [totalSum, setTotalSum] = useState(0);
    const [grandtotal, setGrandtotal] = useState(0);

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed); 
    };    

    const [dataProps, setDataProps] = useState({
        id: transaction.id, 
        customer_id: transaction.customer_id, 
        number: transaction.number, 
        transaction_date: transaction.transaction_date, 
        note: transaction.note, 
        payment_status_id: transaction.payment_status_id,
        discount: transaction.discount,
        discount_percent: transaction.discount_percent,
        ppn: transaction.ppn,
        payment: 0,
        change:0,
    });

    const customerOptions = Object.keys(customers).map((key) => ({
        value: customers[key].id,
        label: customers[key].name + " - " + customers[key].company_name,
    }));    

    const paymentStatusOptions = Object.keys(paymentStatuses).filter((key) => paymentStatuses[key].is_sale === 1).map((key) => ({
        value: paymentStatuses[key].id,
        label: paymentStatuses[key].name.toUpperCase(),
    }));        

    const seletedSupplierOption = customerOptions.find(option => option.value === transaction.customer_id);
    const selectedPaymentStatusOption = paymentStatusOptions.find(option => option.value === transaction.payment_status_id);
    
    const [isProcessing, setIsProcessing] = useState(false);

    const handleChange = (event) => {
        if (event.target.name === "payment") {
            setDataProps((prevData) => ({
                ...prevData,
                [event.target.name]: event.target.value,
                change:paymentStatuses.find((status) => status.id === dataProps.payment_status_id).is_done == 1? (grandtotal-event.target.value) : 0
            }));
        } else {
            setDataProps((prevData) => ({
                ...prevData,
                [event.target.name]: event.target.value,
            }));
        }
    };

    const handleOptionChange = (selectedOption, name = "") => {
        setDataProps((prevData) => ({
            ...prevData,
            [name]: selectedOption ? selectedOption.value : null,
            payment: 0,
            change:0,
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

    useEffect(() => {
        const total = transactionDetails.reduce((acc, transactionDetail) => {
            const totalPerRow = transactionDetail.quantity * (transactionDetail.price - transactionDetail.discount - (transactionDetail.price * transactionDetail.discount_percent / 100));
            return acc + totalPerRow;
        }, 0);
        setTotalSum(total);
        const grandTotal = total - transaction.discount - (total * transaction.discount_percent / 100);
        setGrandtotal(Math.round(grandTotal));
    }, [transactionDetails]);

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
                                    Transaction Number
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
                                    value={dataProps.transaction_date }
                                    disabled={
                                        transaction.deleted_at || isProcessing || transaction.approve_transaction_date || auth.user.role === 'user'
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
                                    name="note"
                                    value={dataProps.note ?? ""}
                                    disabled={
                                        transaction.deleted_at || isProcessing || transaction.approve_transaction_date
                                    }
                                    onChange={(event) => handleChange(event)} />
                                {errors && errors.note && (
                                    <div className="text-red-700 text-sm mt-2">
                                        {errors.note}
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
                                    Payment Method
                                </label>
                                <div className="inline-block relative w-full">
                                    <Select
                                        name="payment_status_id"
                                        options={paymentStatusOptions}
                                        className="basic-single"
                                        classNamePrefix="select"
                                        onChange={(selectedOption) => handleOptionChange(selectedOption, 'payment_status_id')}
                                        defaultValue={selectedPaymentStatusOption }
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
                                className="print:hidden bg-blue-500 text-white font-bold py-1 px-2 mr-2 rounded hover:bg-blue-700"
                                    onClick={() => {
                                        const width = 800;
                                        const height = 600;
                                        const left = (window.screen.width / 2) - (width / 2);
                                        const top = (window.screen.height / 2) - (height / 2);                                    
                                        const printWindow = window.open(
                                            `/transaction/${dataProps.id}/print`,
                                            '_blank',
                                            `width=${width},height=${height},top=${top},left=${left}`
                                        );
                                        // Setelah halaman baru selesai dimuat, panggil print()
                                        printWindow.onload = function () {
                                        setTimeout(() => {
                                            printWindow.print();
                                        }, 500); // Delay 500ms, sesuaikan jika perlu
                                        };
                                    }}
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

            <Detail transaction={transaction} products={products} transactionDetails={transactionDetails} setShowPaymentForm={setShowPaymentForm} totalSum={totalSum} grandtotal={grandtotal} flash={ flash } />

            {showPaymentForm && <Payment setShowPaymentForm={setShowPaymentForm} dataProps={dataProps} totalSum={totalSum} errors={errors} setIsProcessing={setIsProcessing } isProcessing={isProcessing} transaction={transaction} paymentStatusOptions={paymentStatusOptions} handleChange={handleChange} selectedPaymentStatusOption={selectedPaymentStatusOption} isEditNumberInput={isEditNumberInput} auth={auth} handleOptionChange={handleOptionChange} setIsEditNumberInput={setIsEditNumberInput} /> }  
        </AdminLayout>
    );
};

export default Form;
