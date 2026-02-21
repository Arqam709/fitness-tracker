//for same things like navbar and footer
import {Outlet} from 'react-router-dom'
import Sidebar from '../Components/Sidebar'
import BottomNav from '../Components/BottomNav'

const layout = () => {
  return (
    <div className='layout-container'>
      <Sidebar/>

      <div className='flex-1 overflow-y-scroll'>
<Outlet />
      </div>
    
    <BottomNav/>
    </div>
  )
}

export default layout
