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
            <div className="bg-white rounded-lg shadow-lg max-w-6xl w-full p-6">
                <h2 className="text-3xl font-semibold mb-5 text-center">
                    {dataProps && dataProps.id ? (dataProps.deleted_at? "Restore Data" : "Edit Data")   : "Add data"}
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
                                    required
                                />
                                {errors && errors.name && (                      
                                <div className='text-red-700 text-sm mt-2'>
                                    {errors.name}
                                </div>       
                                )}                                    
                            </div>
                            <div className="w-full md:w-1/3 px-3 mb-6 md:mb-0">
                                <label
                                    className="block uppercase tracking-wide text-black text-xs font-bold mb-2"
                                    htmlFor="grid-displayed-name"
                                >
                                    Displayed Name
                                </label>
                                <input
                                    className="appearance-none block w-full bg-white text-black border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                    id="grid-displayed-name"
                                    name="displayed_name"
                                    value={ dataProps.displayed_name }
                                    type="text"
                                    disabled={ dataProps.deleted_at || isProcessing}                                    
                                    onChange={(event) => handleChange(event)}
                                    required
                                />
                                {errors && errors.displayed_name && (                      
                                <div className='text-red-700 text-sm mt-2'>
                                    {errors.displayed_name}
                                </div>       
                                )}                                    
                            </div>             
                            <div className="w-full md:w-1/3 px-3">
                                <label
                                    className="block uppercase tracking-wide text-black text-xs font-bold mb-2"
                                    htmlFor="grid-index"
                                >
                                    Index
                                </label>
                                <input
                                    className="appearance-none block w-full bg-white text-black border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                    id="grid-index"
                                    type="number"
                                    name="index" 
                                    value={dataProps.index}             
                                    disabled={ dataProps.deleted_at || isProcessing}                                    
                                    onChange={(event) => handleChange(event)}    
                                    required
                                />
                                {errors && errors.index && (                      
                                <div className='text-red-700 text-sm mt-2'>
                                    {errors.index}
                                </div>       
                                )}                                   
                            </div>                            
                        </div>
                        <div className="flex flex-wrap -mx-3 mb-6">
                            <div className="w-full md:w-1/3 px-3 mb-6 md:mb-0">
                                <label
                                    className="block uppercase tracking-wide text-black text-xs font-bold mb-2"
                                    htmlFor="grid-address"
                                >
                                    Address
                                </label>
                                <textarea
                                    className="appearance-none block w-full bg-white text-black border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                    id="grid-address"
                                    name="address"
                                    value={dataProps.address}
                                    disabled={
                                        dataProps.deleted_at || isProcessing
                                    }
                                    onChange={(event) => handleChange(event)}
                                    required
                                />
                                {errors && errors.address && (
                                    <div className="text-red-700 text-sm mt-2">
                                        {errors.address}
                                    </div>
                                )}
                            </div>
                            <div className="w-full md:w-1/3 px-3 mb-6 md:mb-0">
                                <label
                                    className="block uppercase tracking-wide text-black text-xs font-bold mb-2"
                                    htmlFor="grid-bank-account"
                                >
                                    Bank Account
                                </label>
                                <textarea
                                    className="appearance-none block w-full bg-white text-black border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                    id="grid-bank-account"
                                    name="bank_account"
                                    value={dataProps.bank_account}
                                    disabled={
                                        dataProps.deleted_at || isProcessing
                                    }
                                    onChange={(event) => handleChange(event)}/>
                                {errors && errors.bank_account && (
                                    <div className="text-red-700 text-sm mt-2">
                                        {errors.bank_account}
                                    </div>
                                )}
                            </div>
                            <div className="w-full md:w-1/3 px-3">
                                <label
                                    className="block uppercase tracking-wide text-black text-xs font-bold mb-2"
                                    htmlFor="grid-note"
                                >
                                    Note
                                </label>
                                <textarea
                                    className="appearance-none block w-full bg-white text-black border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                    id="grid-note"
                                    name="note"
                                    value={dataProps.note}
                                    disabled={
                                        dataProps.deleted_at || isProcessing
                                    }
                                    onChange={(event) => handleChange(event)}/>
                                {errors && errors.note && (
                                    <div className="text-red-700 text-sm mt-2">
                                        {errors.note}
                                    </div>
                                )}
                            </div>                            
                        </div>                         
                        <div className="flex flex-wrap -mx-3 mb-6">
                            <div className="w-full md:w-1/3 px-3 mb-6 md:mb-0">
                                <label
                                    className="block uppercase tracking-wide text-black text-xs font-bold mb-2"
                                    htmlFor="grid-city"
                                >
                                    City
                                </label>
                                <input
                                    className="appearance-none block w-full bg-white text-black border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                    id="grid-city"
                                    name="city"
                                    value={ dataProps.city }
                                    type="text"
                                    disabled={ dataProps.deleted_at || isProcessing}                                    
                                    onChange={(event) => handleChange(event)}
                                    required
                                />
                                {errors && errors.city && (                      
                                <div className='text-red-700 text-sm mt-2'>
                                    {errors.city}
                                </div>       
                                )}                                    
                            </div>                               
                            <div className="w-full md:w-1/3 px-3 mb-6 md:mb-0">
                                <label
                                    className="block uppercase tracking-wide text-black text-xs font-bold mb-2"
                                    htmlFor="grid-email"
                                >
                                    Email
                                </label>
                                <input
                                    className="appearance-none block w-full bg-white text-black border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                    id="grid-email"
                                    name="email"
                                    value={dataProps.email}
                                    type="email"
                                    disabled={
                                        dataProps.deleted_at || isProcessing
                                    }
                                    onChange={(event) => handleChange(event)}
                                />
                                {errors && errors.email && (
                                    <div className="text-red-700 text-sm mt-2">
                                        {errors.email}
                                    </div>
                                )}
                            </div>
                            <div className="w-full md:w-1/3 px-3">
                                <label
                                    className="block uppercase tracking-wide text-black text-xs font-bold mb-2"
                                    htmlFor="grid-phone"
                                >
                                    Phone
                                </label>
                                <input
                                    className="appearance-none block w-full bg-white text-black border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                    id="grid-phone"
                                    type="text"
                                    name="phone"
                                    value={dataProps.phone}
                                    disabled={
                                        dataProps.deleted_at || isProcessing
                                    }
                                    onChange={(event) => handleChange(event)}
                                    required
                                />
                                {errors && errors.phone && (
                                    <div className="text-red-700 text-sm mt-2">
                                        {errors.phone}
                                    </div>
                                )}
                            </div>                              
                        </div>        
                        <div className="flex flex-wrap -mx-3 mb-6">
                            <div className="w-full md:w-1/2 px-3">
                                <label
                                    className="block uppercase tracking-wide text-black text-xs font-bold mb-2"
                                    htmlFor="grid-footer1"
                                >
                                    Footer1
                                </label>
                                <textarea
                                    className="appearance-none block w-full bg-white text-black border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                    id="grid-footer1"
                                    name="footer1"
                                    value={dataProps.footer1}
                                    disabled={
                                        dataProps.deleted_at || isProcessing
                                    }
                                    onChange={(event) => handleChange(event)}
                                    required
                                />
                                {errors && errors.footer1 && (
                                    <div className="text-red-700 text-sm mt-2">
                                        {errors.footer1}
                                    </div>
                                )}
                            </div>
                            <div className="w-full md:w-1/2 px-3">
                                <label
                                    className="block uppercase tracking-wide text-black text-xs font-bold mb-2"
                                    htmlFor="grid-footer2"
                                >
                                    Footer2
                                </label>
                                <textarea
                                    className="appearance-none block w-full bg-white text-black border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                    id="grid-footer2"
                                    name="footer2"
                                    value={dataProps.footer2}
                                    disabled={
                                        dataProps.deleted_at || isProcessing
                                    }
                                    onChange={(event) => handleChange(event)}
                                    required
                                />
                                {errors && errors.footer2 && (
                                    <div className="text-red-700 text-sm mt-2">
                                        {errors.footer2}
                                    </div>
                                )}
                            </div>
                        </div>                           
                        <div className="flex flex-wrap -mx-3 mb-6">
                            <div className="w-full md:w-1/6 px-3">
                                <label
                                    className="block uppercase tracking-wide text-black text-xs font-bold mb-2"
                                    htmlFor="grid-minimum-stok"
                                >
                                    Minimum Stok
                                </label>
                                <input
                                    className="appearance-none block w-full bg-white text-black border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                    id="grid-minimum-stok"
                                    type="number"
                                    name="minimum_stok" 
                                    step="0.1" 
                                    min="0"                                    
                                    value={dataProps.minimum_stok}             
                                    disabled={ dataProps.deleted_at || isProcessing}                                    
                                    onChange={(event) => handleChange(event)}      
                                    required                                    
                                />
                                {errors && errors.minimum_stok && (                      
                                <div className='text-red-700 text-sm mt-2'>
                                    {errors.minimum_stok}
                                </div>       
                                )}                                   
                            </div>  
                            <div className="w-full md:w-1/6 px-3">
                                <label
                                    className="block uppercase tracking-wide text-black text-xs font-bold mb-2"
                                    htmlFor="grid-minimum-margin"
                                >
                                    Minimum Margin
                                </label>
                                <input
                                    className="appearance-none block w-full bg-white text-black border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                    id="grid-minimum-margin"
                                    type="number"
                                    name="minimum_margin" 
                                    value={dataProps.minimum_margin}             
                                    disabled={dataProps.deleted_at || isProcessing}           
                                    step="0.1" 
                                    min="0"                                        
                                    onChange={(event) => handleChange(event)}                
                                    required
                                />
                                {errors && errors.minimum_margin && (                      
                                <div className='text-red-700 text-sm mt-2'>
                                    {errors.minimum_margin}
                                </div>       
                                )}                                   
                            </div>        
                            <div className="w-full md:w-1/6 px-3">
                                <label
                                    className="block uppercase tracking-wide text-black text-xs font-bold mb-2"
                                    htmlFor="grid-ceiling-threshold"
                                >
                                    Ceiling Threshold
                                </label>
                                <input
                                    className="appearance-none block w-full bg-white text-black border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                    id="grid-ceiling-threshold"
                                    type="number"
                                    name="ceiling_threshold" 
                                    step="0.1" 
                                    min="0"                                        
                                    value={dataProps.ceiling_threshold}             
                                    disabled={ dataProps.deleted_at || isProcessing}                                    
                                    onChange={(event) => handleChange(event)}            
                                    required
                                />
                                {errors && errors.ceiling_threshold && (                      
                                <div className='text-red-700 text-sm mt-2'>
                                    {errors.ceiling_threshold}
                                </div>       
                                )}                                   
                            </div>        
                            <div className="w-full md:w-1/6 px-3">
                                <label
                                    className="block uppercase tracking-wide text-black text-xs font-bold mb-2"
                                    htmlFor="grid-ppn"
                                >
                                    PPN
                                </label>
                                <input
                                    className="appearance-none block w-full bg-white text-black border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                    id="grid-ppn"
                                    type="number"
                                    name="ppn" 
                                    step="0.1" 
                                    min="0"                                        
                                    value={dataProps.ppn}             
                                    disabled={ dataProps.deleted_at || isProcessing}                                    
                                    onChange={(event) => handleChange(event)}             
                                    required
                                />
                                {errors && errors.ppn && (                      
                                <div className='text-red-700 text-sm mt-2'>
                                    {errors.ppn}
                                </div>       
                                )}                                   
                            </div>     
                            <div className="w-full md:w-1/6 px-3">
                                <label
                                    className="block uppercase tracking-wide text-black text-xs font-bold mb-2"
                                    htmlFor="grid-ppn-out"
                                >
                                    PPN OUT
                                </label>
                                <input
                                    className="appearance-none block w-full bg-white text-black border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                    id="grid-ppn-out"
                                    type="number"
                                    name="ppn_out" 
                                    step="0.1" 
                                    min="0"                                        
                                    value={dataProps.ppn_out}             
                                    disabled={ dataProps.deleted_at || isProcessing}                                    
                                    onChange={(event) => handleChange(event)}             
                                    required
                                />
                                {errors && errors.ppn_out && (                      
                                <div className='text-red-700 text-sm mt-2'>
                                    {errors.ppn_out}
                                </div>       
                                )}                                   
                            </div>                             
                            <div className="w-full md:w-1/6 px-3">
                                <label
                                    className="block uppercase tracking-wide text-black text-xs font-bold mb-2"
                                    htmlFor="grid-pph"
                                >
                                    PPH
                                </label>
                                <input
                                    className="appearance-none block w-full bg-white text-black border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                    id="grid-pph"
                                    type="number"
                                    name="pph" 
                                    step="0.1" 
                                    min="0"                                        
                                    value={dataProps.pph}             
                                    disabled={ dataProps.deleted_at || isProcessing}                                    
                                    onChange={(event) => handleChange(event)}      
                                    required
                                />
                                {errors && errors.pph && (                      
                                <div className='text-red-700 text-sm mt-2'>
                                    {errors.pph}
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
