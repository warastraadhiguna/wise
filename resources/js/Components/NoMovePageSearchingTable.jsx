import React, { useRef } from 'react'

const NoMovePageSearchingTable = ({ searchingText, setSearchingText }) => {
    return (
        <div className="container mx-auto my-3">
            <div className="flex justify-end">
                <input
                    className="appearance-none block w-60 bg-white focus:outline-none focus:bg-white text-black border-gray-400 focus:border-blue-500 border rounded leading-tight"
                    id="grid-search-name"
                    name="name"
                    type="text"
                    placeholder="Search & Enter..."
                    value={searchingText}
                    autoFocus
                    onChange={(event) => setSearchingText(event.target.value)}
                />
            </div>
        </div>

    )
}

export default NoMovePageSearchingTable