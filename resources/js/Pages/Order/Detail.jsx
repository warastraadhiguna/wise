import { router } from "@inertiajs/react";
import React, {useRef} from "react";
import { useState } from "react";
import Product from "./Product";
import { FaRegTrashAlt } from "react-icons/fa";
import DeleteConfirmation from "@/Components/DeleteConfirmation";
import { IoMdClose } from "react-icons/io";
import UpdateConfirmation from "@/Components/UpdateConfirmation";

const Detail = ({ order, products, orderDetails }) => {
    const [searchingText, setSearchingText] = useState(""); 
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);  
    const [showUpdateConfirmation, setShowUpdateConfirmation] = useState(false);      
    const [isProcessing, setIsProcessing] = useState(false);    
    const [isEditing, setIsEditing] = useState(false);        
    const [dataProps, setDataProps] = useState({});    
    const [showProducts, setShowProducts] = useState(products && products.total > 1);
    const url = window.location.pathname;
    const [multiplier, setMultiplier] = useState("-1");
    const inputRef = useRef(null); 
    
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

            router.put(`/order-detail/${dataProps.id}`, dataProps, {
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
        if(!order.approve_order_date){
            setDataProps(data);
            setIsEditing(true);
        }
    }

    const handleDelete = () => {
        setIsProcessing(true);        
    
        router.delete(`/order-detail/${dataProps.id}`,  {
            onFinish: () => {
                setShowDeleteConfirmation(false);
                setIsProcessing(false);                
            }
        });
    }        

    const handleDeleteConfirmation = (orderDetail) => {
        setShowDeleteConfirmation(true);
        setDataProps({
            ...orderDetail
        });
    }

    const handleUpdateConfirmation = () => {
        setShowUpdateConfirmation(true);
        setDataProps(order);        
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

        router.put(`/order/${dataProps.id}?approveParameter=1`, dataProps, {
            onFinish:()=> {
                setIsProcessing(false);
                setShowUpdateConfirmation(false);
            }
        });            
    }
    // console.log(order);
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

            {showDeleteConfirmation && <DeleteConfirmation setShowDeleteConfirmation={setShowDeleteConfirmation} dataProps={dataProps} handleDelete={handleDelete} isProcessing={isProcessing}/>}     
            
            {showUpdateConfirmation && <UpdateConfirmation setShowUpdateConfirmation={setShowUpdateConfirmation} dataProps={dataProps} handleUpdate={approveOrder} isProcessing={isProcessing}/>}    

            {!order.deleted_at &&
                <div className="flex flex-wrap -mx-3 mb-6 mt-3">
                    <div className="w-full px-3  border-2 border-gray-300">
                        <h2 className="text-xl font-bold text-center">Details</h2>
                        {!order.approve_order_date ?
                            <div className="grid grid-cols-2 gap-4 mb-3">
                                <div className='ml-2'>
                                    {orderDetails && orderDetails.length > 0 &&
                                        <button
                                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-2 rounded mr-4"
                                            onClick={handleUpdateConfirmation}
                                        >
                                            Approve Order
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
                            : <h3 className="text-sm bg-blue-400 font-bold text-center">Order {order.order_user.name} Approved by {order.approved_order_user.name}   </h3>}
                    
                        <table className="w-full text-sm text-left rtl:text-right text-black dark:text-gray-400 ">
                            <thead className="text-xs text-black border-b uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th scope="col" className="px-6 py-3" width="5%">
                                        No
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        Name
                                    </th>
                                    <th scope="col" className="px-6 py-3" width="15%">
                                        Quantity
                                    </th>
                                    <th scope="col" className="px-6 py-3" width="10%">
                                        Unit
                                    </th>
                                    {!order.approve_order_date &&
                                        <th scope="col" className="px-6 py-3" width="5%">#</th>
                                    }
                                
                                </tr>
                            </thead>
                            <tbody>
                                {orderDetails
                                    .filter(orderDetail => orderDetail.order_quantity != null) 
                                    .map((orderDetail, i) => (
                                    <tr
                                        key={i}
                                        className={`bg-white border-b dark:bg-gray-800 dark:border-gray-700  ${orderDetail.deleted_at ? "line-through bg-yellow-50" : ""}`}
                                        onDoubleClick={() => { showEditingForm(orderDetail) }}
                                    >
                                        <td
                                            scope="row"
                                            className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white "
                                        >
                                            {i + 1}
                                        </td>
                                        <td className="px-6 py-4">{orderDetail.product ? orderDetail.product.name : ""}                                            {orderDetail.product ?
                                            " (" + orderDetail.product.code + ")" : ""
                                        }
                                        </td>
                                        <td className="px-6 py-4 cursor-pointer">{isEditing && orderDetail.id == dataProps.id ?
                                            <input
                                                className="appearance-none block w-full bg-white text-black border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                                id="grid-minimum-stok"
                                                type="number"
                                                name="order_quantity"
                                                step="0.1"
                                                min="0"
                                                autoFocus={true}
                                                value={dataProps.order_quantity}
                                                disabled={isProcessing}
                                                onChange={(event) => handleChange(event)}
                                                onKeyDown={handleEditingKeyPress}
                                                required
                                            />
                                            :
                                            Number(orderDetail.order_quantity).toLocaleString()}</td>

                                        <td className="px-6 py-4">{orderDetail.product ? orderDetail.product.unit.name : ""}</td>
                                        {!order.approve_order_date &&
                                            <td className="px-6 py-4">
                                                {isEditing && orderDetail.id == dataProps.id ?
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
                                                            handleDeleteConfirmation(orderDetail)
                                                        }
                                                    />}

                                            </td>
                                        }
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            }
        </div>
    );
};

export default Detail;
