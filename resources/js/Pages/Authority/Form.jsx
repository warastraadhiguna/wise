import { usePage } from "@inertiajs/react";
import React from "react";
import Select from "react-select";

const Form = ({
    setShowForm,
    dataProps,
    setDataProps,
    action,
    errors,
    isProcessing,
    paths,
}) => {
    const { methods, roles } = usePage().props;

    const pathOptions = Object.keys(paths).map((key) => ({
        value: paths[key].id,
        label: paths[key].name,
    }));

    const seletedPathOption = pathOptions.find(option => option.value === dataProps.path_id);
    const seletedMethod = methods.filter(method => dataProps.method.includes(method.value));
    const seletedRole = roles.filter(role => dataProps.role.includes(role.value));

    const handlePathChange = (selectedOption) => {
        setDataProps((prevData) => ({
            ...prevData,
            path_id: selectedOption.value,
            name: selectedOption.label,
        }));
    };

    const handleMethodChange = (newValue, actionMeta) => {
        switch (actionMeta.action) {
            case "remove-value":
            case "pop-value":
                setDataProps((prevData) => ({
                    ...prevData,
                    method: prevData.method.replace(actionMeta.removedValue.value + ",", "") 
                }));   
                break;
            case "select-option":
                setDataProps((prevData) => ({
                    ...prevData,
                    method: prevData.method + actionMeta.option.value + ','
                }));                    
                break;
            case "clear":
                setDataProps((prevData) => ({
                    ...prevData,
                    method: ""
                }));                
                break;
        }
    };

    const handleRoleChange = (newValue, actionMeta) => {
        switch (actionMeta.action) {
            case "remove-value":
            case "pop-value":
                setDataProps((prevData) => ({
                    ...prevData,
                    role: prevData.role.replace(actionMeta.removedValue.value + ",", "") 
                }));   
                break;
            case "select-option":
                setDataProps((prevData) => ({
                    ...prevData,
                    role: prevData.role + actionMeta.option.value + ','
                }));                    
                break;
            case "clear":
                setDataProps((prevData) => ({
                    ...prevData,
                    role: ""
                }));                
                break;
        }
    };    

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6">
                <h2 className="text-3xl font-semibold mb-5 text-center">
                    {dataProps && dataProps.id
                        ? dataProps.deleted_at
                            ? "Restore Data"
                            : "Edit Data"
                        : "Add data"}
                    <hr />
                </h2>

                <div className="max-w-4xl mx-auto">
                    <form
                        className="w-full max-w-lg"
                        onSubmit={(event) => action(event)}
                        autoComplete="off"
                    >
                        <div className="flex flex-wrap -mx-3 mb-6">
                            <div className="w-full px-3">
                                <label
                                    className="block uppercase tracking-wide text-black text-xs font-bold mb-2"
                                    htmlFor="grid-name"
                                >
                                    Path Name
                                </label>
                                <div className="inline-block relative w-full">
                                    <Select
                                        options={pathOptions}
                                        onChange={handlePathChange}
                                        name="path_id"
                                        defaultValue={seletedPathOption}
                                    />
                                </div>
                                {errors && errors.path_id && (
                                    <div className="text-red-700 text-sm mt-2">
                                        {errors.path_id}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-wrap -mx-3 mb-6">
                            <div className="w-full px-3">
                                <label
                                    className="block uppercase tracking-wide text-black text-xs font-bold mb-2"
                                    htmlFor="grid-method"
                                >
                                    Method
                                </label>
                                <div className="inline-block relative w-full">
                                    <Select
                                        // defaultValue={[colourOptions[2], colourOptions[3]]}
                                        isMulti
                                        name="method"
                                        options={methods}
                                        className="basic-multi-select"
                                        classNamePrefix="Multiple select"
                                        onChange={handleMethodChange}
                                        defaultValue={seletedMethod}
                                    />
                                </div>
                                {errors && errors.method && (
                                    <div className="text-red-700 text-sm mt-2">
                                        {errors.method}
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
                                    <Select
                                        // defaultValue={[colourOptions[2], colourOptions[3]]}
                                        isMulti
                                        name="role"
                                        options={roles}
                                        className="basic-multi-select"
                                        classNamePrefix="Multiple select"
                                        onChange={handleRoleChange}
                                       defaultValue={seletedRole}                                        
                                    />
                                    {errors && errors.role && (
                                        <div className="text-red-700 text-sm mt-2">
                                            {errors.role}
                                        </div>
                                    )}
                                </div>
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
