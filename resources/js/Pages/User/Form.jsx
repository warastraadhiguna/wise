import React from "react";
import { usePage } from "@inertiajs/react";

const Form = ({ setShowForm, dataProps, setDataProps, action, errors, isProcessing }) => {
    const { roles } = usePage().props;
    
    const handleChange = (event) => {
        setDataProps((prevData) => ({
            ...prevData,
            [event.target.name]: event.target.value,        
        }));
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6">
                <h2 className="text-3xl font-semibold mb-5 text-center">
                    {dataProps && dataProps.id ? (dataProps.deleted_at? "Restore Data" : "Edit Data")   : "Add data"}
                    <hr/>
                </h2>

                <div className="max-w-4xl mx-auto">
                    <form className="w-full max-w-lg" onSubmit={(event) => action(event)} autoComplete="off">
                        <div className="flex flex-wrap -mx-3 mb-6">
                            <div className="w-full px-3">
                                <label
                                    className="block uppercase tracking-wide text-black text-xs font-bold mb-2"
                                    htmlFor="grid-label-name"
                                >
                                    Name
                                </label>
                                <input
                                    className="appearance-none block w-full bg-white text-black border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                    id="grid-name"
                                    name="name"
                                    value={ dataProps.name }
                                    type="text"
                                    disabled={ dataProps.deleted_at || isProcessing}                                    
                                    onChange={(event) => handleChange(event)}
                                />
                                {errors && errors.name && (                      
                                <div className='text-red-700 text-sm mt-2'>
                                    {errors.name}
                                </div>       
                                )}                                    
                            </div>
                        </div>
                        <div className="flex flex-wrap -mx-3 mb-6">
                            <div className="w-full px-3">
                                <label
                                    className="block uppercase tracking-wide text-black text-xs font-bold mb-2"
                                    htmlFor="grid-email"
                                >
                                    Email
                                </label>
                                <input
                                    className="appearance-none block w-full bg-white text-black border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                    id="grid-email"
                                    type="email"
                                    name="email" 
                                    value={dataProps.email}             
                                    disabled={ dataProps.deleted_at || isProcessing}                                    
                                    onChange={(event) => handleChange(event)}                                    
                                />
                                {errors && errors.email && (                      
                                <div className='text-red-700 text-sm mt-2'>
                                    {errors.email}
                                </div>       
                                )}                                   
                            </div>
                        </div>
                        <div className="flex flex-wrap -mx-3 mb-6">
                            <div className="w-full px-3">
                                <label
                                    className="block uppercase tracking-wide text-black text-xs font-bold mb-2"
                                    htmlFor="grid-password"
                                >
                                    Password {dataProps.id? "(Kosongi jika tidak mau mengubah)" : ""}
                                </label>
                                <input
                                    className="appearance-none block w-full bg-white text-black border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                    id="grid-password"
                                    type="password"
                                    name="password"     
                                    disabled={ dataProps.deleted_at || isProcessing}                                    
                                    onChange={(event) => handleChange(event)}                                       
                                />
                                {errors && errors.password && (                      
                                <div className='text-red-700 text-sm mt-2'>
                                    {errors.password}
                                </div>       
                                )}                                   
                            </div>
                        </div>
                        <div className="flex flex-wrap -mx-3 mb-6">
                            <div className="w-full px-3">
                                <label
                                    className="block uppercase tracking-wide text-black text-xs font-bold mb-2"
                                    htmlFor="grid-role"
                                >
                                    Role
                                </label>
                                <div className="inline-block relative w-full">
                                    <select className="block appearance-none w-full bg-white text-black border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" name="role" value={dataProps.role}
                                        onChange={(event) => handleChange(event)} disabled={dataProps.deleted_at || isProcessing}>
                                        {roles.map((role, index) => (
                                            <option key={index} value={ role.value }>{ role.label }</option>
                                        ))}
                                        
                                        
                                    </select>
                                    {errors && errors.role && (                      
                                    <div className='text-red-700 text-sm mt-2'>
                                        {errors.role}
                                    </div>       
                                    )}                                      
                                </div>
                            </div>
                        </div>

                <div className="mt-4 flex justify-end">
                    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mr-4" type="submit" disabled={isProcessing}>
                        {dataProps && dataProps.id && dataProps.deleted_at ? "Restore" : "Save"}
                            </button>
                    <button
                        onClick={() => setShowForm(false)}
                        className="bg-red-500 text-white font-bold py-1 px-2 rounded"
                        disabled={isProcessing}
                    >
                        Close
                    </button>
                </div>                        
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Form;
