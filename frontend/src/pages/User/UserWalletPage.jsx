import React, { useState } from 'react'
import WalletPage from '../../components/WalletPage'
import UserSidebar from '../../components/UserSidebar'

function UserWalletPage() {
  const [activeSection] = useState("wallet");

  return (

         <div className="flex h-screen bg-gray-100 overflow-auto">
        <UserSidebar activeSection={activeSection} />
      <WalletPage/>
    </div>
  )
}

export default UserWalletPage
