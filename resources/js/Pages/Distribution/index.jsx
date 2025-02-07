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

const Index = ({ title, distributions, searchingTextProps,startDate, endDate, paymentMethod, status }) => {

    const { flash } = usePage().props;
    const url = window.location.pathname;  

    const defaultValueData = {
        id: "", 
    };
    
    const [dataProps, setDataProps] = useState(defaultValueData);

    const [perPage, setPerPage]  = useState(distributions.per_page);
    const [searchingText, setSearchingText] = useState(searchingTextProps);
    
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [selectedDistribution, setSelectedDistribution] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [filters, setFilters] = useState({
        startDate: startDate,
        endDate: endDate,
        paymentMethod: paymentMethod,
        status: status,
    });

    const filterParameter = `${url}?startDate=${filters.startDate}&endDate=${filters.endDate}&paymentMethod=${filters.paymentMethod}&status=${filters.status}&paymentStatus=${filters.paymentStatus}&page=1&perPage=${perPage}&searchingText=${searchingText}`;

    const handleDelete = () => {
        setIsProcessing(true);        
    
        router.delete(`/distribution/${dataProps.id}`,  {
            onFinish: () => {
                setShowDeleteConfirmation(false);
                setIsProcessing(false);                
            }
        });
    }    

    const handleDeleteConfirmation = (distribution) => {
        setShowDeleteConfirmation(true);
        setDataProps({
            ...distribution
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
                        router.visit('distribution/create');
                    }}
                />   
            </div>            

            <SearchingTable perPage={perPage} setPerPage={setPerPage} searchingText={searchingText} setSearchingText={setSearchingText} isProcessing={ isProcessing } filterParameter={filterParameter} />
            
            <div className="relative overflow-x-auto">
                <table className="w-full text-sm text-left rtl:text-right text-black dark:text-gray-400">
                    <thead className="text-xs text-black bdistribution-b uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">
                                No
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Store Branch
                            </th>                         
                            <th scope="col" className="px-6 py-3">
                                Distribution
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
                        {distributions.data.map((distribution, i) => (
                            <tr
                                key={i}
                                className={`bg-white bdistribution-b dark:bg-gray-800 dark:bdistribution-gray-700  ${distribution.deleted_at? "line-through bg-yellow-50" : ""}`}
                            >
                                <td
                                    scope="row"
                                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white "
                                >
                                    {(distributions.current_page - 1) * distributions.per_page + i + 1}
                                </td>
                                <td className="px-6 py-4">{distribution.store_branch?distribution.store_branch.name : ""}</td>                                     
                                <td className="px-6 py-4">
                                    <table className="w-full">
                                        <tbody>
                                            <tr>
                                                <td className="font-semibold w-24">No</td>
                                                <td className="w-1">:</td>
                                                <td>{distribution.number}</td>
                                            </tr>
                                            <tr>
                                                <td className="font-semibold">Date</td>
                                                <td>:</td>
                                                <td>{distribution.distribution_date? dateFormat(distribution.distribution_date, 'dd-mm-yyyy') : ""}</td>
                                            </tr>
                                            <tr>
                                                <td className="font-semibold">User</td>
                                                <td>:</td>
                                                <td>{distribution.user? distribution.user.name : ""}</td>
                                            </tr>                                            
                                            <tr>
                                                <td className="font-semibold">Status</td>
                                                <td>:</td>
                                                <td>{distribution.approve_date ? 'Approved' : '-'}</td>
                                            </tr>
                                            <tr>
                                                <td className="font-semibold">Approved By</td>
                                                <td>:</td>
                                                <td>{distribution.approved_user ? distribution.approved_user.name : '-'}</td>
                                            </tr>
                                            <tr>
                                                <td className="font-semibold">Note</td>
                                                <td>:</td>
                                                <td>{distribution.note}</td>
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
                                                <td>{distribution.receiption_date? dateFormat(distribution.receiption_date, 'dd-mm-yyyy') : ""}</td>
                                            </tr>
                                            <tr>
                                                <td className="font-semibold">User</td>
                                                <td>:</td>
                                                <td>{distribution.received_user? distribution.received_user.name : ""}</td>
                                            </tr>                                            
                                            <tr>
                                                <td className="font-semibold">Status</td>
                                                <td>:</td>
                                                <td>{distribution.is_received ? 'Received' : (distribution.received_user? 'Rejected' :'-')}</td>
                                            </tr>
                                            <tr>
                                                <td className="font-semibold">Note</td>
                                                <td>:</td>
                                                <td>{distribution.receiption_note}</td>
                                            </tr>                                            
                                        </tbody>
                                    </table>
                                </td>                                   
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-center gap-2">
                                        <Link href={`distribution/${distribution.id}/edit`} className="flex items-center ml-1">
                                            <FaPencilAlt
                                                size={20}
                                                color={ distribution.deleted_at? "#c2bc42" : "green"}
                                                className="cursor-pointer"
                                            />    
                                        </Link>      
                                        {!distribution.approve_date &&
                                            <React.Fragment>
                                            {" "} | {" "}
                                                <FaRegTrashAlt
                                                size={20}
                                                color={ distribution.deleted_at? "#e18859" : "red"}
                                                className="cursor-pointer"
                                                onClick={() =>
                                                    handleDeleteConfirmation(distribution)
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
            <Pagination data={distributions}></Pagination>
        </AdminLayout>
    );
};

export default Index;
