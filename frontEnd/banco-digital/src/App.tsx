import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { AuthProvider } from './contexts/AuthContext'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PublicRoute from './routes/PublicRoute'
import ProtectedRoute from './routes/ProtectedRoute'
import Login from './pages/Login'
import DashBoard from './pages/DashBoard'
import Cadastro from './pages/Cadastro'
function App() {


  return (
    <>
     <AuthProvider>
      <BrowserRouter>
         
        <Routes>
          <Route path="/Login" element={
            <PublicRoute>
             <Login/>
            </PublicRoute>
          } />

          <Route path="/" element={
            <ProtectedRoute>
             <DashBoard/>
            </ProtectedRoute>
          } />
           <Route path="/cadastro" element={
            <PublicRoute>
             <Cadastro/>
            </PublicRoute>
          } />
        

         
        </Routes>

      </BrowserRouter>
     </AuthProvider>
    </>
  )
}

export default App
