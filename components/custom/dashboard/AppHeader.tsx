import { SidebarTrigger } from '@/components/ui/sidebar'
import { UserButton } from '@clerk/nextjs'

const AppHeader = () => {
  return (
    <div className='w-full border p-4 flex justify-between items-center'>
        <SidebarTrigger />
        <UserButton />
    </div>
  )
}

export default AppHeader