import DeleteConfirmation from "@/Components/DeleteConfirmation";
import { router, usePage } from "@inertiajs/react";
import dateFormat from "dateformat";
import React, { useEffect, useState } from "react";
import { FaRegTrashAlt } from "react-icons/fa";
import { MdOutlineAddCircleOutline } from "react-icons/md";

const PurchaseReturnList = ({ setShowPurchaseReturnList, purchaseDetail, flash }) => {
    const { errors } = usePage().props;    
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [showPurchaseReturnForm, setShowPurchaseReturnForm] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const defaultValueData = {
        purchase_detail_id: purchaseDetail.id,
        quantity: 0,
        rest: purchaseDetail.quantity - (purchaseDetail.purchase_detail_returns_sum_quantity?? 0),      
    };
    const [dataProps, setDataProps] = useState(defaultValueData);
    const [purchaseReturns, setPurchaseReturns] = useState([]);
    const [isEditNumberInput, setIsEditNumberInput] = useState("");  

    const handleDelete = () => {
        setIsProcessing(true);

        router.delete(`/purchase-detail-return/${dataProps.id}`, {
            onSuccess: (response) =>{
                setPurchaseReturns((prevPurchaseReturns) =>
                    prevPurchaseReturns.filter(
                        (purchaseReturn) => purchaseReturn.id !== dataProps.id
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

    const handleSavePurchaseReturn = (e) => {
        e.preventDefault();
        // console.log("asdf");
        router.post("/purchase-detail-return", dataProps, {
            onSuccess: (response) => {
                const trans = response.props.purchaseDetails.find(
                    (trans) => trans.id === purchaseDetail.id
                );

                if (trans) {
                    setPurchaseReturns(trans.purchase_detail_returns);
                }
                setShowPurchaseReturnForm(false);
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

    const handleDeleteConfirmation = (purchaseReturn) => {
        setShowDeleteConfirmation(true);
        setDataProps((prevData) => ({
            ...prevData,
            "id": purchaseReturn.id,
            "quantity" : purchaseReturn.quantity
        }));
    };

    useEffect(() => {
        setPurchaseReturns(purchaseDetail.purchase_detail_returns);
        setDataProps(defaultValueData);
    }, [purchaseDetail]);
        // console.log(purchaseReturns);
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            {showDeleteConfirmation ? (
                <DeleteConfirmation
                    setShowDeleteConfirmation={setShowDeleteConfirmation}
                    dataProps={dataProps}
                    handleDelete={handleDelete}
                    isProcessing={isProcessing}
                />
            ) : showPurchaseReturnForm ? (
            <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6">
                <h2 className="text-3xl font-semibold mb-5 text-center">
                    Purchase Return
                    <hr/>
                </h2>

                <div className="max-w-4xl mx-auto">
        
                        <div className="flex flex-wrap -mx-3 mb-2">
                            <div className="w-full flex items-center mb-2">
                                <label
                                    className="block uppercase tracking-wide text-black text-lg font-bold mr-2 w-2/6 text-right"
                                    htmlFor="grid-grand-total-purchaseReturn"
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
                                    id="grid-detail-purchase-discount"
                                    name="quantity"
                                    value={isEditNumberInput == 'quantity' ? dataProps.quantity : Number(dataProps.quantity).toLocaleString()}
                                    type={isEditNumberInput == 'quantity' ? "number" : "text"}
                                    step="0.1"
                                    min="0"
                                    disabled={purchaseDetail.deleted_at || isProcessing}
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
                            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mr-2" type="button" onClick={(event) => handleSavePurchaseReturn(event)} disabled={isProcessing}>
                                Save
                            </button>
                            <button
                                onClick={() => setShowPurchaseReturnForm(false)}
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
                        onClick={() => setShowPurchaseReturnList(false)}
                        className="absolute top-0 right-0 mt-3 mr-3 text-gray-600 hover:text-gray-900 focus:outline-none text-2xl"
                    >
                        &times;
                    </button>

                    <h2 className="text-3xl font-semibold mb-5 text-center">
                        Purchase Return
                        <hr />
                    </h2>

                    <div className="relative overflow-y-auto max-h-[65vh]">
                        {dataProps.rest > 0 &&
                        <MdOutlineAddCircleOutline
                            size={40}
                            color="blue"
                            className="cursor-pointer ml-3 mb-3"
                            onClick={()=>setShowPurchaseReturnForm(true)}
                        />  }

                        <table className="w-full text-sm text-left rtl:text-right text-black dark:text-gray-400 mb-10">
                            <thead className="text-xs text-black bpurchaseReturn-b uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
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
                                {purchaseReturns.map((purchaseReturn, i) => (
                                        <tr
                                            key={i}
                                            className={`bg-white bpurchaseReturn-b dark:bg-gray-800 dark:bpurchaseReturn-gray-700  ${
                                                purchaseReturn.deleted_at
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
                                                {purchaseReturn.user.name}
                                            </td>
                                            <td className="px-6 py-4">
                                                {Number(
                                                    purchaseReturn.quantity
                                                ).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                {purchaseReturn.note}
                                            </td>                                            
                                            <td className="px-6 py-4">
                                                {dateFormat(
                                                    purchaseReturn.created_at,
                                                    "dd-mm-yyyy H:M:s"
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <FaRegTrashAlt
                                                    size={20}
                                                    color={
                                                        purchaseReturn.deleted_at
                                                            ? "#e18859"
                                                            : "red"
                                                    }
                                                    className="cursor-pointer"
                                                    onClick={() =>
                                                        handleDeleteConfirmation(
                                                            purchaseReturn
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

export default PurchaseReturnList;
