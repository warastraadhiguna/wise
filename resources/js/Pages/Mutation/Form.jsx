import AdminLayout from "@/Layouts/AdminLayout";
import { Link, router, usePage } from "@inertiajs/react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Select from "react-select";
import Detail from "./Detail";
import { FiChevronUp, FiChevronDown } from 'react-icons/fi'; 

const Form = ({ title, mutation, previousUrl, products, mutationDetails, paymentStatuses}) => {

    const { flash, errors,auth } = usePage().props;
    const [isCollapsed, setIsCollapsed] = useState(mutation.store_branch_id);     
    const [totalSum, setTotalSum] = useState(0);
    const [grandtotal, setGrandtotal] = useState(0);

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed); 
    };    

    const [dataProps, setDataProps] = useState({
        id: mutation.id, 
        store_branch_id: mutation.store_branch_id, 
        number: mutation.number, 
        mutation_date: mutation.mutation_date, 
        note: mutation.note, 
    });

    
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

        router.put(`/mutation/${dataProps.id}`, dataProps, {
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
        const total = mutationDetails.reduce((acc, mutationDetail) => {
            const totalPerRow = mutationDetail.quantity * (mutationDetail.price - mutationDetail.discount - (mutationDetail.price * mutationDetail.discount_percent / 100));
            return acc + totalPerRow;
        }, 0);
        setTotalSum(total);
        const grandTotal = total - mutation.discount - (total * mutation.discount_percent / 100);
        setGrandtotal(Math.round(grandTotal + grandTotal*mutation.ppn/100));
    }, [mutationDetails]);

    return (
        <AdminLayout title={title}>
            <div className="w-full mx-auto  border-2 border-gray-300 p-5 relative">
                <button 
                    className="absolute right-2 top-2 text-gray-600"
                    onClick={toggleCollapse}
                >
                    {isCollapsed ? <FiChevronDown size={24} /> : <FiChevronUp size={24} />}
                </button>

                {!isCollapsed || mutation.deleted_at ? (
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
                                    Mutation Number
                                </label>
                                <input
                                    className="appearance-none block w-full bg-white text-black border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                    id="grid-mutation-number"
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
                                    htmlFor="grid-mutation-date"
                                >
                                    Mutation Date 
                                </label>
                                <input
                                    className="appearance-none block w-full bg-white text-black border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                    id="grid-mutation-date"
                                    type="date"
                                    name="mutation_date"
                                    value={dataProps.mutation_date }
                                    disabled={
                                        mutation.deleted_at || isProcessing || mutation.approve_date || mutation.mutation_date || auth.user.role === 'user'
                                    }
                                    onChange={(event) => handleChange(event)}
                                />
                                {errors && errors.mutation_date && (
                                    <div className="text-red-700 text-sm mt-2">
                                        {errors.mutation_date}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-wrap -mx-3 mb-6">
                            <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                                <label
                                    className="block uppercase tracking-wide text-black text-xs font-bold mb-2"
                                    htmlFor="grid-mutation-note"
                                >
                                    Note
                                </label>
                                <textarea
                                    className="appearance-none block w-full bg-white text-black border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                    id="grid-mutation-note"
                                    name="note"
                                    value={dataProps.note ?? ""}
                                    disabled={
                                        mutation.deleted_at || isProcessing || mutation.approve_date
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
                            {!mutation.approve_date ?
                                <button
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mr-4"
                                    type="submit"
                                    disabled={isProcessing}
                                >
                                    {mutation &&
                                        mutation.id &&
                                        mutation.deleted_at
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
                ) : <div className="text-sm text-right mr-3" onClick={toggleCollapse}>Click to more mutation information</div> }
            </div>    
            {mutation.store_branch_id && <Detail mutation={mutation} products={products} mutationDetails={mutationDetails} totalSum={totalSum} grandtotal={grandtotal} flash={ flash } />   }
            
        </AdminLayout>
    );
};

export default Form;
