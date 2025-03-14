import AdminLayout from "@/Layouts/AdminLayout";
import { router, usePage } from "@inertiajs/react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Select from "react-select";

export default function Dashboard({ title, storeBranchs, selectedStoreBranchId }) {
    const { flash, errors, auth } = usePage().props;
    
    const [isVisible, setIsVisible] = useState(false);
    
    const [dataProps, setDataProps] = useState({
        storeBranchId: selectedStoreBranchId, 
    });    

    const storeBranchOptions = Object.keys(storeBranchs).map((key) => ({
        value: storeBranchs[key].id,
        label: storeBranchs[key].name + " - " + storeBranchs[key].address,
    }));   

    const selectedStoreBranchOption = storeBranchOptions.find(option => option.value === selectedStoreBranchId);
    
    const [isProcessing, setIsProcessing] = useState(false);    

    const handleOptionChange = (selectedOption, name = "") => {
        setDataProps((prevData) => ({
            ...prevData,
            [name]: selectedOption ? selectedOption.value : null,
        }));
    };   

    useEffect(() => {
        flash.success && toast.success(flash.success);
        flash.error && toast.error(flash.error);
    }, [flash]);

    useEffect(() => {
        const handleKeyPress = (event) => {
            if (event.key === "F2") {
                setIsVisible((prev) => !prev);
            }
        };

        document.addEventListener("keydown", handleKeyPress);
        return () => {
            document.removeEventListener("keydown", handleKeyPress);
        };
    }, []);

    const actionForm = (e) => {
        e.preventDefault();        
        setIsProcessing(true);

        router.put(`/dashboard`, dataProps, {
            onFinish:()=> {
                if (flash) {
                    flash.success = "";
                    flash.error = "";             
                }
                setIsProcessing(false);
            }
        });
    }    

    return (
        <AdminLayout title={title}>
            <h2 className="text-center text-xl font-semibold mb-5">Welcome to ~WISE~</h2>

                    <div className="w-1/2 mx-auto bg-white border-2 border-gray-300 p-5 rounded-lg shadow-md max-w-lg">
                        <form className="w-full" onSubmit={(event) => actionForm(event)} autoComplete="off">
                            
                            {isVisible && (
                                <div className="mb-6">
                                    <label className="block uppercase tracking-wide text-black text-xs font-bold mb-2" htmlFor="grid-storeBranch">
                                        Current Store Branch
                                    </label>
                                    <Select
                                        name="storeBranchId"
                                        options={storeBranchOptions}
                                        className="basic-single"
                                        classNamePrefix="select"
                                        onChange={(selectedOption) => handleOptionChange(selectedOption, 'storeBranchId')}
                                        defaultValue={selectedStoreBranchOption}
                                        isDisabled={isProcessing}
                                        required
                                    />
                                    {errors && errors.store_branch_id && (
                                        <div className="text-red-700 text-sm mt-2">{errors.store_branch_id}</div>
                                    )}
                                </div>)
                            }

                            {/* Submit Button */}
                            <div className={`flex justify-${ isVisible? "end mt-4 " : "center"}`}>
                                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded" type="submit" disabled={isProcessing}>
                                    { isVisible? "Save" : "You are not robot"}
                                </button>
                            </div>

                        </form>
                </div>
            
        </AdminLayout>
    );
}
