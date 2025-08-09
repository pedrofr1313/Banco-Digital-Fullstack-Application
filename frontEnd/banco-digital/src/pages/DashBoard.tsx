import React, { useState } from "react";
import { LogOut } from "lucide-react";
import { apiClient } from "@/api/apiClient";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext";
const DashBoard = () => {
 const [isModalOpen, setIsModalOpen] = useState(false);
 const { logout, user } = useAuth();
   const confirmLogout = async () => {

        const response = await apiClient.post('/auth/logout');
       if (response.success) {
        logout(); // Chama o método logout
       }
       
    };
return (
    <div>
      {/* Navbar */}
      <div className="fixed top-0 left-0 w-full h-16 bg-green-600 text-white flex items-center justify-between px-6 shadow-md z-50">
        <div className="font-bold text-lg">Banco Digital</div>
        <nav className="space-x-4 flex items-center">
          <p className="hover:text-gray-300 cursor-pointer">Home</p>
          <p className="hover:text-gray-300 cursor-pointer">Sobre</p>

          {/* Ícone de Logout */}
          <div
            className="hover:text-gray-300 cursor-pointer"
            onClick={() => setIsModalOpen(true)}
          >
            <LogOut size={20} />
          </div>
        </nav>
      </div>

      {/* div de confirmação */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg w-80 text-center">
            <h2 className="text-lg font-semibold mb-4">
              Tem certeza que deseja realizar logout?
            </h2>
            <div className="flex justify-center gap-4">
              <Button
                onClick={()=> confirmLogout()}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Confirmar
              </Button>
              <Button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashBoard;