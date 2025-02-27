import SearchUsers from '@/components/Searchusers'
import React from 'react'

const Search = () => {
  return (
    <div className='flex flex-col items-center gap-2 mt-4 min-h-screen'>
      <div>
        Search
      </div>
      <div className='flex flex-col items-center min-h-screen py-4 px-4 gap-4 w-full max-w-xl rounded-2xl border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900'>
        <SearchUsers />
      </div>
    </div>
  )
}

export default Search