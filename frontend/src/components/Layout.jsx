import { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
    LayoutDashboard, 
    Users, 
    CalendarDays, 
    PawPrint, 
    LogOut,
    Dog,
    Cat,
    Package
} from 'lucide-react';

const Layout = ({ children }) => {
    const { usuario, logout } = useContext(AuthContext);
    const location = useLocation(); // Para saber en qué página estamos y pintar el botón activo

   // Definimos el menú centralizado
    const menuItems = [
        // El Dashboard lo ven todos (Admin: 1, Vet: 2, Recep: 3)
        { path: '/dashboard', name: 'Dashboard', icon: LayoutDashboard, roles: [1, 2, 3] }, 
        
        // Usuarios SOLO lo ve el Admin (RF-03)
        { path: '/usuarios', name: 'Usuarios', icon: Users, roles: [1] }, 
        
        // Citas y Mascotas lo ven todos
        { path: '/clientes', name: 'Clientes', icon: Users, roles: [1, 2, 3] },
        { path: '/citas', name: 'Citas', icon: CalendarDays, roles: [1, 2, 3] }, 
        { path: '/mascotas', name: 'Mascotas', icon: PawPrint, roles: [1, 2, 3] },
        { path: '/inventario', name: 'Inventario', icon: Package, roles: [1, 2, 3] },
    ];
    
    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            
            {/* BARRA LATERAL (Sidebar) - Estilo nTask (Oscuro) */}
            <aside className="w-64 bg-[#1e293b] text-white flex flex-col hidden md:flex">
                {/* Logo Area */}
                <div className="h-16 flex items-center px-6 bg-[#0f172a] border-b border-gray-800">
                    <Dog size={24} className="text-emerald-400" />
                    <Cat size={18} className="text-emerald-400 -ml-1 mr-2" />
                    <span className="text-lg font-bold tracking-wide">VetManager Pro</span>
                </div>

                {/* Navegación */}
                <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
                    {menuItems.map((item) => {
                        // Ocultar opciones si el usuario no tiene el rol necesario
                        if (!item.roles.includes(usuario?.rolId)) return null;

                        const isActive = location.pathname === item.path;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                                    isActive 
                                    ? 'bg-emerald-600 text-white font-medium' 
                                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                }`}
                            >
                                <item.icon size={20} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* Perfil Inferior en Sidebar */}
                <div className="p-4 bg-[#0f172a] border-t border-gray-800">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-sm font-bold">
                            {usuario?.nombreCompleto?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-medium truncate">{usuario?.nombreCompleto}</span>
                            <span className="text-xs text-slate-400">{usuario?.rolId === 1 ? 'Administrador' : 'Staff'}</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* ÁREA PRINCIPAL (Header + Contenido) */}
            <div className="flex-1 flex flex-col overflow-hidden">
                
                {/* Top Header */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-10">
                    <div className="text-gray-800 font-medium">
                        {/* Aquí podrías poner un breadcrumb o título dinámico si quisieras */}
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={logout}
                            className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 font-medium transition-colors"
                        >
                            <LogOut size={18} />
                            Cerrar Sesión
                        </button>
                    </div>
                </header>

                {/* Contenedor dinámico donde se inyectan las pantallas (El Outlet manual) */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;