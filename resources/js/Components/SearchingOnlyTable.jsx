import { router } from '@inertiajs/react';
import React, { useRef } from 'react'

const SearchingOnlyTable = ({ searchingText, setSearchingText, filterParameter }) => {
    const temporaryText = useRef(searchingText); 
    const url = window.location.pathname;

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const uri = `${filterParameter? filterParameter + "&" : url + "?"}?searchingText=${searchingText}`;
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
                  <div></div>
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

export default SearchingOnlyTable