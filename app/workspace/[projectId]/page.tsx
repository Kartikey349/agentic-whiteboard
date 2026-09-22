"use client"
import SmartDoc from '@/components/custom/workspace/SmartDoc'
import Whiteboard from '@/components/custom/workspace/Whiteboard'
import WorkspaceHeader from '@/components/custom/workspace/WorkspaceHeader'
import { useState } from 'react'

const Workspace = () => {


    const [activeTab, setActiveTab] = useState('Whiteboard')

  return (
    <div> 
        <WorkspaceHeader selectedTab={(value: string) => setActiveTab(value)} />

        {activeTab === "Whiteboard" ? <Whiteboard />: <SmartDoc />}
    </div>
  )
}

export default Workspace