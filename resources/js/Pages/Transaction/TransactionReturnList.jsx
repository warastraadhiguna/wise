import DeleteConfirmation from "@/Components/DeleteConfirmation";
import { router, usePage } from "@inertiajs/react";
import dateFormat from "dateformat";
import React, { useEffect, useState } from "react";
import { FaRegTrashAlt } from "react-icons/fa";
import { MdOutlineAddCircleOutline } from "react-icons/md";

const TransactionReturnList = ({ setShowTransactionReturnList, transactionDetail, flash }) => {
    const { errors } = usePage().props;    
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [showTransactionReturnForm, setShowTransactionReturnForm] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const defaultValueData = {
        transaction_detail_id: transactionDetail.id,
        quantity: 0,
        rest: transactionDetail.quantity - (transactionDetail.transaction_detail_returns_sum_quantity?? 0),      
    };
    const [dataProps, setDataProps] = useState(defaultValueData);
    const [transactionReturns, setTransactionReturns] = useState([]);
    const [isEditNumberInput, setIsEditNumberInput] = useState("");  
    // console.log(defaultValueData);
    const handleDelete = () => {
        setIsProcessing(true);

        router.delete(`/transaction-detail-return/${dataProps.id}`, {
            onSuccess: (response) =>{
                setTransactionReturns((prevTransactionReturns) =>
                    prevTransactionReturns.filter(
                        (transactionReturn) => transactionReturn.id !== dataProps.id
                    )
                );

                setDataProps((prevData) => ({
                    ...defaultValueData,
                    "rest" : prevData.rest + prevData.quantity
                }));   
            },
            onFinish: () => {
                setShowDeleteConfirmation(false);
                setIsProcessing(false);
            },
        });
    };

    const handleSaveTransactionReturn = (e) => {
        e.preventDefault();
        // console.log("asdf");
        router.post("/transaction-detail-return", dataProps, {
            onSuccess: (response) => {
                const trans = response.props.transactionDetails.find(
                    (trans) => trans.id === transactionDetail.id
                );

                if (trans) {
                    setTransactionReturns(trans.transaction_detail_returns);
                }
                setShowTransactionReturnForm(false);
                setDataProps((prevData) => ({
                    ...defaultValueData,
                    "rest" : prevData.rest - prevData.quantity
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

    const handleDeleteConfirmation = (transactionReturn) => {
        setShowDeleteConfirmation(true);
        setDataProps((prevData) => ({
            ...prevData,
            "id": transactionReturn.id,
            "quantity" : transactionReturn.quantity
        }));
    };

    useEffect(() => {
        setTransactionReturns(transactionDetail.transaction_detail_returns);
        setDataProps(defaultValueData);
    }, [transactionDetail]);
        // console.log(transactionReturns);
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            {showDeleteConfirmation ? (
                <DeleteConfirmation
                    setShowDeleteConfirmation={setShowDeleteConfirmation}
                    dataProps={dataProps}
                    handleDelete={handleDelete}
                    isProcessing={isProcessing}
                />
            ) : showTransactionReturnForm ? (
            <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6">
                <h2 className="text-3xl font-semibold mb-5 text-center">
                    Transaction Return
                    <hr/>
                </h2>

                <div className="max-w-4xl mx-auto">
        
                        <div className="flex flex-wrap -mx-3 mb-2">
                            <div className="w-full flex items-center mb-2">
                                <label
                                    className="block uppercase tracking-wide text-black text-lg font-bold mr-2 w-2/6 text-right"
                                    htmlFor="grid-grand-total-transactionReturn"
                                >
                                    Rest
                                </label>
                                <input
                                    className="appearance-none block w-4/6 bg-white text-black border border-gray-200 rounded py-2 px-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 text-2xl"
                                    id="grid-rest"
                                    name="rest"
                                    value={Number(dataProps.rest).toLocaleString()}
                                    type={"text"}
                                    disabled={true}
                                />
                            </div>
                        </div>
                        <div className="flex flex-wrap -mx-3 mb-2">
                            <div className="w-full flex items-center mb-2">
                                <label
                                    className="block uppercase tracking-wide text-black text-lg font-bold mr-2 w-2/6 text-right"
                                    htmlFor="grid-quality"
                                >
                                    Quantity
                                </label>
                                <input
                                    className="appearance-none block w-4/6 bg-white text-black border border-gray-200 rounded py-2 px-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 text-2xl"
                                    id="grid-detail-transaction-discount"
                                    name="quantity"
                                    value={isEditNumberInput == 'quantity' ? dataProps.quantity : Number(dataProps.quantity).toLocaleString()}
                                    type={isEditNumberInput == 'quantity' ? "number" : "text"}
                                    step="0.1"
                                    min="0"
                                    disabled={transactionDetail.deleted_at || isProcessing}
                                    onFocus={(event) => { setIsEditNumberInput(event.target.name); event.target.select(); }}
                                    onBlur={() => setIsEditNumberInput("")}
                                    onChange={(event) => handleChange(event)}
                                    autoFocus 
                                />
                            </div>
                            {errors && errors.quantity && (
                                <div className="text-red-700 text-sm mt-1 ml-1">
                                    {errors.quantity}
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
                            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mr-2" type="button" onClick={(event) => handleSaveTransactionReturn(event)} disabled={isProcessing}>
                                Save
                            </button>
                            <button
                                onClick={() => setShowTransactionReturnForm(false)}
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
                        onClick={() => setShowTransactionReturnList(false)}
                        className="absolute top-0 right-0 mt-3 mr-3 text-gray-600 hover:text-gray-900 focus:outline-none text-2xl"
                    >
                        &times;
                    </button>

                    <h2 className="text-3xl font-semibold mb-5 text-center">
                        Transaction Return
                        <hr />
                    </h2>

                    <div className="relative overflow-y-auto max-h-[65vh]">
                        {dataProps.rest > 0 &&
                        <MdOutlineAddCircleOutline
                            size={40}
                            color="blue"
                            className="cursor-pointer ml-3 mb-3"
                            onClick={()=>setShowTransactionReturnForm(true)}
                        />  }

                        <table className="w-full text-sm text-left rtl:text-right text-black dark:text-gray-400 mb-10">
                            <thead className="text-xs text-black btransactionReturn-b uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th scope="col" className="px-6 py-3">
                                        No
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        User
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        Quantity
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
                                {transactionReturns.map((transactionReturn, i) => (
                                        <tr
                                            key={i}
                                            className={`bg-white btransactionReturn-b dark:bg-gray-800 dark:btransactionReturn-gray-700  ${
                                                transactionReturn.deleted_at
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
                                                {transactionReturn.user.name}
                                            </td>
                                            <td className="px-6 py-4">
                                                {Number(
                                                    transactionReturn.quantity
                                                ).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                {transactionReturn.note}
                                            </td>                                            
                                            <td className="px-6 py-4">
                                                {dateFormat(
                                                    transactionReturn.created_at,
                                                    "dd-mm-yyyy H:M:s"
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <FaRegTrashAlt
                                                    size={20}
                                                    color={
                                                        transactionReturn.deleted_at
                                                            ? "#e18859"
                                                            : "red"
                                                    }
                                                    className="cursor-pointer"
                                                    onClick={() =>
                                                        handleDeleteConfirmation(
                                                            transactionReturn
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

export default TransactionReturnList;
