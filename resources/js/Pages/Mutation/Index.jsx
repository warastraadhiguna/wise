import AdminLayout from "@/Layouts/AdminLayout";
import { Link, router, usePage } from "@inertiajs/react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {  FaPencilAlt, FaRegTrashAlt } from "react-icons/fa";
import DeleteConfirmation from "@/Components/DeleteConfirmation";
import Pagination from "@/Components/Pagination";
import SearchingTable from "@/Components/SearchingTable";
import DistributionFilter from "@/Components/DistributionFilter";
import { MdOutlineAddCircleOutline } from "react-icons/md";
import dateFormat from "dateformat";

const Index = ({ title, mutations, searchingTextProps,startDate, endDate, isReceived, status }) => {

    const { flash } = usePage().props;
    const url = window.location.pathname;  

    const defaultValueData = {
        id: "", 
    };

    const [dataProps, setDataProps] = useState(defaultValueData);

    const [perPage, setPerPage]  = useState(mutations.per_page);
    const [searchingText, setSearchingText] = useState(searchingTextProps);
    
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    // const [selectedMutation, setSelectedMutation] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [filters, setFilters] = useState({
        startDate: startDate,
        endDate: endDate,
        isReceived: isReceived,
        status: status,
    });

    const filterParameter = `${url}?startDate=${filters.startDate}&endDate=${filters.endDate}&status=${filters.status}&isReceived=${filters.isReceived}&page=1&perPage=${perPage}&searchingText=${searchingText}`;

    const handleDelete = () => {
        setIsProcessing(true);        
    
        router.delete(`/mutation/${dataProps.id}`,  {
            onFinish: () => {
                setShowDeleteConfirmation(false);
                setIsProcessing(false);                
            }
        });
    }    

    const handleDeleteConfirmation = (mutation) => {
        setShowDeleteConfirmation(true);
        setDataProps({
            ...mutation
        });
    }

    const handleFilterButton = (e) => {
        setIsProcessing(true);
        e.preventDefault();
        router.get(filterParameter, {}, {
            onFinish: () => {
                setIsProcessing(false);
            },
            
        });
    };

    useEffect(() => {
        flash.success && toast.success(flash.success);
        flash.error && toast.error(flash.error);
    }, [flash]);
    return (
        <AdminLayout title={title}>
            <DistributionFilter filters={filters} setFilters={setFilters} handleFilterButton={ handleFilterButton} />
            
            <div  className="flex items-center ml-1">
                <MdOutlineAddCircleOutline
                    size={40}
                    color="blue"
                    className="cursor-pointer ml-3 mb-3"
                    onClick={() => {
                        router.visit('mutation/create');
                    }}
                />   
            </div>            

            <SearchingTable perPage={perPage} setPerPage={setPerPage} searchingText={searchingText} setSearchingText={setSearchingText} isProcessing={ isProcessing } filterParameter={filterParameter} />
            
            <div className="relative overflow-x-auto">
                <table className="w-full text-sm text-left rtl:text-right text-black dark:text-gray-400">
                    <thead className="text-xs text-black bmutation-b uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">
                                No
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Store Branch
                            </th>                         
                            <th scope="col" className="px-6 py-3">
                                Mutation
                            </th>        
                            <th scope="col" className="px-6 py-3">
                                Receiption
                            </th>                              
                            <th scope="col" className="px-6 py-3 text-center" width="5%">
                                #
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {mutations.data.map((mutation, i) => (
                            <tr
                                key={i}
                                className={`bg-white bmutation-b dark:bg-gray-800 dark:bmutation-gray-700  ${mutation.deleted_at? "line-through bg-yellow-50" : ""}`}
                            >
                                <td
                                    scope="row"
                                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white "
                                >
                                    {(mutations.current_page - 1) * mutations.per_page + i + 1}
                                </td>
                                <td className="px-6 py-4">{mutation.store_branch?mutation.store_branch.name : ""}</td>                                     
                                <td className="px-6 py-4">
                                    <table className="w-full">
                                        <tbody>
                                            <tr>
                                                <td className="font-semibold w-24">No</td>
                                                <td className="w-1">:</td>
                                                <td>{mutation.number}</td>
                                            </tr>
                                            <tr>
                                                <td className="font-semibold">Date</td>
                                                <td>:</td>
                                                <td>{mutation.mutation_date? dateFormat(mutation.mutation_date, 'dd-mm-yyyy') : ""}</td>
                                            </tr>
                                            <tr>
                                                <td className="font-semibold">User</td>
                                                <td>:</td>
                                                <td>{mutation.user? mutation.user.name : ""}</td>
                                            </tr>                                            
                                            <tr>
                                                <td className="font-semibold">Status</td>
                                                <td>:</td>
                                                <td>{mutation.approve_date ? 'Approved' : '-'}</td>
                                            </tr>
                                            <tr>
                                                <td className="font-semibold">Approved By</td>
                                                <td>:</td>
                                                <td>{mutation.approved_user ? mutation.approved_user.name : '-'}</td>
                                            </tr>
                                            <tr>
                                                <td className="font-semibold">Note</td>
                                                <td>:</td>
                                                <td>{mutation.note}</td>
                                            </tr>                                            
                                        </tbody>
                                    </table>
                                </td>       
                                <td className="px-6 py-4">
                                    <table className="w-full">
                                        <tbody>
                                            <tr>
                                                <td className="font-semibold">Date</td>
                                                <td>:</td>
                                                <td>{mutation.receiption_date? dateFormat(mutation.receiption_date, 'dd-mm-yyyy') : ""}</td>
                                            </tr>
                                            <tr>
                                                <td className="font-semibold">User</td>
                                                <td>:</td>
                                                <td>{mutation.received_user? mutation.received_user.name : ""}</td>
                                            </tr>                                            
                                            <tr>
                                                <td className="font-semibold">Status</td>
                                                <td>:</td>
                                                <td>{mutation.is_received ? <>✅ Received</> : (mutation.received_user? <>❌ Rejected</> :'-')}</td>
                                            </tr>
                                            <tr>
                                                <td className="font-semibold">Note</td>
                                                <td>:</td>
                                                <td>{mutation.receiption_note}</td>
                                            </tr>                                            
                                        </tbody>
                                    </table>
                                </td>                                   
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-center gap-2">
                                        <Link href={`mutation/${mutation.id}/edit`} className="flex items-center ml-1">
                                            <FaPencilAlt
                                                size={20}
                                                color={ mutation.deleted_at? "#c2bc42" : "green"}
                                                className="cursor-pointer"
                                            />    
                                        </Link>      
                                        {!mutation.is_received &&
                                            <React.Fragment>
                                            {" "} | {" "}
                                                <FaRegTrashAlt
                                                size={20}
                                                color={ mutation.deleted_at? "#e18859" : "red"}
                                                className="cursor-pointer"
                                                onClick={() =>
                                                    handleDeleteConfirmation(mutation)
                                                }
                                                    />
                                            </React.Fragment>
                                        }
                                        
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>         
            {showDeleteConfirmation && <DeleteConfirmation setShowDeleteConfirmation={setShowDeleteConfirmation} dataProps={dataProps} handleDelete={handleDelete} isProcessing={isProcessing}/>}            
            <Pagination data={mutations}></Pagination>
        </AdminLayout>
    );
};

export default Index;
