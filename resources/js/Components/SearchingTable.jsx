import { router } from '@inertiajs/react';
import React, { useRef } from 'react'

const SearchingTable = ({ perPage, setPerPage, searchingText, setSearchingText, filterParameter }) => {
    const temporaryText = useRef(searchingText); 
    const url = window.location.pathname;

    const changePerPage = (e) => {
        e.preventDefault();   
        const uri = `${filterParameter? filterParameter + "&" : url + "?"}page=1&perPage=${e.target.value}&searchingText=${searchingText}`;
        router.get(uri, {}, {
            onSuccess: () => {
                temporaryText.current = searchingText;         
            }
        });       
        
        setPerPage(e.target.value);        
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const uri = `${filterParameter? filterParameter + "&" : url + "?"}?page=1&perPage=${perPage}&searchingText=${searchingText}`;
            router.get(uri, {}, {
                onSuccess: () => {
                    temporaryText.current = searchingText;
                }
            });
        } 
    };
    
    return (
        <div className="container mx-auto my-3">
            <div className="grid grid-cols-2 gap-4">
                <div className='ml-2'>
                    <div  className="hidden md:block">
                        <select className="block appearance-none w-20 bg-white text-black border border-gray-200 rounded  mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" name="perPage" value={perPage}  onChange={(event) => changePerPage(event)}>
                            <option value="10">10</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                    </div>
                </div>

                <div className="flex justify-end items-center mr-2">
                    <input
                        className={`appearance-none block w-60 bg-white focus:outline-none focus:bg-white ${temporaryText.current === searchingText? "text-black border-gray-400 focus:border-blue-500" : "text-red-600 border-red-500 focus:border-red-500" }  border rounded leading-tight `}
                        id="grid-search-name"
                        name="name"
                        type="text"
                        placeholder='Search & Enter...'
                        value={searchingText}
                        autoFocus
                        onChange={(event) => setSearchingText(event.target.value)}
                        onKeyDown={handleKeyPress} 
                    />
                </div>
            </div>
        </div>
  )
}

export default SearchingTable