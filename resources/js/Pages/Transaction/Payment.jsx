import UpdateConfirmation from '@/Components/UpdateConfirmation';
import { router } from '@inertiajs/react';
import React, { useEffect, useState } from 'react'
import Select from "react-select";

const Payment = ({ setShowPaymentForm, dataProps, totalSum, errors, setIsProcessing, isProcessing, transaction, paymentStatusOptions, handleChange, selectedPaymentStatusOption, isEditNumberInput, auth, handleOptionChange, setIsEditNumberInput }) => {

    const calculateGrandTotal = () => {
        return Math.round((totalSum - dataProps.discount - (totalSum * dataProps.discount_percent / 100)) + ((totalSum - dataProps.discount - (totalSum * dataProps.discount_percent / 100)) * dataProps.ppn / 100));
    }

    const [showUpdateConfirmation, setShowUpdateConfirmation] = useState(false);  
    const [grandTotal, setGrandtotal] = useState(transaction.grand_total);
    const updatedDataProps = {
        ...dataProps,
        grandTotal,
        approveParameter:1
    };

    const approveOrder = (e) => {
        e.preventDefault();
        setIsProcessing(true);
        router.put(`/transaction/${dataProps.id}`, updatedDataProps, {
            onSuccess: () => {
                setShowPaymentForm(false);  
            },
            onFinish:()=> {
                setIsProcessing(false);
                setShowUpdateConfirmation(false);
            }
        });            
    }

    useEffect(() => {
        setGrandtotal(calculateGrandTotal());
    }, [dataProps]);

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">

            {showUpdateConfirmation && <UpdateConfirmation setShowUpdateConfirmation={setShowUpdateConfirmation} dataProps={dataProps} handleUpdate={approveOrder} isProcessing={isProcessing}/>}    

            <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6">

                <h2 className="text-3xl font-semibold mb-5 text-center">
                    Payment
                    <hr/>
                </h2>

                <div className="max-w-4xl mx-auto">
                    {/* <form
                        className="w-full"
                        onSubmit={(event) => approveOrder(event)}
                        autoComplete="off"
                    > */}
                        <div className="flex flex-wrap -mx-3 mb-2">
                            <div className="w-full flex items-center mb-2">
                                <label
                                    className="block uppercase tracking-wide text-black text-xs font-bold mr-2 w-2/6 text-right"
                                    htmlFor="grid-customer"
                                >
                                    Method
                                </label>
                                <div className="inline-block relative w-4/6">
                                    <Select
                                        name="payment_status_id"
                                        options={paymentStatusOptions}
                                        className="basic-single"
                                        classNamePrefix="select"
                                        onChange={(selectedOption) => handleOptionChange(selectedOption, 'payment_status_id')}
                                        defaultValue={selectedPaymentStatusOption}
                                        isDisabled={transaction.deleted_at || isProcessing || transaction.approve_transaction_date || showUpdateConfirmation}
                                        styles={{
                                            control: (base) => ({
                                                ...base,
                                                backgroundColor: showUpdateConfirmation ? 'rgba(0, 0, 0, 0.5)' : base.backgroundColor, // Mengatur background agar terlihat gelap
                                                color: showUpdateConfirmation ? '#999' : base.color, // Ubah warna teks agar lebih terang
                                                borderColor: showUpdateConfirmation ? '#444' : base.borderColor, // Ubah border agar lebih sesuai dengan latar belakang modal
                                                pointerEvents: showUpdateConfirmation ? 'none' : 'auto', // Menonaktifkan interaksi jika modal terbuka
                                            }),
                                            singleValue: (base) => ({
                                                ...base,
                                                color: showUpdateConfirmation ? '#999' : base.color, // Sesuaikan warna teks dengan latar belakang
                                            }),
                                            menu: (base) => ({
                                                ...base,
                                                zIndex: 5, // Pastikan dropdown tidak muncul di atas modal
                                            }),
                                        }}
                                    />
                                </div>
                            </div>
                            {errors && errors.payment_status_id && (
                                <div className="text-red-700 text-sm mt-1 ml-1">
                                    {errors.payment_status_id}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-wrap -mx-3 mb-2">
                            <div className="w-full flex items-center mb-2">
                                <label
                                    className="block uppercase tracking-wide text-black text-xs font-bold mr-2 w-2/6 text-right"
                                    htmlFor="grid-name"
                                >
                                    PPn
                                </label>
                                <input
                                    className="appearance-none block w-4/6 bg-white text-black border border-gray-200 rounded py-2 px-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                    id="grid-transaction-discount"
                                    name="ppn"
                                    value={isEditNumberInput == 'ppn' ? dataProps.ppn : Number(dataProps.ppn).toLocaleString()}
                                    type={isEditNumberInput == 'ppn' ? "number" : "text"}
                                    step="0.1"
                                    min="0"
                                    disabled={transaction.deleted_at || isProcessing || transaction.approve_transaction_date || auth.user.role != 'superadmin'}
                                    onFocus={(event) => setIsEditNumberInput(event.target.name)}
                                    onBlur={() => setIsEditNumberInput("")}
                                    onChange={(event) => handleChange(event)}
                                />
                            </div>
                            {errors && errors.ppn && (
                                <div className="text-red-700 text-sm mt-1 ml-1">
                                    {errors.ppn}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-wrap -mx-3 mb-2">
                            <div className="w-full flex items-center mb-2">
                                <label
                                    className="block uppercase tracking-wide text-black text-xs font-bold mr-2 w-2/6 text-right"
                                    htmlFor="grid-name"
                                >
                                    Discount
                                </label>
                                <input
                                    className="appearance-none block w-4/6 bg-white text-black border border-gray-200 rounded py-2 px-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                    id="grid-transaction-discount"
                                    name="discount"
                                    value={isEditNumberInput == 'discount' ? dataProps.discount : Number(dataProps.discount).toLocaleString()}
                                    type={isEditNumberInput == 'discount' ? "number" : "text"}
                                    step="0.1"
                                    min="0"
                                    disabled={transaction.deleted_at || isProcessing || transaction.approve_transaction_date}
                                    onFocus={(event) => setIsEditNumberInput(event.target.name)}
                                    onBlur={() => setIsEditNumberInput("")}
                                    onChange={(event) => handleChange(event)}
                                />
                            </div>
                            {errors && errors.discount && (
                                <div className="text-red-700 text-sm mt-1 ml-1">
                                    {errors.discount}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-wrap -mx-3 mb-2">
                            <div className="w-full flex items-center mb-2">
                                <label
                                    className="block uppercase tracking-wide text-black text-xs font-bold mr-2 w-2/6 text-right"
                                    htmlFor="grid-name"
                                >
                                    Discount %
                                </label>
                                <input
                                    className="appearance-none block w-4/6 bg-white text-black border border-gray-200 rounded py-2 px-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                    id="grid-transaction-discount"
                                    name="discount_percent"
                                    value={isEditNumberInput == 'discount_percent' ? dataProps.discount_percent : Number(dataProps.discount_percent).toLocaleString()}
                                    type={isEditNumberInput == 'discount_percent' ? "number" : "text"}
                                    step="0.1"
                                    min="0"
                                    disabled={transaction.deleted_at || isProcessing || transaction.approve_transaction_date}
                                    onFocus={(event) => setIsEditNumberInput(event.target.name)}
                                    onBlur={() => setIsEditNumberInput("")}
                                    onChange={(event) => handleChange(event)}
                                />
                            </div>
                            {errors && errors.discount_percent && (
                                <div className="text-red-700 text-sm mt-1 ml-1">
                                    {errors.discount_percent}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-wrap -mx-3 mb-2">
                            <div className="w-full flex items-center mb-2">
                                <label
                                    className="block uppercase tracking-wide text-black text-lg font-bold mr-2 w-2/6 text-right"
                                    htmlFor="grid-grand-total-payment"
                                >
                                    Grand Total
                                </label>
                                <input
                                    className="appearance-none block w-4/6 bg-white text-black border border-gray-200 rounded py-2 px-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 text-2xl"
                                    id="grid-grand-total-payment"
                                    name="discount"
                                    value={Number(grandTotal).toLocaleString()}
                                    type={"text"}
                                    disabled={true}
                                />
                            </div>
                        </div>
                        <div className="flex flex-wrap -mx-3 mb-2">
                            <div className="w-full flex items-center mb-2">
                                <label
                                    className="block uppercase tracking-wide text-black text-lg font-bold mr-2 w-2/6 text-right"
                                    htmlFor="grid-name"
                                >
                                    Payment
                                </label>
                                <input
                                    className="appearance-none block w-4/6 bg-white text-black border border-gray-200 rounded py-2 px-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 text-2xl"
                                    id="grid-transaction-discount"
                                    name="payment"
                                    value={isEditNumberInput == 'payment' ? dataProps.payment : Number(dataProps.payment).toLocaleString()}
                                    type={isEditNumberInput == 'payment' ? "number" : "text"}
                                    step="0.1"
                                    min="0"
                                    disabled={transaction.deleted_at || isProcessing || transaction.approve_transaction_date}
                                    onFocus={(event) => { setIsEditNumberInput(event.target.name); event.target.select(); }}
                                    onBlur={() => setIsEditNumberInput("")}
                                    onChange={(event) => handleChange(event)}
                                    autoFocus 
                                />
                            </div>
                            {errors && errors.payment && (
                                <div className="text-red-700 text-sm mt-1 ml-1">
                                    {errors.payment}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-wrap -mx-3 mb-2">
                            <div className="w-full flex items-center mb-2">
                                <label
                                    className="block uppercase tracking-wide text-black text-lg font-bold mr-2 w-2/6 text-right"
                                    htmlFor="grid-change"
                                >
                                    Change
                                </label>
                                <input
                                    className="appearance-none block w-4/6 bg-white text-black border border-gray-200 rounded py-2 px-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 text-2xl"
                                    id="grid-change"
                                    name="change"
                                    value={Number(dataProps.change).toLocaleString()}
                                    type={"text"}
                                    disabled={true}
                                />
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end">
                            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mr-2" type="button" onClick={() => setShowUpdateConfirmation(true)} disabled={isProcessing}>
                                Approve
                            </button>
                            <button
                                onClick={() => setShowPaymentForm(false)}
                                className="bg-red-500 text-white font-bold py-1 px-2 rounded"
                                disabled={isProcessing}
                            >
                                Close
                            </button>
                        </div>
                    {/* </form> */}
                </div>


            </div>
        </div>
    );
}

export default Payment