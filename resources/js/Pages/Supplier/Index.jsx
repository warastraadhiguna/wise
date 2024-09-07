import AdminLayout from "@/Layouts/AdminLayout";
import { router, usePage } from "@inertiajs/react";
import React, { useEffect, useState } from "react";
import Form from "./Form";
import toast from "react-hot-toast";
import { FaPencilAlt, FaRegTrashAlt } from "react-icons/fa";
import DeleteConfirmation from "@/Components/DeleteConfirmation";
import Pagination from "@/Components/Pagination";
import SearchingTable from "@/Components/SearchingTable";
import { MdOutlineAddCircleOutline } from "react-icons/md";

const Index = ({ title, suppliers, searchingTextProps }) => {

    const { flash, errors } = usePage().props;

    const defaultValueData = {
        id: "",   
        name: "",
        company_name: "",
        address: "",
        email: "",
        phone: "",
        bank_account: "",
        note: "",    
    };

    const [showForm, setShowForm] = useState(false);
    const [dataProps, setDataProps] = useState(defaultValueData);

    const [perPage, setPerPage]  = useState(suppliers.per_page);
    const [searchingText, setSearchingText] = useState(searchingTextProps);
    
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleShowForm = (data) => {
        if (errors) {
            errors.name = "";        
            errors.company_name = "";
            errors.address = "";     
            errors.email = "";
            errors.phone = "";     
            errors.bank_account = "";
            errors.note = "";                 
        }

        setShowForm(true);
        setDataProps(data);
    };

    const resetForm = (all) => {
        if (all) {
            setDataProps(defaultValueData);            
            setShowForm(false);
        }

        if (flash) {
            flash.success = "";
            flash.error = "";
        }
        setIsProcessing(false);
    }

    const actionForm = (e) => {
        e.preventDefault();        
        setIsProcessing(true);

        if (dataProps.id) {
            router.put(`supplier/${dataProps.id}`, dataProps, {
                onSuccess: () => {
                    resetForm(true);
                },
                onError: () => {
                    resetForm(false);
                }
            });
        } else {
            router.post("supplier", dataProps, {
                onSuccess: () => {
                    resetForm(true);
                },
                onError: () => {
                    resetForm(false);
                }
            });            
        }
    }

    const handleDelete = () => {
        setIsProcessing(true);        
    
        router.delete(`/supplier/${dataProps.id}`,  {
            onFinish: () => {
                setShowDeleteConfirmation(false);
                setIsProcessing(false);                
            }
        });
    }    

    const handleDeleteConfirmation = (supplier) => {
        setShowDeleteConfirmation(true);
        setDataProps({
            ...supplier
        });
    }

    useEffect(() => {
        flash.success && toast.success(flash.success);
        flash.error && toast.error(flash.error);
    }, [flash]);

    return (
        <AdminLayout title={title}>
            {showForm && (
                <Form
                    setShowForm={setShowForm}
                    dataProps={dataProps}
                    setDataProps={setDataProps}
                    action={actionForm}
                    errors={errors}
                    isProcessing={isProcessing}
                />
            )}

            <MdOutlineAddCircleOutline
                size={40}
                color="blue"
                className="cursor-pointer ml-3 mb-3"
                onClick={() => handleShowForm(defaultValueData)}
            />            

            <SearchingTable perPage={perPage} setPerPage={setPerPage} searchingText={ searchingText } setSearchingText={ setSearchingText } />
            
            <div className="relative overflow-x-auto">
                <table className="w-full text-sm text-left rtl:text-right text-black dark:text-gray-400">
                    <thead className="text-xs text-black border-b uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">
                                No
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Name - Company Name
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Phone
                            </th>                            
                            <th scope="col" className="px-6 py-3">
                                Address
                            </th>                         
                            <th scope="col" className="px-6 py-3">
                                User
                            </th>
                            <th scope="col" className="px-6 py-3 text-center">
                                #
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {suppliers.data.map((supplier, i) => (
                            <tr
                                key={i}
                                className={`bg-white border-b dark:bg-gray-800 dark:border-gray-700  ${supplier.deleted_at? "line-through bg-yellow-50" : ""}`}
                            >
                                <td
                                    scope="row"
                                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white "
                                >
                                    {(suppliers.current_page - 1) * suppliers.per_page + i + 1}
                                </td>
                                <td className="px-6 py-4">{supplier.name} - {supplier.company_name}</td>
                                <td className="px-6 py-4">{supplier.phone}</td>
                                <td className="px-6 py-4">{supplier.address}</td>                                      
                                <td className="px-6 py-4">{supplier.user.name}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-center gap-2">
                                        <FaPencilAlt
                                            size={20}
                                            color={ supplier.deleted_at? "#c2bc42" : "green"}
                                            className="cursor-pointer"
                                            onClick={() => handleShowForm(supplier)}
                                        />   
                                        {" "} | {" "}
                                        <FaRegTrashAlt
                                            size={20}
                                            color={ supplier.deleted_at? "#e18859" : "red"}
                                            className="cursor-pointer"
                                            onClick={() =>
                                                handleDeleteConfirmation(supplier)
                                            }
                                        />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {showDeleteConfirmation && <DeleteConfirmation setShowDeleteConfirmation={setShowDeleteConfirmation} dataProps={dataProps} handleDelete={handleDelete} isProcessing={isProcessing}/>}            
            <Pagination data={suppliers}></Pagination>
        </AdminLayout>
    );
};

export default Index;
