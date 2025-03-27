import { router } from "@inertiajs/react";
import React, {useEffect, useRef} from "react";
import { useState} from "react";
import Product from "./Product";
// import Order from "./Order";
import { FaRegTrashAlt } from "react-icons/fa";
import DeleteConfirmation from "@/Components/DeleteConfirmation";
import { IoMdClose } from "react-icons/io";
import { GiReturnArrow } from "react-icons/gi";
import { MdAttachMoney } from "react-icons/md";
import TransactionReturnList from "./TransactionReturnList";

const Detail = ({ transaction, products, transactionDetails, setShowPaymentForm, totalSum, grandtotal,flash }) => {
    const [searchingText, setSearchingText] = useState(""); 
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);  

    const [isProcessing, setIsProcessing] = useState(false);    
    const [isEditing, setIsEditing] = useState(false);        
    const [isOptionEditing, setIsOptionEditing] = useState(true);       
    const [dataProps, setDataProps] = useState({});    
    const [showProducts, setShowProducts] = useState(products && products.total > 1);
    // const [showOrderDetails, setShowOrderDetails] = useState(false);
    const [showTransactionReturnList, setShowTransactionReturnList] = useState(false);    
    const [selectedTransactionDetail, setSelectedTransactionDetail] = useState([]);    
    
    const url = window.location.pathname;
    const [multiplier, setMultiplier] = useState("-1");

    const inputRef = useRef(null); 

    useEffect(() => {
        // Function to handle keydown event
        const handleKeyDown = (event) => {
            if (event.key === "F2") {
                pay();
            }
        };

        // Adding keydown event listener when the component is mounted
        window.addEventListener("keydown", handleKeyDown);

        // Cleanup event listener when component is unmounted
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);    

    const pay = () => {
        setShowPaymentForm(true);
        setIsEditing(false);     
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if(searchingText.length > 0)
                router.get(`${url}?searchingText=${searchingText}&addDetail=1`);
            else if (Number(multiplier) > 0)
                router.get(`${url}?multiplier=${multiplier}`);                
        } 
    };

    const handleEditingKeyPress = (e) => {
        if (e.key === 'Enter') {
            updateDetail(e);
        } 
    };

    const updateDetail = (e) => {
        e.preventDefault();
        setIsProcessing(true);

        router.put(`/transaction-detail/${dataProps.id}`, dataProps, {
            onFinish:()=> {
                setIsProcessing(false);
                setIsOptionEditing(false);
                setIsEditing(false);
                if (inputRef.current) {
                    inputRef.current.focus();
                }                    
            }
        });   
    }

    const handleSearch = (value) => {

        if (searchingText.length == 0 && value == "*"){
            setMultiplier("");             
        }
        else if (multiplier != "-1" && !isNaN(Number(value))) {
            setMultiplier(multiplier + value);
        }
        else {
            setMultiplier("-1");            
            setSearchingText(value);
        }       
    };

    const showEditingForm = (data) => {
        if(!transaction.approve_transaction_date){
            setDataProps(data);
            setIsEditing(true);
        }
    }

    const handleDelete = () => {
        setIsProcessing(true);        
    
        router.delete(`/transaction-detail/${dataProps.id}`,  {
            onFinish: () => {
                setShowDeleteConfirmation(false);
                setIsProcessing(false);                
            }
        });
    }        

    const handleDeleteConfirmation = (transactionDetail) => {
        setShowDeleteConfirmation(true);
        setDataProps({
            ...transactionDetail
        });
    }

    // const handleUpdateConfirmation = () => {
    //     setShowUpdateConfirmation(true);
    //     setDataProps(transaction);        
    // }

    const handleChange = (event) => {        
        setDataProps((prevData) => ({
            ...prevData,
            [event.target.name]: event.target.value,
        }));
    };

    return (
        <div className="w-full mx-auto mt-5">
            {showProducts && (
                <Product
                    products={products}
                    setShowProducts={setShowProducts}
                    handleKeyPress={handleKeyPress}
                    searchingText={searchingText}
                    setSearchingText={setSearchingText}
                />
            )}

            {/* {showOrderDetails && (
                <Order orderDetails={transactionDetails} setShowOrderDetails={setShowOrderDetails} handleKeyPress={handleKeyPress} setSearchingText={setSearchingText} searchingText={searchingText}/>
            )} */}

            {showDeleteConfirmation && <DeleteConfirmation setShowDeleteConfirmation={setShowDeleteConfirmation} dataProps={dataProps} handleDelete={handleDelete} isProcessing={isProcessing}/>}     
            

            {!transaction.deleted_at &&
                <div className="flex flex-wrap -mx-3 mb-6 mt-3">
                    <div className="w-full px-3  border-2 border-gray-300">
                        <h2 className="text-xl font-bold text-center">Details</h2>
                        {!transaction.approve_transaction_date ?
                            <div className="flex flex-col md:grid md:grid-cols-2 gap-4 mb-3">
                                <div className="ml-2 flex flex-col md:flex-row">       
                                    {transactionDetails && transactionDetails.length>0 &&
                                    <button
                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-2 rounded mr-0 md:mr-4 mb-2 md:mb-0"
                                            // onClick={handleUpdateConfirmation}
                                            onClick={() => { pay(); }}
                                    >
                                        Approve Transaction (F2)
                                        </button>
                                    }
                                    {/* {transaction.order_date &&
                                        <button
                                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-2 rounded"
                                            onClick={()=>{setShowOrderDetails(true)}}
                                        >
                                            Add Detail From Order
                                        </button>         
                                    } */}
                                </div>

                                <div className="flex justify-end items-center mr-2">
                                    <input className="appearance-none w-full md:w-auto bg-white text-black border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                        name="name"
                                        type="text"
                                        placeholder='Search & Enter...'
                                        value={searchingText}
                                        autoFocus
                                        onChange={(event) => handleSearch(event.target.value)}
                                        onKeyDown={handleKeyPress}
                                        autoComplete="off"
                                        ref={inputRef}                                         
                                    />
                                </div>
                            </div>
                            : <h3 className="text-sm bg-blue-400 font-bold text-center">Transaction by {transaction.transaction_user.name} Approved by {transaction.approved_user.name}   </h3>}
                        <div className="w-full mb-4">
                            <input
                                className="w-full p-2 text-5xl font-bold border border-gray-300 rounded bg-gray-50 text-right"
                                value={Number(grandtotal).toLocaleString()} // Display total in formatted number
                                readOnly
                            />
                        </div>
                        <div className="overflow-x-auto">                        
                            <table className="w-full text-sm text-left rtl:text-right text-black dark:text-gray-400 ">
                                <thead className="text-xs text-black border-b uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                    <tr>
                                        <th scope="col" className="px-6 py-3" width="5%">
                                            No
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                            Name
                                        </th>                           
                                        <th scope="col" className="px-6 py-3">
                                            Qty
                                        </th>
                                        {
                                            transaction.approve_transaction_date &&
                                            <th scope="col" className="px-6 py-3">
                                                Ret
                                            </th>
                                        }                                          
                                        <th scope="col" className="px-6 py-3">
                                            Unit
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                            Price
                                        </th>    
                                        <th scope="col" className="px-6 py-3">
                                            Disc.
                                        </th> 
                                        <th scope="col" className="px-6 py-3">
                                            Disc. %
                                        </th>                                     
                                        <th scope="col" className="px-6 py-3">
                                            Total
                                        </th>                                     
                                        <th scope="col" className="px-6 py-3" width="5%">#</th>
                                    
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactionDetails
                                        .filter(transactionDetail => transactionDetail.quantity !== null) 
                                        .map((transactionDetail, i) => (
                                        <tr
                                            key={i}
                                            className={`bg-white border-b dark:bg-gray-800 dark:border-gray-700  ${transactionDetail.deleted_at ? "line-through bg-yellow-50" : ""}`}
                                            onDoubleClick={() => { showEditingForm(transactionDetail) }}
                                        >
                                            <td
                                                scope="row"
                                                className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white "
                                            >
                                                {i + 1}
                                            </td>
                                            <td className="px-6 py-4">{transactionDetail.product ? transactionDetail.product.name : ""}{transactionDetail.product ?
                                                " (" + transactionDetail.product.code + ")" : ""
                                                }</td>
                                                <td className="px-6 py-4 cursor-pointer">
                                                {isEditing && transactionDetail.id == dataProps.id ?
                                                <input
                                                    className="appearance-none block w-full bg-white text-black border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                                    id="grid-minimum-stok"
                                                    type="number"
                                                    name="quantity"
                                                    step="0.1"
                                                    min="0"
                                                    autoFocus={true}
                                                    value={dataProps.quantity??0}
                                                    disabled={isProcessing}
                                                    onChange={(event) => handleChange(event)}
                                                    onKeyDown={handleEditingKeyPress}
                                                    required
                                                />
                                                :
                                                Number(transactionDetail.quantity).toLocaleString()}</td>
                                                {
                                                        transaction.approve_transaction_date &&                                             <td className="px-6 py-4">{transactionDetail.transaction_detail_returns_sum_quantity ? Number(transactionDetail.transaction_detail_returns_sum_quantity).toLocaleString() : 0}</td>    
                                                }   
                                                <td className="px-6 py-4">{transactionDetail.product ? transactionDetail.product.unit.name : ""}</td>
                                            <td className="px-6 py-4 cursor-pointer">{isEditing && transactionDetail.id == dataProps.id ?
                                                <div className="flex items-center">            
                                                        {
                                                            isOptionEditing ?
                                                                    <select
                                                                        id="my-select"
                                                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                                                        value={dataProps.price}
                                                                        name="price"
                                                                        onKeyDown={handleEditingKeyPress}
                                                                        onChange={(event) => handleChange(event)}
                                                                >
                                                                    {
                                                                        transactionDetail.product.price_relations.length>0? <option value="">-Choose a price-</option> : <option value="">-No Saved Price-</option>
                                                                    }
                                                                    
                                                                    {
                                                                        transactionDetail.product.price_relations.map((price) => (
                                                                        <option key={price.id.toString() + transactionDetail.id.toString()} value={price.value}>
                                                                            {price.value.toLocaleString('id-ID')} - {price.price_category.name} 
                                                                        </option>
                                                                    ))}
                                                                    </select>
                                                                :
                                                                <input
                                                                    className="appearance-none block w-full bg-white text-black border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                                                    id="grid-minimum-stok"
                                                                    type="number"
                                                                    name="price"
                                                                    step="0.1"
                                                                    min="0"
                                                                    autoFocus={true}
                                                                    value={dataProps.price??0}
                                                                    disabled={isProcessing}
                                                                    onChange={(event) => handleChange(event)}
                                                                    onKeyDown={handleEditingKeyPress}
                                                                    required
                                                                />
                                                    }        
                                                                                                            
                                                    <MdAttachMoney
                                                        size={20}
                                                        color={"green"}
                                                        className="cursor-pointer"
                                                        onClick={() =>
                                                            setIsOptionEditing(!isOptionEditing)
                                                        }
                                                    />
                                                </div>
                                                :
                                                    Number(transactionDetail.price).toLocaleString()}</td>     
                                            <td className="px-6 py-4 cursor-pointer">{isEditing && transactionDetail.id == dataProps.id ?
                                                <input
                                                    className="appearance-none block w-full bg-white text-black border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                                    id="grid-minimum-stok"
                                                    type="number"
                                                    name="discount"
                                                    step="0.1"
                                                    min="0"
                                                    autoFocus={true}
                                                    value={dataProps.discount??0}
                                                    disabled={isProcessing}
                                                    onChange={(event) => handleChange(event)}
                                                    onKeyDown={handleEditingKeyPress}
                                                    required
                                                />
                                                :
                                                    Number(transactionDetail.discount).toLocaleString()}</td>        
                                                <td className="px-6 py-4 cursor-pointer">{isEditing && transactionDetail.id == dataProps.id ?

                                                    <input
                                                        className="appearance-none block w-full bg-white text-black border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                                        id="grid-minimum-stok"
                                                        type="number"
                                                        name="discount_percent"
                                                        step="0.1"
                                                        min="0"
                                                        autoFocus={true}
                                                        value={dataProps.discount_percent??0}
                                                        disabled={isProcessing}
                                                        onChange={(event) => handleChange(event)}
                                                        onKeyDown={handleEditingKeyPress}
                                                        required
                                                        />
                                                :
                                                    Number(transactionDetail.discount_percent).toLocaleString()}</td>                                               
                                            <td  className="px-6 py-4">{Number(transactionDetail.quantity * (transactionDetail.price - transactionDetail.discount - (transactionDetail.price*transactionDetail.discount_percent/100))).toLocaleString()}</td>                                            
                                            {!transaction.approve_transaction_date &&
                                                <td className="px-6 py-4">
                                                    {isEditing && transactionDetail.id == dataProps.id ?
                                                        <IoMdClose
                                                            size={20}
                                                            color={"black"}
                                                            className="cursor-pointer"
                                                            onClick={() => {
                                                                    setIsEditing(false);        
                                                                    if (inputRef.current) {
                                                                        inputRef.current.focus();
                                                                    }     
                                                                }
                                                            }
                                                        /> :
                                                        <FaRegTrashAlt
                                                            size={20}
                                                            color={"red"}
                                                            className="cursor-pointer"
                                                            onClick={() =>
                                                                handleDeleteConfirmation(transactionDetail)
                                                            }
                                                        />}
                                                </td>
                                                }
                                                        {
                                                            transaction.approve_transaction_date && <td className="print:hidden">
                                                                <GiReturnArrow
                                                                    title="return"
                                                                    size={20}
                                                                    onClick={() => {
                                                                        setShowTransactionReturnList(true);
                                                                        setSelectedTransactionDetail(transactionDetail);
                                                                    }}
                                                                    className="cursor-pointer"     
                                                                    color={"red"}/> 
                                                            </td>
                                                        }                                                
                                        </tr>
                                        ))}
                                    <tr>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        {
                                            transaction.approve_transaction_date &&
                                            <td></td>
                                        }                                            
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td className="px-6 py-4">{Number(totalSum).toLocaleString()}</td>
                                        {!transaction.approve_transaction_date &&
                                            <td></td>}
                                    </tr>
                                </tbody>
                            </table>
                            {showTransactionReturnList && <TransactionReturnList setShowTransactionReturnList={setShowTransactionReturnList} transactionDetail={selectedTransactionDetail} flash={flash} />}                                
                        </div>    
                    </div>
                </div>
            }
        </div>
    );
};

export default Detail;
