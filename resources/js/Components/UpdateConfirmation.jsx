import React from 'react'

const UpdateConfirmation = ({ setShowUpdateConfirmation, dataProps, handleUpdate, isProcessing  }) => {
  return (
      <section className='w-full fixed left-0 top-0 flex flex-col justify-center items-center h-screen'>
          
    <div className='w-full fixed bg-black/70 left-0 top-0 h-screen' onClick={() => setShowUpdateConfirmation(false)}></div>
          <div className="bg-white relative rounded-md">
              <header className='border-b py-2 px-6 font-bold text-xl'>Confirmation</header>
              <div className="p-6">
                  <h4>Are you sure to update <strong>{dataProps.name ?? " the data"}?</strong>?</h4>
                  
                  <div className="flex gap-4 mt-4 justify-end items-center">
                      <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-4 rounded mr-1' onClick={handleUpdate} disabled={ isProcessing }>Yes</button>
                      <button className='px-4 py-1  bg-red-600 text-white rounded-md  font-bold '  onClick={() => setShowUpdateConfirmation(false)} disabled={ isProcessing }>No</button>
                      
                  </div>
              </div>  
        </div>
    </section>
  )
}

export default UpdateConfirmation