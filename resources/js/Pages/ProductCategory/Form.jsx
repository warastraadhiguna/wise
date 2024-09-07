import React from "react";

const Form = ({ setShowForm, dataProps, setDataProps, action, errors, isProcessing }) => {
    const handleChange = (event) => {
        setDataProps((prevData) => ({
            ...prevData,
            [event.target.name]: event.target.value,        
        }));
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6">
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
                                    htmlFor="grid-name"
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
                                    htmlFor="grid-note"
                                >
                                    Note
                                </label>
                                <input
                                    className="appearance-none block w-full bg-white text-black border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                    id="grid-note"
                                    type="text"
                                    name="note" 
                                    value={dataProps.note}             
                                    disabled={ dataProps.deleted_at || isProcessing}                                    
                                    onChange={(event) => handleChange(event)}                                    
                                />
                                {errors && errors.note && (                      
                                <div className='text-red-700 text-sm mt-2'>
                                    {errors.note}
                                </div>       
                                )}                                   
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
