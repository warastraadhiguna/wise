import AdminLayout from "@/Layouts/AdminLayout";
import { Link, router, usePage } from "@inertiajs/react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Select from "react-select";
import Detail from "./Detail";
import { FiChevronUp, FiChevronDown } from 'react-icons/fi'; 

const Form = ({ title, distribution, previousUrl, storeBranchs, products, distributionDetails, paymentStatuses}) => {

    const { flash, errors,auth } = usePage().props;
    const [isCollapsed, setIsCollapsed] = useState(distribution.store_branch_id);     
    const [totalSum, setTotalSum] = useState(0);
    const [grandtotal, setGrandtotal] = useState(0);

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed); 
    };    

    const [dataProps, setDataProps] = useState({
        id: distribution.id, 
        store_branch_id: distribution.store_branch_id, 
        number: distribution.number, 
        distribution_date: distribution.distribution_date, 
        note: distribution.note, 
    });

    const storeBranchOptions = Object.keys(storeBranchs).map((key) => ({
        value: storeBranchs[key].id,
        label: storeBranchs[key].name + " - " + storeBranchs[key].address,
    }));    

    const seletedStoreBranchOption = storeBranchOptions.find(option => option.value === distribution.store_branch_id);
    
    const [isProcessing, setIsProcessing] = useState(false);

    const handleChange = (event) => {
        if (event.target.name === "payment") {
            setDataProps((prevData) => ({
                ...prevData,
                [event.target.name]: event.target.value,
                change:paymentStatuses.find((status) => status.id === dataProps.payment_status_id).is_done == 1? (grandtotal-event.target.value) : 0
            }));
        } else {
            setDataProps((prevData) => ({
                ...prevData,
                [event.target.name]: event.target.value,
            }));
        }
    };

    const handleOptionChange = (selectedOption, name = "") => {
        setDataProps((prevData) => ({
            ...prevData,
            [name]: selectedOption ? selectedOption.value : null,
            payment: 0,
            change:0,
        }));
    };    

    const actionForm = (e) => {
        e.preventDefault();        
        setIsProcessing(true);

        router.put(`/distribution/${dataProps.id}`, dataProps, {
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

    useEffect(() => {
        const total = distributionDetails.reduce((acc, distributionDetail) => {
            const totalPerRow = distributionDetail.quantity * (distributionDetail.price - distributionDetail.discount - (distributionDetail.price * distributionDetail.discount_percent / 100));
            return acc + totalPerRow;
        }, 0);
        setTotalSum(total);
        const grandTotal = total - distribution.discount - (total * distribution.discount_percent / 100);
        setGrandtotal(Math.round(grandTotal + grandTotal*distribution.ppn/100));
    }, [distributionDetails]);

    return (
        <AdminLayout title={title}>
            <div className="w-full mx-auto  border-2 border-gray-300 p-5 relative">
                <button 
                    className="absolute right-2 top-2 text-gray-600"
                    onClick={toggleCollapse}
                >
                    {isCollapsed ? <FiChevronDown size={24} /> : <FiChevronUp size={24} />}
                </button>

                {!isCollapsed || distribution.deleted_at ? (
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
                                    Distribution Number
                                </label>
                                <input
                                    className="appearance-none block w-full bg-white text-black border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                    id="grid-distribution-number"
                                    name="number"
                                    value={dataProps.number}
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
                                    htmlFor="grid-distribution-date"
                                >
                                    Distribution Date 
                                </label>
                                <input
                                    className="appearance-none block w-full bg-white text-black border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                    id="grid-distribution-date"
                                    type="date"
                                    name="distribution_date"
                                    value={dataProps.distribution_date }
                                    disabled={
                                        distribution.deleted_at || isProcessing || distribution.approve_date || distribution.distribution_date || auth.user.role === 'user'
                                    }
                                    onChange={(event) => handleChange(event)}
                                />
                                {errors && errors.distribution_date && (
                                    <div className="text-red-700 text-sm mt-2">
                                        {errors.distribution_date}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-wrap -mx-3 mb-6">
                            <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                                <label
                                    className="block uppercase tracking-wide text-black text-xs font-bold mb-2"
                                    htmlFor="grid-distribution-note"
                                >
                                    Note
                                </label>
                                <textarea
                                    className="appearance-none block w-full bg-white text-black border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                    id="grid-distribution-note"
                                    name="note"
                                    value={dataProps.note ?? ""}
                                    disabled={
                                        distribution.deleted_at || isProcessing || distribution.approve_date
                                    }
                                    onChange={(event) => handleChange(event)} />
                                {errors && errors.note && (
                                    <div className="text-red-700 text-sm mt-2">
                                        {errors.note}
                                    </div>
                                )}
                            </div>
                            
                            <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                                <label
                                    className="block uppercase tracking-wide text-black text-xs font-bold mb-2"
                                    htmlFor="grid-storeBranch"
                                >
                                    Store Branch
                                </label>
                                <div className="inline-block relative w-full">
                                    <Select
                                        name="store_branch_id"
                                        options={storeBranchOptions}
                                        className="basic-single"
                                        classNamePrefix="select"
                                        onChange={(selectedOption) => handleOptionChange(selectedOption, 'store_branch_id')}
                                        defaultValue={seletedStoreBranchOption}
                                        isDisabled={distribution.deleted_at || isProcessing || distribution.approve_order_date || distribution.approve_date  }
                                        isClearable={true} 
                                    />
                                </div>
                                {errors && errors.store_branch_id && (
                                    <div className="text-red-700 text-sm mt-2">
                                        {errors.store_branch_id}
                                    </div>
                                )}
                            </div>
                        </div>


                        <div className="mt-4 flex justify-end">
                            {!distribution.approve_date ?
                                <button
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mr-4"
                                    type="submit"
                                    disabled={isProcessing}
                                >
                                    {distribution &&
                                        distribution.id &&
                                        distribution.deleted_at
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
                ) : <div className="text-sm text-right mr-3" onClick={toggleCollapse}>Click to more distribution information</div> }
            </div>    
            {distribution.store_branch_id && <Detail distribution={distribution} products={products} distributionDetails={distributionDetails} totalSum={totalSum} grandtotal={grandtotal} flash={ flash } />   }
            
        </AdminLayout>
    );
};

export default Form;
