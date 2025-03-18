import AdminLayout from "@/Layouts/AdminLayout";
import { Link, router, usePage } from "@inertiajs/react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Detail from "./Detail";
import { FiChevronUp, FiChevronDown } from 'react-icons/fi'; 

const Form = ({ title, stockOpname, previousUrl, products, stockOpnameDetails}) => {

    const { flash, errors,auth } = usePage().props;     

    const [isCollapsed, setIsCollapsed] = useState(stockOpname.stock_opname_date);     
    
    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed); 
    };    
    
    const [dataProps, setDataProps] = useState({
        id: stockOpname.id, 
        supplier_id: stockOpname.supplier_id, 
        number: stockOpname.number, 
        stock_opname_date: stockOpname.stock_opname_date, 
        note: stockOpname.note, 
    });
    
    const [isProcessing, setIsProcessing] = useState(false);

    const handleChange = (event) => {
        setDataProps((prevData) => ({
            ...prevData,
            [event.target.name]: event.target.value,
        }));
    };    

    const actionForm = (e) => {
        e.preventDefault();        
        setIsProcessing(true);

        router.put(`/stock-opname/${dataProps.id}`, dataProps, {
            onFinish:()=> {
                if (flash) {
                    flash.success = "";
                    flash.error = "";                
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
            <div className="w-full mx-auto  border-2 border-gray-300 p-5 relative">
                <button 
                    className="absolute right-2 top-2 text-gray-600"
                    onClick={toggleCollapse}
                >
                    {isCollapsed ? <FiChevronDown size={24} /> : <FiChevronUp size={24} />}
                </button>

                {!isCollapsed || stockOpname.deleted_at ? (
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
                                    Number
                                </label>
                                <input
                                    className="appearance-none block w-full bg-white text-black border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                    id="grid-purchase-number"
                                    name="number"
                                    value={dataProps.number?? ""}
                                    type="text"
                                    disabled={true}
                                    onChange={(event) => handleChange(event)}
                                />
                                {errors && errors.number && (
                                    <div className="text-red-700 text-sm mt-2">
                                        {errors.number}
                                    </div>
                                )}
                            </div>
                            <div className="w-full md:w-1/2 px-3">
                                <label
                                    className="block uppercase tracking-wide text-black text-xs font-bold mb-2"
                                    htmlFor="grid-purchase-date"
                                >
                                    Date
                                </label>
                                <input
                                    className="appearance-none block w-full bg-white text-black border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                    id="grid-purchase-date"
                                    type="date"
                                    name="stock_opname_date"
                                    value={dataProps.stock_opname_date}
                                    disabled={
                                        stockOpname.deleted_at || isProcessing || stockOpname.approve_stock_opname_date
                                    }
                                    onChange={(event) => handleChange(event)}
                                />
                                {errors && errors.stock_opname_date && (
                                    <div className="text-red-700 text-sm mt-2">
                                        {errors.stock_opname_date}
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
                                    name="note"
                                    value={dataProps.note ?? ""}
                                    disabled={
                                        stockOpname.deleted_at || isProcessing || stockOpname.approve_stock_opname_date
                                    }
                                    onChange={(event) => handleChange(event)} />
                                {errors && errors.note && (
                                    <div className="text-red-700 text-sm mt-2">
                                        {errors.note}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-4 flex justify-end">
                            {!stockOpname.approve_stock_opname_date ?
                                <button
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mr-4"
                                    type="submit"
                                    disabled={isProcessing}
                                >
                                    {stockOpname &&
                                        stockOpname.id &&
                                        stockOpname.deleted_at
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
                ) : <div className="text-sm text-right mr-3" onClick={toggleCollapse}>Click to more stock opname information</div> }
            </div>    

            {stockOpname.stock_opname_date && stockOpname.number  &&
                <Detail stockOpname={stockOpname} products={products} stockOpnameDetails={stockOpnameDetails} flash={ flash } />
            }                     
        </AdminLayout>
    );
};

export default Form;
