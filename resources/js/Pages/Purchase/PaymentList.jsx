import DeleteConfirmation from "@/Components/DeleteConfirmation";
import { router, usePage } from "@inertiajs/react";
import dateFormat from "dateformat";
import React, { useEffect, useState } from "react";
import { FaRegTrashAlt } from "react-icons/fa";
import { MdOutlineAddCircleOutline } from "react-icons/md";

const PaymentList = ({ setShowPaymentList, purchase, flash }) => {
    const { errors } = usePage().props;    
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const defaultValueData = {
        purchase_id: purchase.id,
        payment: 0,
        change: 0,
        unpaid: purchase.grand_total- purchase.purchase_payments_sum_amount,      
        note: ''
    };
    const [dataProps, setDataProps] = useState(defaultValueData);
    const [payments, setPayments] = useState([]);
    const [isEditNumberInput, setIsEditNumberInput] = useState("");  
    // console.log(purchase);
    const handleDelete = () => {
        setIsProcessing(true);

        router.delete(`/purchase-payment/${dataProps.id}`, {
            onSuccess: (response) =>{
                setPayments((prevPayments) =>
                    prevPayments.filter(
                        (payment) => payment.id !== dataProps.id
                    )
                );

                setDataProps((prevData) => ({
                    ...defaultValueData,
                    "unpaid" : prevData.unpaid + prevData.payment
                }));   
            },
            onFinish: () => {
                setShowDeleteConfirmation(false);
                setIsProcessing(false);
            },
        });
    };

    const handleSavePayment = (e) => {
        e.preventDefault();
        // console.log("asdf");
        router.post("/purchase-payment", dataProps, {
            onSuccess: (response) => {
                const trans = response.props.purchases.data.find(
                    (trans) => trans.id === purchase.id
                );

                if (trans) {
                    setPayments(
                        trans.purchase_payments.filter(
                            (payment) => payment.deleted_at === null
                        )
                    );
                }
                setShowPaymentForm(false);
                setDataProps((prevData) => ({
                    ...defaultValueData,
                    "unpaid" : prevData.unpaid - prevData.payment
                }));
            },            
            onFinish: () => {
                flash.success = "";
                flash.error = "";
                setIsEditNumberInput("");     
        }});           
    };    

    const handleChange = (event) => {
        setDataProps((prevData) => ({
            ...prevData,
            [event.target.name]: event.target.value,
        }));
    };    

    const handleDeleteConfirmation = (payment) => {
        setShowDeleteConfirmation(true);
        setDataProps((prevData) => ({
            ...prevData,
            "id": payment.id,
            "payment" : payment.amount
        }));
    };

    useEffect(() => {
        setPayments(
            purchase.purchase_payments.filter(
                (payment) => payment.deleted_at === null
            )
        );
        setDataProps(defaultValueData);
    }, [purchase]);
    
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            {showDeleteConfirmation ? (
                <DeleteConfirmation
                    setShowDeleteConfirmation={setShowDeleteConfirmation}
                    dataProps={dataProps}
                    handleDelete={handleDelete}
                    isProcessing={isProcessing}
                />
            ) : showPaymentForm ? (
                        <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6">

                <h2 className="text-3xl font-semibold mb-5 text-center">
                    Payment
                    <hr/>
                </h2>

                <div className="max-w-4xl mx-auto">
        
                        <div className="flex flex-wrap -mx-3 mb-2">
                            <div className="w-full flex items-center mb-2">
                                <label
                                    className="block uppercase tracking-wide text-black text-lg font-bold mr-2 w-2/6 text-right"
                                    htmlFor="grid-grand-total-payment"
                                >
                                    Unpaid
                                </label>
                                <input
                                    className="appearance-none block w-4/6 bg-white text-black border border-gray-200 rounded py-2 px-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 text-2xl"
                                    id="grid-grand-total-payment"
                                    name="unpaid"
                                    value={Number(dataProps.unpaid).toLocaleString()}
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
                                    id="grid-purchase-discount"
                                    name="payment"
                                    value={isEditNumberInput == 'payment' ? dataProps.payment : Number(dataProps.payment).toLocaleString()}
                                    type={isEditNumberInput == 'payment' ? "number" : "text"}
                                    step="0.1"
                                    min="0"
                                    disabled={purchase.deleted_at || isProcessing}
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
                                    htmlFor="grid-note"
                                >
                                    Note
                                </label>
                                <textarea
                                    className="appearance-none block w-4/6 bg-white text-black border border-gray-200 rounded py-2 px-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 text-2xl"
                                    id="grid-note"
                                    name="note"
                                    value={dataProps.note??""}
                                    disabled={
                                        dataProps.deleted_at || isProcessing
                                    }
                                    onChange={(event) => handleChange(event)}/>
                                {errors && errors.note && (
                                    <div className="text-red-700 text-sm mt-2">
                                        {errors.note}
                                    </div>
                                )}
                            </div>                          
                        </div>                              
                        <div className="mt-4 flex justify-end">
                            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mr-2" type="button" onClick={(event) => handleSavePayment(event)} disabled={isProcessing}>
                                Save
                            </button>
                            <button
                                onClick={() => setShowPaymentForm(false)}
                                className="bg-red-500 text-white font-bold py-1 px-2 rounded"
                                disabled={isProcessing}
                            >
                                Close
                            </button>
                        </div>
                </div>


            </div>
            
            
            ) :
            (
            <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-[75vh] p-6 relative overflow-hidden">
                    <button
                        onClick={() => setShowPaymentList(false)}
                        className="absolute top-0 right-0 mt-3 mr-3 text-gray-600 hover:text-gray-900 focus:outline-none text-2xl"
                    >
                        &times;
                    </button>

                    <h2 className="text-3xl font-semibold mb-5 text-center">
                        Payments
                        <hr />
                    </h2>

                    <div className="relative overflow-y-auto max-h-[65vh]">
                        {dataProps.unpaid > 0 &&                        <MdOutlineAddCircleOutline
                            size={40}
                            color="blue"
                            className="cursor-pointer ml-3 mb-3"
                            onClick={()=>setShowPaymentForm(true)}
                        />  }

                        <table className="w-full text-sm text-left rtl:text-right text-black dark:text-gray-400 mb-10">
                            <thead className="text-xs text-black bpayment-b uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th scope="col" className="px-6 py-3">
                                        No
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        User
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        Amount
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        Note
                                    </th>                                            
                                    <th scope="col" className="px-6 py-3">
                                        Date
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-center"
                                        width="5%"
                                    >
                                        #
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments
                                    .filter(
                                        (payment) => payment.deleted_at === null
                                    )
                                    .map((payment, i) => (
                                        <tr
                                            key={i}
                                            className={`bg-white bpayment-b dark:bg-gray-800 dark:bpayment-gray-700  ${
                                                payment.deleted_at
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
                                                {payment.user.name}
                                            </td>
                                            <td className="px-6 py-4">
                                                {Number(
                                                    payment.amount
                                                ).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                {payment.note}
                                            </td>                                            
                                            <td className="px-6 py-4">
                                                {dateFormat(
                                                    payment.created_at,
                                                    "dd-mm-yyyy H:M:s"
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <FaRegTrashAlt
                                                    size={20}
                                                    color={
                                                        payment.deleted_at
                                                            ? "#e18859"
                                                            : "red"
                                                    }
                                                    className="cursor-pointer"
                                                    onClick={() =>
                                                        handleDeleteConfirmation(
                                                            payment
                                                        )
                                                    }
                                                />
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentList;
