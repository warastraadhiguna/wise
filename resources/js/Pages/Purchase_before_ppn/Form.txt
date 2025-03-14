import AdminLayout from "@/Layouts/AdminLayout";
import { Link, router, usePage } from "@inertiajs/react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Select from "react-select";
import Detail from "./Detail";
import { FiChevronUp, FiChevronDown } from 'react-icons/fi'; 
import Payment from "./Payment";

const Form = ({ title, purchase, previousUrl, suppliers, products, purchaseDetails, paymentStatuses}) => {

    const { flash, errors,auth } = usePage().props;
    const [isEditNumberInput, setIsEditNumberInput] = useState("");        
    const [isOrderCollapsed, setIsOrderCollapsed] = useState(purchase.supplier_id && purchase.approve_order_date); 

    const [showPaymentForm, setShowPaymentForm] = useState(false);  
    const [isCollapsed, setIsCollapsed] = useState(purchase.supplier_id && purchase.purchase_date);     
    const [totalSum, setTotalSum] = useState(0);
    const [grandtotal, setGrandtotal] = useState(0);

    useEffect(() => {
        const total = purchaseDetails.reduce((acc, purchaseDetail) => {
            const totalPerRow = purchaseDetail.quantity * (purchaseDetail.price - purchaseDetail.discount - (purchaseDetail.price * purchaseDetail.discount_percent / 100));
            return acc + totalPerRow;
        }, 0);
        setTotalSum(total);
        const grandTotal = total - purchase.discount - (total * purchase.discount_percent / 100);
        setGrandtotal(grandTotal + grandTotal*purchase.ppn/100);
    }, [purchaseDetails]);

    
    const toggleOrderCollapse = () => {
        setIsOrderCollapsed(!isOrderCollapsed); 
    };

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed); 
    };    
    
    const [dataProps, setDataProps] = useState({
        id: purchase.id, 
        supplier_id: purchase.supplier_id, 
        purchase_number: purchase.purchase_number, 
        purchase_date: purchase.purchase_date, 
        purchase_note: purchase.purchase_note, 
        payment_status_id: purchase.payment_status_id,
        discount: purchase.discount,
        discount_percent: purchase.discount_percent,
        ppn: purchase.ppn,
        payment: 0,
        change:0,        
    });

    const supplierOptions = Object.keys(suppliers).map((key) => ({
        value: suppliers[key].id,
        label: suppliers[key].name + " - " + suppliers[key].company_name,
    }));    

    const paymentStatusOptions = Object.keys(paymentStatuses).filter((key) => paymentStatuses[key].is_purchase === 1).map((key) => ({
        value: paymentStatuses[key].id,
        label: paymentStatuses[key].name.toUpperCase(),
    }));        

    const selectedSupplierOption = supplierOptions.find(option => option.value === purchase.supplier_id);
    const selectedPaymentStatusOption = paymentStatusOptions.find(option => option.value === purchase.payment_status_id);
    
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
            [name]: selectedOption.value,
            payment: 0,
            change:0,            
        }));
    };    

    const actionForm = (e) => {
        e.preventDefault();        
        setIsProcessing(true);

        router.put(`/purchase/${dataProps.id}`, dataProps, {
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
            {purchase.order_number &&
                <div className="print:hidden w-full mx-auto  border-2 border-gray-300 p-5 relative">
                    <button 
                        className="absolute right-2 top-2 text-gray-600"
                        onClick={toggleOrderCollapse}
                    >
                        {isOrderCollapsed ? <FiChevronDown size={24} /> : <FiChevronUp size={24} />}
                    </button>

                    {!isOrderCollapsed || purchase.deleted_at ? (
                        <div
                            className="w-full"
                        >
                            <div className="flex flex-wrap -mx-3 mb-6">
                                <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                                    <label
                                        className="block uppercase tracking-wide text-black text-xs font-bold mb-2"
                                        htmlFor="grid-name"
                                    >
                                        Order Number
                                    </label>
                                    <input
                                        className="appearance-none block w-full bg-white text-black border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                        id="grid-purchase-number"
                                        name="order_number"
                                        value={purchase.order_number}
                                        type="text"
                                        disabled={true}
                                        onChange={(event) => handleChange(event)}
                                    />
                                    {errors && errors.order_number && (
                                        <div className="text-red-700 text-sm mt-2">
                                            {errors.order_number}
                                        </div>
                                    )}
                                </div>
                                <div className="w-full md:w-1/2 px-3">
                                    <label
                                        className="block uppercase tracking-wide text-black text-xs font-bold mb-2"
                                        htmlFor="grid-purchase-date"
                                    >
                                        Order Date
                                    </label>
                                    <input
                                        className="appearance-none block w-full bg-white text-black border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                        id="grid-purchase-date"
                                        type="date"
                                        name="order_date"
                                        value={purchase.order_date}
                                        disabled={true}
                                        onChange={(event) => handleChange(event)}
                                    />
                                    {errors && errors.order_date && (
                                        <div className="text-red-700 text-sm mt-2">
                                            {errors.order_date}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-wrap -mx-3 mb-6">
                                <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                                    <label
                                        className="block uppercase tracking-wide text-black text-xs font-bold mb-2"
                                        htmlFor="grid-purchase-note"
                                    >
                                        Note
                                    </label>
                                    <textarea
                                        className="appearance-none block w-full bg-white text-black border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                        id="grid-purchase-note"
                                        name="order_note"
                                        value={purchase.order_note ?? ""}
                                        disabled={
                                            purchase.deleted_at || isProcessing || purchase.approve_order_date
                                        }
                                        onChange={(event) => handleChange(event)} />
                                    {errors && errors.order_note && (
                                        <div className="text-red-700 text-sm mt-2">
                                            {errors.order_note}
                                        </div>
                                    )}
                                </div>
                                <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                                    <label
                                        className="block uppercase tracking-wide text-black text-xs font-bold mb-2"
                                        htmlFor="grid-supplier"
                                    >
                                        Supplier
                                    </label>
                                    <div className="inline-block relative w-full">
                                        <Select
                                            name="supplier_id"
                                            options={supplierOptions}
                                            className="basic-single"
                                            classNamePrefix="select"
                                            onChange={handleOptionChange}
                                            defaultValue={selectedSupplierOption}
                                            isDisabled={purchase.deleted_at || isProcessing || purchase.approve_order_date }
                                        />
                                    </div>
                                    {errors && errors.supplier_id && (
                                        <div className="text-red-700 text-sm mt-2">
                                            {errors.supplier_id}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : <div className="text-sm text-right mr-3" onClick={toggleOrderCollapse}>Click to more order information</div> }
                </div>    
            }

            <div className="w-full mx-auto  border-2 border-gray-300 p-5 relative">
                <button 
                    className="absolute right-2 top-2 text-gray-600"
                    onClick={toggleCollapse}
                >
                    {isCollapsed ? <FiChevronDown size={24} /> : <FiChevronUp size={24} />}
                </button>

                {!isCollapsed || purchase.deleted_at ? (
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
                                    id="grid-purchase-number"
                                    name="purchase_number"
                                    value={dataProps.purchase_number?? ""}
                                    type="text"
                                    // disabled={true}
                                    onChange={(event) => handleChange(event)}
                                />
                                {errors && errors.purchase_number && (
                                    <div className="text-red-700 text-sm mt-2">
                                        {errors.purchase_number}
                                    </div>
                                )}
                            </div>
                            <div className="w-full md:w-1/2 px-3">
                                <label
                                    className="block uppercase tracking-wide text-black text-xs font-bold mb-2"
                                    htmlFor="grid-purchase-date"
                                >
                                    purchase Date
                                </label>
                                <input
                                    className="appearance-none block w-full bg-white text-black border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                    id="grid-purchase-date"
                                    type="date"
                                    name="purchase_date"
                                    value={dataProps.purchase_date}
                                    disabled={
                                        purchase.deleted_at || isProcessing || purchase.approve_purchase_date
                                    }
                                    onChange={(event) => handleChange(event)}
                                />
                                {errors && errors.purchase_date && (
                                    <div className="text-red-700 text-sm mt-2">
                                        {errors.purchase_date}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-wrap -mx-3 mb-6">
                            <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                                <label
                                    className="block uppercase tracking-wide text-black text-xs font-bold mb-2"
                                    htmlFor="grid-purchase-note"
                                >
                                    Note
                                </label>
                                <textarea
                                    className="appearance-none block w-full bg-white text-black border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                    id="grid-purchase-note"
                                    name="purchase_note"
                                    value={dataProps.purchase_note ?? ""}
                                    disabled={
                                        purchase.deleted_at || isProcessing || purchase.approve_purchase_date
                                    }
                                    onChange={(event) => handleChange(event)} />
                                {errors && errors.purchase_note && (
                                    <div className="text-red-700 text-sm mt-2">
                                        {errors.purchase_note}
                                    </div>
                                )}
                            </div>
                            
                            <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                                <label
                                    className="block uppercase tracking-wide text-black text-xs font-bold mb-2"
                                    htmlFor="grid-supplier"
                                >
                                    Supplier
                                </label>
                                <div className="inline-block relative w-full">
                                    <Select
                                        name="supplier_id"
                                        options={supplierOptions}
                                        className="basic-single"
                                        classNamePrefix="select"
                                        onChange={(selectedOption) => handleOptionChange(selectedOption, 'supplier_id')}
                                        defaultValue={selectedSupplierOption}
                                        isDisabled={purchase.deleted_at || isProcessing || purchase.approve_order_date || purchase.approve_purchase_date  }
                                    />
                                </div>
                                {errors && errors.supplier_id && (
                                    <div className="text-red-700 text-sm mt-2">
                                        {errors.supplier_id}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-wrap -mx-3 mb-6">
                            <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                                <label
                                    className="block uppercase tracking-wide text-black text-xs font-bold mb-2"
                                    htmlFor="grid-supplier"
                                >
                                    Payment
                                </label>
                                <div className="inline-block relative w-full">
                                    <Select
                                        name="payment_status_id"
                                        options={paymentStatusOptions}
                                        className="basic-single"
                                        classNamePrefix="select"
                                        onChange={(selectedOption) => handleOptionChange(selectedOption, 'payment_status_id')}
                                        defaultValue={selectedPaymentStatusOption }
                                        isDisabled={purchase.deleted_at || isProcessing || purchase.approve_purchase_date }
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
                                    id="grid-purchase-discount"
                                    name="ppn"
                                    value={isEditNumberInput == 'ppn'? dataProps.ppn : Number(dataProps.ppn).toLocaleString()}
                                    type={isEditNumberInput == 'ppn' ? "number" : "text"}
                                    step="0.1"
                                    min="0"                                    
                                    disabled={purchase.deleted_at || isProcessing || purchase.approve_purchase_date || auth.user.role != 'superadmin'}
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
                                    id="grid-purchase-discount"
                                    name="discount"
                                    value={isEditNumberInput == 'discount'? dataProps.discount : Number(dataProps.discount).toLocaleString()}
                                    type={isEditNumberInput == 'discount' ? "number" : "text"}
                                    step="0.1"
                                    min="0"                                    
                                    disabled={purchase.deleted_at || isProcessing || purchase.approve_purchase_date}
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
                                    id="grid-purchase-discount"
                                    name="discount_percent"
                                    value={isEditNumberInput == 'discount_percent'? dataProps.discount_percent : Number(dataProps.discount_percent).toLocaleString()}
                                    type={isEditNumberInput == 'discount_percent' ? "number" : "text"}
                                    step="0.1"
                                    min="0"                                    
                                    disabled={purchase.deleted_at || isProcessing || purchase.approve_purchase_date}
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
                            {!purchase.approve_purchase_date ?
                                <button
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mr-4"
                                    type="submit"
                                    disabled={isProcessing}
                                >
                                    {purchase &&
                                        purchase.id &&
                                        purchase.deleted_at
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
                ) : <div className="text-sm text-right mr-3" onClick={toggleCollapse}>Click to more purchase information</div> }
            </div>    

            {purchase.supplier_id && purchase.purchase_date && purchase.purchase_number  &&
                <Detail purchase={purchase} products={products} purchaseDetails={purchaseDetails} setShowPaymentForm={setShowPaymentForm} totalSum={totalSum} grandtotal={grandtotal} flash={ flash } />
            }                    

            {purchase.supplier_id && purchase.purchase_date && purchase.purchase_number && showPaymentForm && <Payment setShowPaymentForm={setShowPaymentForm} dataProps={dataProps} totalSum={totalSum} errors={errors} setIsProcessing={setIsProcessing } isProcessing={isProcessing} purchase={purchase} paymentStatusOptions={paymentStatusOptions} handleChange={handleChange} selectedPaymentStatusOption={selectedPaymentStatusOption} isEditNumberInput={isEditNumberInput} auth={auth} handleOptionChange={handleOptionChange} setIsEditNumberInput={setIsEditNumberInput} /> }              
        </AdminLayout>
    );
};

export default Form;
