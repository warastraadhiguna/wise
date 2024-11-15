import React,{ useEffect} from 'react'
import { FiX } from 'react-icons/fi'


const Order = ({ orderDetails, setShowOrderDetails, handleKeyPress, setSearchingText, searchingText}) => {

    const handleClick = (code) => {
        setSearchingText(code);
    }

    useEffect(() => {
        let event = new KeyboardEvent('keydown', {
            key: 'Enter',
            code: 'Enter',
            keyCode: 13, // kode ASCII untuk 'Enter'
            which: 13,
            bubbles: true // agar event bisa naik ke elemen parent
        });
        handleKeyPress(event);
    }, [searchingText]); 
return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full p-6 relative">
            <button
            className="absolute right-4 top-4 text-gray-600 hover:text-gray-900"
            onClick={() => setShowOrderDetails(false)}
            >
            <FiX size={24} />
            </button>              
            <h2 className="text-3xl font-semibold mb-5 text-center">
                Input Order Details
                <hr />
            </h2>
            <div className="w-full mx-auto">
                <div className="max-h-96 overflow-y-auto">              
                        <table className="w-full text-sm text-left rtl:text-right text-black dark:text-gray-400 ">
                            <thead className="text-xs text-black border-b uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th scope="col" className="px-6 py-3" width="5%">
                                        No
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        Name
                                    </th>
                                    <th scope="col" className="px-6 py-3" width="15%">
                                        Quantity
                                    </th>
                                    <th scope="col" className="px-6 py-3" width="10%">
                                        Unit
                                    </th>
                                
                                </tr>
                            </thead>
                            <tbody>
                            {orderDetails
                                .filter(orderDetail => orderDetail.quantity == null && orderDetail.deleted_at == null) 
                                .map((orderDetail, i) => (
                                    <tr
                                        key={i}
                                        className={`bg-white border-b dark:bg-gray-800 dark:border-gray-700 cursor-pointer`}                                        
                                        onClick={() => { handleClick(orderDetail.product.code) }}
                                    >
                                        <td
                                            scope="row"
                                            className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white "
                                        >
                                            {i + 1}
                                        </td>
                                        <td className="px-6 py-4">{orderDetail.product ? orderDetail.product.name : ""}                                            {orderDetail.product ?
                                            " (" + orderDetail.product.code + ")" : ""
                                        }
                                        </td>
                                        <td className="px-6 py-4">{Number(orderDetail.order_quantity).toLocaleString()}</td>

                                        <td className="px-6 py-4">{orderDetail.product ? orderDetail.product.unit.name : ""}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                </div>
            </div>                
        </div>
    </div>
)}

export default Order