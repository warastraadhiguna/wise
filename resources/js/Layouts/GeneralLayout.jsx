import React from 'react'

const GeneralLayout = ({ children}) => {
  return (
      <section className='min-h-screen flex flex-col justify-center items-center'>{ children }</section>
  )
}

export default GeneralLayout