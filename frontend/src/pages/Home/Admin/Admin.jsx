import UsersTable from '@/components/Admin/UsersTable';
import NavBar from '@/components/Home/NavBar';
import React from 'react';

function Admin() {
  return (
    <>
      <NavBar />
      <div className='admin'>
        <div className='users'>
          <span className='text-lg p-4'>Users</span>
          <UsersTable />
        </div>
      </div>
    </>
  )
}

export default Admin