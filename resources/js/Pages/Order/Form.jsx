import AdminLayout from "@/Layouts/AdminLayout";
import { Link, router, usePage } from "@inertiajs/react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Select from "react-select";
import Detail from "./Detail";
import { FiChevronUp, FiChevronDown } from 'react-icons/fi'; 

const Form = ({ title, order, previousUrl, suppliers, products, orderDetails }) => {

    const { flash, errors } = usePage().props;
    const [isCollapsed, setIsCollapsed] = useState(order.supplier_id && !order.approve_order_date); 

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed); 
    };

    const [dataProps, setDataProps] = useState({
        id: order.id, 
        supplier_id: order.supplier_id, 
        order_number: order.order_number, 
        order_date: order.order_date, 
        order_note: order.order_note, 
    });

    const supplierOptions = Object.keys(suppliers).map((key) => ({
        value: suppliers[key].id,
        label: suppliers[key].name + " - " + suppliers[key].company_name,
    }));    

    const seletedSupplierOption = supplierOptions.find(option => option.value === order.supplier_id);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleChange = (event) => {
        setDataProps((prevData) => ({
            ...prevData,
            [event.target.name]: event.target.value,
        }));
    };

    const handleSupplierChange = (selectedOption) => {
        setDataProps((prevData) => ({
            ...prevData,
            supplier_id: selectedOption.value,
        }));
    };

    const actionForm = (e) => {
        e.preventDefault();        
        setIsProcessing(true);

        router.put(`/order/${dataProps.id}`, dataProps, {
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

                {!isCollapsed || order.deleted_at ? (
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
                                    Order Number
                                </label>
                                <input
                                    className="appearance-none block w-full bg-white text-black border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                    id="grid-order-number"
                                    name="order_number"
                                    value={dataProps.order_number}
                                    type="text"
                                    disabled={true}
                                    onChange={(event) => handleChange(event)}
                                />
                                {errors && errors.order_number && (
                                    <div className="text-red-700 text-sm mt-2">
                                        {errors.order_number}
                                    </div>
                                )}
                            </div>
                            <div className="w-full md:w-1/2 px-3">
                                <label
                                    className="block uppercase tracking-wide text-black text-xs font-bold mb-2"
                                    htmlFor="grid-order-date"
                                >
                                    Order Date
                                </label>
                                <input
                                    className="appearance-none block w-full bg-white text-black border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                    id="grid-order-date"
                                    type="date"
                                    name="order_date"
                                    value={dataProps.order_date}
                                    disabled={true}
                                    onChange={(event) => handleChange(event)}
                                />
                                {errors && errors.order_date && (
                                    <div className="text-red-700 text-sm mt-2">
                                        {errors.order_date}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-wrap -mx-3 mb-6">
                            <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                                <label
                                    className="block uppercase tracking-wide text-black text-xs font-bold mb-2"
                                    htmlFor="grid-order-note"
                                >
                                    Note
                                </label>
                                <textarea
                                    className="appearance-none block w-full bg-white text-black border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                    id="grid-order-note"
                                    name="order_note"
                                    value={dataProps.order_note ?? ""}
                                    disabled={
                                        order.deleted_at || isProcessing || order.approve_order_date
                                    }
                                    onChange={(event) => handleChange(event)} />
                                {errors && errors.order_note && (
                                    <div className="text-red-700 text-sm mt-2">
                                        {errors.order_note}
                                    </div>
                                )}
                            </div>
                            <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                                <label
                                    className="block uppercase tracking-wide text-black text-xs font-bold mb-2"
                                    htmlFor="grid-supplier"
                                >
                                    Supplier
                                </label>
                                <div className="inline-block relative w-full">
                                    <Select
                                        name="supplier_id"
                                        options={supplierOptions}
                                        className="basic-single"
                                        classNamePrefix="select"
                                        onChange={handleSupplierChange}
                                        defaultValue={seletedSupplierOption}
                                        isDisabled={order.deleted_at || isProcessing || order.approve_order_date }
                                    />
                                </div>
                                {errors && errors.supplier_id && (
                                    <div className="text-red-700 text-sm mt-2">
                                        {errors.supplier_id}
                                    </div>
                                )}
                            </div>
                        </div>
                        
                            <div className="mt-4 flex justify-end">
                                {!order.approve_order_date ?
                                    <button
                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mr-4"
                                        type="submit"
                                        disabled={isProcessing}
                                    >
                                        {order &&
                                            order.id &&
                                            order.deleted_at
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
                ) : <div className="text-sm text-right mr-3" onClick={toggleCollapse}>Click to more information</div> }
            </div>    

            {order.supplier_id && 
                <Detail order={order} products={ products } orderDetails={orderDetails} />
            }                    
        </AdminLayout>
    );
};

export default Form;
