import { useState } from 'react'

import viteLogo from '/vite.svg'
import './App.css'
import { Route ,BrowserRouter,Routes } from 'react-router-dom'
import PumpLive from './pages/PumpLive' ;
function App() {


  return (
   <BrowserRouter>
   <Routes>
    <Route path='/' element={<PumpLive/>} />
   </Routes>
   </BrowserRouter>
  )
}

export default App
