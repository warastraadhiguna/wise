import Pagination from '@/Components/Pagination'
import { useEffect} from "react";
import React from 'react'
import { FiX } from 'react-icons/fi'

const Product = ({ products, setShowProducts, handleKeyPress, searchingText,  setSearchingText }) => {

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
                onClick={() => setShowProducts(false)}
                >
                <FiX size={24} />
                </button>              
                <h2 className="text-3xl font-semibold mb-5 text-center">
                    Products
                    <hr />
                </h2>
                <div className="w-full mx-auto">
                    <div className="max-h-96 overflow-y-auto">              
                        <table className="w-full text-sm text-left rtl:text-right text-black dark:text-gray-400">
                            <thead className="text-xs text-black border-b uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>                                 
                                    <th scope="col" className="px-6 py-3">
                                        Code
                                    </th>                               
                                    <th scope="col" className="px-6 py-3">
                                        Name
                                    </th>                         
                                    <th scope="col" className="px-6 py-3">
                                        Stok
                                    </th>  
                                    <th scope="col" className="px-6 py-3">
                                        Unit
                                    </th>       
                                    <th scope="col" className="px-6 py-3">
                                        Price
                                    </th>                                                                      
                                </tr>
                            </thead>
                            <tbody>
                            {products.data.map((product, i) => (
                                <tr
                                    key={i}
                                    className={`bg-white border-b dark:bg-gray-800 dark:border-gray-700  ${product.deleted_at? "line-through bg-yellow-50" : ""} cursor-pointer`}
                                    onClick={() =>{handleClick(product.code)}}
                                >
                                    <td className="px-6 py-4"> {product.code}</td>
                                    <td className="px-6 py-4">{product.name}</td>
                                    <td className="px-6 py-4">{Number(product.quantity).toLocaleString()}</td>
                                    <td className="px-6 py-4">{product.unit_name}</td>                               
                                    <td className="px-6 py-4">{Number(product.price).toLocaleString()}</td>
                                </tr>
                            ))}                            
                            </tbody>
                        </table>    

                        <Pagination data={products}></Pagination>
                    </div>
                </div>                
            </div>
        </div>
  )
}

export default Product