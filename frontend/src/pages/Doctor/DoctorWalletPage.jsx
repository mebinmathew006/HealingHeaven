import React, { useState } from 'react'
import WalletPage from '../../components/WalletPage'
import DoctorSidebar from '../../components/DoctorSidebar';

function DoctorWalletPage() {
  const [activeSection] = useState("doctor_wallet");

  return (

         <div className="flex h-screen bg-gray-100 overflow-auto">
        <DoctorSidebar activeSection={activeSection} />
      <WalletPage/>
    </div>
  )
}

export default DoctorWalletPage
