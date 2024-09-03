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

const Index = ({ title, users, searchingTextProps }) => {

    const { flash, errors } = usePage().props;

    const defaultValueData = {
        id: "",
        name: "",
        email: "",
        role: "admin",
        password: "",
    };

    const [showForm, setShowForm] = useState(false);
    const [dataProps, setDataProps] = useState(defaultValueData);

    const [perPage, setPerPage]  = useState(users.per_page);
    const [searchingText, setSearchingText] = useState(searchingTextProps);
    
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleShowForm = (data) => {
        if (errors) {
            errors.name = "";
            errors.email = "";            
            errors.role = "";       
            errors.password = "";                   
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
            router.put(`user/${dataProps.id}`, dataProps, {
                onSuccess: () => {
                    resetForm(true);
                },
                onError: () => {
                    resetForm(false);
                }
            });
        } else {
            router.post("user", dataProps, {
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
    
        router.delete(`/user/${dataProps.id}`,  {
            onFinish: () => {
                setShowDeleteConfirmation(false);
                setIsProcessing(false);                
            }
        });
    }    

    const handleDeleteConfirmation = (user) => {
        setShowDeleteConfirmation(true);
        setDataProps({
            ...user
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
                                Name
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Email
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Role
                            </th>
                            <th scope="col" className="px-6 py-3 text-center">
                                #
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.data.map((user, i) => (
                            <tr
                                key={i}
                                className={`bg-white border-b dark:bg-gray-800 dark:border-gray-700  ${user.deleted_at? "line-through bg-yellow-50" : ""}`}
                            >
                                <td
                                    scope="row"
                                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white "
                                >
                                    {(users.current_page - 1) * users.per_page + i + 1}
                                </td>
                                <td className="px-6 py-4">{user.name}</td>
                                <td className="px-6 py-4">{user.email}</td>
                                <td className="px-6 py-4">{user.role}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-center gap-2">
                                        <FaPencilAlt
                                            size={20}
                                            color={ user.deleted_at? "#c2bc42" : "green"}
                                            className="cursor-pointer"
                                            onClick={() => handleShowForm(user)}
                                        />   
                                        {" "} | {" "}
                                        <FaRegTrashAlt
                                            size={20}
                                            color={ user.deleted_at? "#e18859" : "red"}
                                            className="cursor-pointer"
                                            onClick={() =>
                                                handleDeleteConfirmation(user)
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
            <Pagination data={users}></Pagination>
        </AdminLayout>
    );
};

export default Index;
