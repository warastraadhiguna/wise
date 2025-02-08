import { router } from "@inertiajs/react";
import React, {useEffect, useRef} from "react";
import { useState} from "react";
import Product from "./Product";
import { FaRegTrashAlt } from "react-icons/fa";
import DeleteConfirmation from "@/Components/DeleteConfirmation";
import { IoMdClose } from "react-icons/io";
import UpdateConfirmation from "@/Components/UpdateConfirmation";

const Detail = ({ distribution, products, distributionDetails}) => {
    const [searchingText, setSearchingText] = useState(""); 
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);  

    const [isProcessing, setIsProcessing] = useState(false);    
    const [isEditing, setIsEditing] = useState(false);            
    const [dataProps, setDataProps] = useState({});    
    const [showProducts, setShowProducts] = useState(products && products.total > 1);
    
    const url = window.location.pathname;
    const [multiplier, setMultiplier] = useState("-1");
    const [showUpdateConfirmation, setShowUpdateConfirmation] = useState(false);  
    const inputRef = useRef(null); 

    useEffect(() => {
        // Function to handle keydown event
        const handleKeyDown = (event) => {
            if (event.key === "F2") {
                setShowUpdateConfirmation(true);
            }
        };

        // Adding keydown event listener when the component is mounted
        window.addEventListener("keydown", handleKeyDown);

        // Cleanup event listener when component is unmounted
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);    

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

        router.put(`/distribution-detail/${dataProps.id}`, dataProps, {
            onFinish:()=> {
                setIsProcessing(false);
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
        if(!distribution.approve_date){
            setDataProps(data);
            setIsEditing(true);
        }
    }

    const approveDistribution = (e) => {
        e.preventDefault();
        setIsProcessing(true);
        router.put(`/distribution/${distribution.id}`, {approveParameter:1 }, {
            onFinish:()=> {
                setIsProcessing(false);
                setShowUpdateConfirmation(false);
            }
        });            
    }       

    const handleDelete = () => {
        setIsProcessing(true);        
    
        router.delete(`/distribution-detail/${dataProps.id}`,  {
            onFinish: () => {
                setShowDeleteConfirmation(false);
                setIsProcessing(false);                
            }
        });
    }        

    const handleDeleteConfirmation = (distributionDetail) => {
        setShowDeleteConfirmation(true);
        setDataProps({
            ...distributionDetail
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


            {showUpdateConfirmation && <UpdateConfirmation setShowUpdateConfirmation={setShowUpdateConfirmation} dataProps={dataProps} handleUpdate={approveDistribution} isProcessing={isProcessing}/>}  

            {showDeleteConfirmation && <DeleteConfirmation setShowDeleteConfirmation={setShowDeleteConfirmation} dataProps={dataProps} handleDelete={handleDelete} isProcessing={isProcessing}/>}     
            

            {!distribution.deleted_at &&
                <div className="flex flex-wrap -mx-3 mb-6 mt-3">
                    <div className="w-full px-3  border-2 border-gray-300">
                        <h2 className="text-xl font-bold text-center">Details</h2>
                        {!distribution.approve_date ?
                            <div className="flex flex-col md:grid md:grid-cols-2 gap-4 mb-3">
                                <div className="ml-2 flex flex-col md:flex-row">       
                                    {distributionDetails && distributionDetails.length>0 &&
                                    <button
                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-2 rounded mr-0 md:mr-4 mb-2 md:mb-0"
                                        onClick={() =>setShowUpdateConfirmation(true)}
                                    >
                                        Approve Transaction (F2)
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
                                        onChange={(event) => handleSearch(event.target.value)}
                                        onKeyDown={handleKeyPress}
                                        autoComplete="off"
                                        ref={inputRef}                                         
                                    />
                                </div>
                            </div>
                            : <h3 className="text-sm bg-blue-400 font-bold text-center">Transactiond by {distribution.user.name} Approved by {distribution.approved_user.name}   </h3>}

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
                                        <th scope="col" className="px-6 py-3">
                                            Unit
                                        </th>                        
                                        <th scope="col" className="px-6 py-3" width="5%">#</th>
                                    
                                    </tr>
                                </thead>
                                <tbody>
                                    {distributionDetails
                                        .filter(distributionDetail => distributionDetail.quantity !== null) 
                                        .map((distributionDetail, i) => (
                                        <tr
                                            key={i}
                                            className={`bg-white border-b dark:bg-gray-800 dark:border-gray-700  ${distributionDetail.deleted_at ? "line-through bg-yellow-50" : ""}`}
                                            onDoubleClick={() => { showEditingForm(distributionDetail) }}
                                        >
                                            <td
                                                scope="row"
                                                className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white "
                                            >
                                                {i + 1}
                                            </td>
                                            <td className="px-6 py-4">{distributionDetail.product ? distributionDetail.product.name : ""}{distributionDetail.product ?
                                                " (" + distributionDetail.product.code + ")" : ""
                                                }</td>
                                                <td className="px-6 py-4 cursor-pointer">
                                                {isEditing && distributionDetail.id == dataProps.id ?
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
                                                Number(distributionDetail.quantity).toLocaleString()}</td>  
                                                <td className="px-6 py-4">{distributionDetail.product ? distributionDetail.product.unit.name : ""}</td>                                                 
                                            {!distribution.approve_date &&
                                                <td className="px-6 py-4">
                                                    {isEditing && distributionDetail.id == dataProps.id ?
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
                                                                handleDeleteConfirmation(distributionDetail)
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
