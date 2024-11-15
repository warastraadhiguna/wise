import { router } from "@inertiajs/react";
import React, {useRef} from "react";
import { useState, useEffect } from "react";
import Product from "./Product";
import Order from "./Order";
import { FaRegTrashAlt } from "react-icons/fa";
import DeleteConfirmation from "@/Components/DeleteConfirmation";
import { IoMdClose } from "react-icons/io";
import UpdateConfirmation from "@/Components/UpdateConfirmation";

const Detail = ({ purchase, products, purchaseDetails}) => {
    const [searchingText, setSearchingText] = useState(""); 
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);  
    const [showUpdateConfirmation, setShowUpdateConfirmation] = useState(false);      
    const [isProcessing, setIsProcessing] = useState(false);    
    const [isEditing, setIsEditing] = useState(false);        
    const [dataProps, setDataProps] = useState({});    
    const [showProducts, setShowProducts] = useState(products && products.total > 1);
    const [showOrderDetails, setShowOrderDetails] = useState(false);    
    const url = window.location.pathname;
    const [multiplier, setMultiplier] = useState("-1");
    const [totalSum, setTotalSum] = useState(0);
    const [grandtotal, setGrandtotal] = useState(0);
    const inputRef = useRef(null); 
    
    useEffect(() => {
        const total = purchaseDetails.reduce((acc, purchaseDetail) => {
            const totalPerRow = purchaseDetail.quantity * (purchaseDetail.price - purchaseDetail.discount - (purchaseDetail.price * purchaseDetail.discount_percent / 100));
            return acc + totalPerRow;
        }, 0);
        setTotalSum(total);
        const grandTotal = total - purchase.discount - (total * purchase.discount_percent / 100);
        setGrandtotal(grandTotal + grandTotal*purchase.ppn/100);
    }, [purchaseDetails]);

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
            e.preventDefault();
            setIsProcessing(true);

            router.put(`/purchase-detail/${dataProps.id}`, dataProps, {
                onFinish:()=> {
                    setIsProcessing(false);
                    setIsEditing(false);
                    if (inputRef.current) {
                        inputRef.current.focus();
                    }                    
                }
            });            
        } 
    };

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
        if(!purchase.approve_purchase_date){
            setDataProps(data);
            setIsEditing(true);
        }
    }

    const handleDelete = () => {
        setIsProcessing(true);        
    
        router.delete(`/purchase-detail/${dataProps.id}`,  {
            onFinish: () => {
                setShowDeleteConfirmation(false);
                setIsProcessing(false);                
            }
        });
    }        

    const handleDeleteConfirmation = (purchaseDetail) => {
        setShowDeleteConfirmation(true);
        setDataProps({
            ...purchaseDetail
        });
    }

    const handleUpdateConfirmation = () => {
        setShowUpdateConfirmation(true);
        setDataProps(purchase);        
    }

    const handleChange = (event) => {
        setDataProps((prevData) => ({
            ...prevData,
            [event.target.name]: event.target.value,
        }));
    };

    const approveOrder = (e) => {
        e.preventDefault();
        setIsProcessing(true);

        router.put(`/purchase/${dataProps.id}?approveParameter=1`, dataProps, {
            onFinish:()=> {
                setIsProcessing(false);
                setShowUpdateConfirmation(false);
            }
        });            
    }
    // console.log(purchaseDetails);
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

            {showOrderDetails && (
                <Order orderDetails={purchaseDetails} setShowOrderDetails={setShowOrderDetails}                     handleKeyPress={handleKeyPress} setSearchingText={setSearchingText} searchingText={searchingText}/>
            )}

            {showDeleteConfirmation && <DeleteConfirmation setShowDeleteConfirmation={setShowDeleteConfirmation} dataProps={dataProps} handleDelete={handleDelete} isProcessing={isProcessing}/>}     
            
            {showUpdateConfirmation && <UpdateConfirmation setShowUpdateConfirmation={setShowUpdateConfirmation} dataProps={dataProps} handleUpdate={approveOrder} isProcessing={isProcessing}/>}    

            {!purchase.deleted_at &&
                <div className="flex flex-wrap -mx-3 mb-6 mt-3">
                    <div className="w-full px-3  border-2 border-gray-300">
                        <h2 className="text-xl font-bold text-center">Details</h2>
                        {!purchase.approve_purchase_date ?
                            <div className="grid grid-cols-2 gap-4 mb-3">
                                <div className='ml-2'>          
                                    {purchaseDetails && purchaseDetails.length>0 &&
                                    <button
                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-2 rounded mr-4"
                                        onClick={handleUpdateConfirmation}
                                    >
                                        Approve Purchasing
                                        </button>
                                    }
                                    {purchase.order_date &&
                                        <button
                                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-2 rounded mr-4"
                                            onClick={()=>{setShowOrderDetails(true)}}
                                        >
                                            Add Detail From Order
                                        </button>         
                                    }
                                </div>

                                <div className="flex justify-end items-center mr-2">
                                    <input className="appearance-none  bg-white text-black border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
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
                            : <h3 className="text-sm bg-blue-400 font-bold text-center">Purchased by {purchase.purchase_user.name} Approved by {purchase.approved_user.name}   </h3>}
                        <div className="w-full mb-4">
                            <input
                                className="w-full p-2 text-5xl font-bold border border-gray-300 rounded bg-gray-50 text-right"
                                value={Number(grandtotal).toLocaleString()} // Display total in formatted number
                                readOnly
                            />
                        </div>
                        <table className="w-full text-sm text-left rtl:text-right text-black dark:text-gray-400 ">
                            <thead className="text-xs text-black border-b uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th scope="col" className="px-6 py-3" width="5%">
                                        No
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        Name
                                    </th>
                                    {purchase.order_date &&
                                        <th scope="col" className="px-6 py-3 print:hidden">
                                            Or. Qty
                                        </th>
                                    }                              
                                    <th scope="col" className="px-6 py-3">
                                        Qty
                                    </th>
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
                                    {!purchase.approve_purchase_date &&
                                        <th scope="col" className="px-6 py-3" width="5%">#</th>
                                    }
                                
                                </tr>
                            </thead>
                            <tbody>
                                {purchaseDetails
                                    .filter(purchaseDetail => purchaseDetail.quantity !== null) 
                                    .map((purchaseDetail, i) => (
                                    <tr
                                        key={i}
                                        className={`bg-white border-b dark:bg-gray-800 dark:border-gray-700  ${purchaseDetail.deleted_at ? "line-through bg-yellow-50" : ""}`}
                                        onDoubleClick={() => { showEditingForm(purchaseDetail) }}
                                    >
                                        <td
                                            scope="row"
                                            className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white "
                                        >
                                            {i + 1}
                                        </td>
                                        <td className="px-6 py-4">{purchaseDetail.product ? purchaseDetail.product.name : ""}{purchaseDetail.product ?
                                            " (" + purchaseDetail.product.code + ")" : ""
                                            }</td>
                                        {purchase.order_date &&
                                            <td className="px-6 py-4 print:hidden">{Number(purchaseDetail.order_quantity).toLocaleString()}</td>}
                                            <td className="px-6 py-4 cursor-pointer">
                                            {purchase.order_date &&
                                                <div className="hidden print:block">
                                                    {purchaseDetail.order_quantity ? Number(purchaseDetail.order_quantity).toLocaleString() + ">>" : ""}
                                                </div>
                                            }
                                            {isEditing && purchaseDetail.id == dataProps.id ?
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
                                            Number(purchaseDetail.quantity).toLocaleString()}</td>

                                            <td className="px-6 py-4">{purchaseDetail.product ? purchaseDetail.product.unit.name : ""}</td>
                                        <td className="px-6 py-4 cursor-pointer">{isEditing && purchaseDetail.id == dataProps.id ?
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
                                            :
                                                Number(purchaseDetail.price).toLocaleString()}</td>     
                                        <td className="px-6 py-4 cursor-pointer">{isEditing && purchaseDetail.id == dataProps.id ?
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
                                                Number(purchaseDetail.discount).toLocaleString()}</td>        
                                        <td className="px-6 py-4 cursor-pointer">{isEditing && purchaseDetail.id == dataProps.id ?
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
                                                Number(purchaseDetail.discount_percent).toLocaleString()}</td>                                               
                                        <td  className="px-6 py-4">{Number(purchaseDetail.quantity * (purchaseDetail.price - purchaseDetail.discount - (purchaseDetail.price*purchaseDetail.discount_percent/100))).toLocaleString()}</td>                                            
                                        {!purchase.approve_purchase_date &&
                                            <td className="px-6 py-4">
                                                {isEditing && purchaseDetail.id == dataProps.id ?
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
                                                            handleDeleteConfirmation(purchaseDetail)
                                                        }
                                                    />}

                                            </td>
                                        }
                                    </tr>
                                    ))}
                                <tr>
                                    <td></td>
                                    <td></td>
                                    <td className="print:hidden"></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td className="px-6 py-4">{Number(totalSum).toLocaleString()}</td>
                                    <td></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            }
        </div>
    );
};

export default Detail;