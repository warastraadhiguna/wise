import NoMovePageSearchingTable from "@/Components/NoMovePageSearchingTable";
import React from "react";
import { useState } from "react";

const Form = ({ setShowForm, dataProps, setDataProps, action, errors, isProcessing, distributionDetails, distribution}) => {
    const handleChange = (event) => {
        setDataProps((prevData) => ({
            ...prevData,
            [event.target.name]: event.target.value,        
        }));
    };

    const [searchingText, setSearchingText] = useState("");

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-6xl w-full p-6">
                <h2 className="text-3xl font-semibold mb-5 text-center">
                    Detail Data
                    <hr/>
                </h2>

                <div className="w-full mx-auto">
                    <form className="w-full" onSubmit={(event) => action(event)} autoComplete="off">
                        <div className="flex flex-wrap -mx-3 mb-6">
                            <div className="w-full md:w-1/3 px-3 mb-6 md:mb-0">
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
                                />                               
                            </div>
                            <div className="w-full md:w-1/3 px-3 mb-6 md:mb-0">
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
                                    disabled={true}
                                />                        
                            </div>             
                            <div className="w-full md:w-1/3 px-3">
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
                                    disabled={true} />                               
                            </div>                            
                        </div>
                        <div className="flex flex-wrap -mx-3 mb-6">
                            <div className="w-full md:w-1/3 px-3 mb-6 md:mb-0">   
                                <label className="block text-sm font-medium text-gray-700">Receiption Status</label>
                                <select
                                    name="is_received"
                                    value={dataProps.is_received}
                                    onChange={handleChange}
                                    disabled={distribution.is_received}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                >
                                    <option value="1">Receive</option>
                                    <option value="0">Pending</option>
                                </select>                 
                            </div>             
                            <div className="w-full md:w-1/3 px-3">
                                <label
                                    className="block uppercase tracking-wide text-black text-xs font-bold mb-2"
                                    htmlFor="grid-distribution-note"
                                >
                                    Receiption Note
                                </label>
                                <textarea
                                    className="appearance-none block w-full bg-white text-black border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                    id="grid-distribution-reception-note"
                                    name="receiption_note"
                                    onChange={handleChange}    
                                    disabled={distribution.is_received}
                                    value={dataProps.receiption_note ?? ""}/>                               
                            </div>                            
                        </div>
                        <div className="mt-4 mb-4 flex justify-end">
                            {distribution.is_received != 1 &&  <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mr-4" type="submit" disabled={isProcessing}>
                            Save</button>}
                            <button
                                onClick={() => setShowForm(false)}
                                className="bg-red-500 text-white font-bold py-1 px-2 rounded"
                                disabled={isProcessing}
                            >
                                Close
                            </button>
                        </div>                        
                    </form>
                    <div className="overflow-x-auto max-h-64 overflow-y-auto">         
                        <NoMovePageSearchingTable searchingText={ searchingText } setSearchingText={ setSearchingText } />                        
                        <table className="w-full text-sm text-left rtl:text-right text-black dark:text-gray-400">
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
                                </tr>
                            </thead>
                            <tbody>
                                {distributionDetails
                                    .filter(distributionDetail => distributionDetail.product.name.toLowerCase().includes(searchingText.toLowerCase())) 
                                    .map((distributionDetail, i) => (
                                    <tr
                                        key={i}
                                        className={`bg-white border-b dark:bg-gray-800 dark:border-gray-700`}
                                    >
                                        <td
                                            scope="row"
                                            className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white "
                                        >
                                            {i + 1}
                                        </td>
                                        <td className="px-6 py-4">{distributionDetail.product ? distributionDetail.product.name : ""}{distributionDetail.product ? " (" + distributionDetail.product.code + ")" : ""}</td>
                                        <td className="px-6 py-4 cursor-pointer">
                                            {Number(distributionDetail.quantity).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">{distributionDetail.product ? distributionDetail.product.unit.name : ""}</td>                                                 
                                    </tr>
                                    ))}
                            </tbody>
                        </table>                          
                    </div> 
                </div>
            </div>
        </div>
    );
};

export default Form;
