import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Dog, Cat, Mail, Lock } from 'lucide-react';

const Login = () => {
    const [correo, setCorreo] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const result = await login(correo, password);
        if (result.success) {
            console.log('Login OK, navegando a dashboard');
            navigate('/dashboard', { replace: true });
        } else {
            setError(result.error);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Mitad Izquierda - Marca (Se oculta en celulares) */}
            <div className="hidden lg:flex lg:w-1/2 bg-emerald-600 flex-col justify-center items-center p-12 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
                <div className="relative z-10 flex flex-col items-center text-white">
                    <div className="flex items-end mb-6">
                        <Dog size={80} strokeWidth={1.5} />
                        <Cat size={56} strokeWidth={1.5} className="-ml-4 mb-1" />
                    </div>
                    <h1 className="text-5xl font-bold tracking-tight mb-4">VetManager</h1>
                    <p className="text-emerald-100 text-lg text-center max-w-md">
                        Gestión inteligente y rápida para tu clínica veterinaria.
                    </p>
                </div>
            </div>

            {/* Mitad Derecha - Formulario */}
            <div className="flex w-full lg:w-1/2 justify-center items-center p-8 sm:p-12">
                <div className="w-full max-w-md bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
                    <div className="lg:hidden flex items-end justify-center mb-6 text-emerald-600">
                        <Dog size={48} />
                        <Cat size={32} className="-ml-2 mb-1" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center lg:text-left">Bienvenido</h2>
                    <p className="text-gray-500 mb-8 text-center lg:text-left">Ingresa tus credenciales para continuar</p>

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r-md text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Correo Electrónico</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    value={correo}
                                    onChange={(e) => setCorreo(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                    placeholder="admin@vetmanager.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Contraseña</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200"
                        >
                            Ingresar al Sistema
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;