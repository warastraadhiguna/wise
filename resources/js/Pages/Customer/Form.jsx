import React from "react";
import Dropdown from "@/Components/Dropdown";

const Form = ({
    setShowForm,
    dataProps,
    setDataProps,
    action,
    errors,
    isProcessing,
    priceCategories
}) => {
    const handleChange = (event) => {
        setDataProps((prevData) => ({
            ...prevData,
            [event.target.name]: event.target.value,
        }));
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full p-6">
                <h2 className="text-3xl font-semibold mb-5 text-center">
                    {dataProps && dataProps.id
                        ? dataProps.deleted_at
                            ? "Restore Data"
                            : "Edit Data"
                        : "Add data"}
                    <hr />
                </h2>
                <div className="w-full mx-auto">
                    <form
                        className="w-full"
                        onSubmit={(event) => action(event)}
                        autoComplete="off"
                    >
                        <div className="flex flex-wrap -mx-3 mb-6">
                            <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
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
                                    value={dataProps.name}
                                    type="text"
                                    disabled={
                                        dataProps.deleted_at || isProcessing
                                    }
                                    onChange={(event) => handleChange(event)}
                                />
                                {errors && errors.name && (
                                    <div className="text-red-700 text-sm mt-2">
                                        {errors.name}
                                    </div>
                                )}
                            </div>
                            <div className="w-full md:w-1/2 px-3">
                                <label
                                    className="block uppercase tracking-wide text-black text-xs font-bold mb-2"
                                    htmlFor="grid-company-name"
                                >
                                    Company Name
                                </label>
                                <input
                                    className="appearance-none block w-full bg-white text-black border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                    id="grid-company-name"
                                    type="text"
                                    name="company_name"
                                    value={dataProps.company_name}
                                    disabled={
                                        dataProps.deleted_at || isProcessing
                                    }
                                    onChange={(event) => handleChange(event)}
                                />
                                {errors && errors.company_name && (
                                    <div className="text-red-700 text-sm mt-2">
                                        {errors.company_name}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-wrap -mx-3 mb-6">
                            <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
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
                            <div className="w-full md:w-1/2 px-3">
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
                                />
                                {errors && errors.phone && (
                                    <div className="text-red-700 text-sm mt-2">
                                        {errors.phone}
                                    </div>
                                )}
                            </div>
                        </div>                    
                        <div className="flex flex-wrap -mx-3 mb-6">
                            <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
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
                                    onChange={(event) => handleChange(event)}/>
                                {errors && errors.address && (
                                    <div className="text-red-700 text-sm mt-2">
                                        {errors.address}
                                    </div>
                                )}
                            </div>
                            <div className="w-full md:w-1/2 px-3">
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
                            <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                                <label
                                    className="block uppercase tracking-wide text-black text-xs font-bold mb-2"
                                    htmlFor="grid-bank-account"
                                >
                                    Bank Account
                                </label>
                                <input
                                    className="appearance-none block w-full bg-white text-black border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                    id="grid-bank-account"
                                    name="bank_account"
                                    value={dataProps.bank_account}
                                    type="text"
                                    disabled={
                                        dataProps.deleted_at || isProcessing
                                    }
                                    onChange={(event) => handleChange(event)}
                                />
                                {errors && errors.bank_account && (
                                    <div className="text-red-700 text-sm mt-2">
                                        {errors.bank_account}
                                    </div>
                                )}
                            </div>
                            <div className="w-full md:w-1/2 px-3">
                                <label
                                    className="block uppercase tracking-wide text-black text-xs font-bold mb-2"
                                    htmlFor="grid-price-category"
                                >
                                    Price Category
                                </label>
                                <div className="inline-block relative w-full">
                                    <select className="block appearance-none w-full bg-white text-black border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" name="price_category_id" value={dataProps.price_category_id}
                                        onChange={(event) => handleChange(event)} disabled={dataProps.deleted_at || isProcessing}>
                                        <option value="">--Choose option--</option>                                        
                                        {priceCategories.map((priceCategory, i) => (<option key={i} value={priceCategory.id}>{ priceCategory.name }</option>))}
                                        
                                        
                                    </select>
                                    {errors && errors.price_category_id && (                      
                                    <div className='text-red-700 text-sm mt-2'>
                                        {errors.price_category_id}
                                    </div>       
                                    )}                                      
                                </div>
                                {errors && errors.price_category_id && (
                                    <div className="text-red-700 text-sm mt-2">
                                        {errors.price_category_id}
                                    </div>
                                )}
                            </div>
                        </div>                                            
                        <div className="mt-4 flex justify-end">
                            <button
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mr-4"
                                type="submit"
                                disabled={isProcessing}
                            >
                                {dataProps &&
                                dataProps.id &&
                                dataProps.deleted_at
                                    ? "Restore"
                                    : "Save"}
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
