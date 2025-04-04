import { router } from "@inertiajs/react";
import React, {useRef} from "react";
import { useState, useEffect } from "react";
import Product from "./Product";
import { FaRegTrashAlt } from "react-icons/fa";
import DeleteConfirmation from "@/Components/DeleteConfirmation";
import { IoMdClose } from "react-icons/io";
import UpdateConfirmation from "@/Components/UpdateConfirmation";

const Detail = ({ stockOpname, products, stockOpnameDetails }) => {
    const [searchingText, setSearchingText] = useState(""); 
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);  
    const [showUpdateConfirmation, setShowUpdateConfirmation] = useState(false);      
    const [isProcessing, setIsProcessing] = useState(false);    
    const [isEditing, setIsEditing] = useState(false);        
    const [dataProps, setDataProps] = useState({});

    const [showProducts, setShowProducts] = useState(products && products.total > 1);
    const url = window.location.pathname;
    const inputRef = useRef(null); 

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "F2") { 
                setIsEditing(false);
                setShowUpdateConfirmation(true);
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);    

    const approveStockOpname = (e) => {
        e.preventDefault();
        setIsProcessing(true);
        router.put(`/stock-opname/${stockOpname.id}`, {approveParameter: "1"}, {
            onSuccess: () => {
            },
            onFinish:()=> {
                setIsProcessing(false);
                setShowUpdateConfirmation(false);
            }
        });            
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if(searchingText.length > 0)
                router.get(`${url}?searchingText=${searchingText}&addDetail=1`);        
        } 
    };

    const handleEditingKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            setIsProcessing(true);

            router.put(`/stock-opname-detail/${dataProps.id}`, dataProps, {
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

    const showEditingForm = (data) => {
        if(!stockOpname.approve_stock_opname_date){
            setDataProps(data);
            setIsEditing(true);
        }
    }

    const handleDelete = () => {
        setIsProcessing(true);        
    
        router.delete(`/stock-opname-detail/${dataProps.id}`,  {
            onFinish: () => {
                setShowDeleteConfirmation(false);
                setIsProcessing(false);                
            }
        });
    }        

    const handleDeleteConfirmation = (stockOpnameDetail) => {
        setShowDeleteConfirmation(true);
        setDataProps({
            ...stockOpnameDetail
        });
    }

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

            {showDeleteConfirmation && <DeleteConfirmation setShowDeleteConfirmation={setShowDeleteConfirmation} dataProps={dataProps} handleDelete={handleDelete} isProcessing={isProcessing}/>}     
            
            {showUpdateConfirmation && <UpdateConfirmation setShowUpdateConfirmation={setShowUpdateConfirmation} dataProps={dataProps} handleUpdate={approveStockOpname} isProcessing={isProcessing}/>}    

            {!stockOpname.deleted_at &&
                <div className="flex flex-wrap -mx-3 mb-6 mt-3">
                    <div className="w-full px-3  border-2 border-gray-300">
                        <h2 className="text-xl font-bold text-center">Details</h2>
                        {!stockOpname.approve_stock_opname_date ?
                            <div className="flex flex-col md:grid md:grid-cols-2 gap-4 mb-3">
                                <div className="ml-2 flex flex-col md:flex-row">        
                                    {stockOpnameDetails && stockOpnameDetails.length>0 &&
                                    <button
                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-2 rounded mr-0 md:mr-4 mb-2 md:mb-0"
                                            onClick={() => { setShowUpdateConfirmation(true); setIsEditing(false);}}
                                    >
                                        Approve Stock Opname (F2)
                                        </button>
                                    }
                                </div>

                                <div className="flex justify-end items-center mr-2">
                                    <input className="appearance-none w-full md:w-auto bg-white text-black border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                        name="name"
                                        type="text"
                                        placeholder='Search & Enter...'
                                        value={searchingText}
                                        autoFocus
                                        onChange={(event) => setSearchingText(event.target.value)}
                                        onKeyDown={handleKeyPress}
                                        autoComplete="off"
                                        ref={inputRef}                                         
                                    />
                                </div>
                            </div>
                            : <h3 className="text-sm bg-blue-400 font-bold text-center">Opnamed by {stockOpname.user.name} Approved by {stockOpname.approved_user.name}   </h3>}
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
                                        Current Qty
                                        </th> 
                                    <th scope="col" className="px-6 py-3">
                                        Real Qty
                                    </th>                               
                                    <th scope="col" className="px-6 py-3">
                                        Unit
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        Price
                                    </th>           
                                    {
                                        !stockOpname.approve_stock_opname_date && <th scope="col" className="px-6 py-3 print:hidden" width="5%">#</th>   
                                    }                         
                                </tr>
                            </thead>
                            <tbody>
                                {stockOpnameDetails
                                    .filter(stockOpnameDetail => stockOpnameDetail.quantity !== null) 
                                    .map((stockOpnameDetail, i) => (
                                    <tr
                                        key={i}
                                        className={`bg-white border-b dark:bg-gray-800 dark:border-gray-700  ${stockOpnameDetail.deleted_at ? "line-through bg-yellow-50" : ""}`}
                                        onDoubleClick={() => { showEditingForm(stockOpnameDetail) }}
                                    >
                                        <td
                                            scope="row"
                                            className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white "
                                        >
                                            {i + 1}
                                        </td>
                                        <td className="px-6 py-4">{stockOpnameDetail.product ? stockOpnameDetail.product.name : ""}{stockOpnameDetail.product ?
                                            " (" + stockOpnameDetail.product.code + ")" : ""
                                            }</td>
                                        <td  className="px-6 py-4">{Number(stockOpnameDetail.last_quantity).toLocaleString()}</td>   
                                        <td className="px-6 py-4 cursor-pointer">
                                        {isEditing && stockOpnameDetail.id == dataProps.id ?
                                        <input
                                            className="appearance-none block w-full bg-white text-black border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                            id="grid-minimum-stok"
                                            type="number"
                                            name="real_quantity"
                                            step="0.1"
                                            min="0"
                                            autoFocus={true}
                                            value={dataProps.real_quantity}
                                            disabled={isProcessing}
                                            onChange={(event) => handleChange(event)}
                                            onKeyDown={handleEditingKeyPress}
                                            required
                                        />
                                        :
                                            Number(stockOpnameDetail.real_quantity).toLocaleString()}</td>
                                        <td className="px-6 py-4">{stockOpnameDetail.product ? stockOpnameDetail.product.unit.name : ""}</td>                                            
                                        <td className="px-6 py-4 cursor-pointer">{isEditing && stockOpnameDetail.id == dataProps.id ?
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
                                                Number(stockOpnameDetail.price).toLocaleString()}
                                            </td>     
                                            {!stockOpname.approve_stock_opname_date &&
                                            <td className="px-6 py-4">
                                                {isEditing && stockOpnameDetail.id == dataProps.id ?
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
                                                            handleDeleteConfirmation(stockOpnameDetail)
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
                </div>
            }
        </div>
    );
};

export default Detail;
