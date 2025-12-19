import React from 'react';
import { Link } from 'react-router-dom';
import { Dumbbell } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-slate-100">
          <Dumbbell className="h-6 w-6 text-lime-400" />
          <span>Gym<span className="text-lime-400">Core</span></span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm font-medium text-slate-300 hover:text-lime-400 transition-colors">
            Inicio
          </Link>
          <a href="#features" className="text-sm font-medium text-slate-300 hover:text-lime-400 transition-colors">
            Características
          </a>
          <a href="#pricing" className="text-sm font-medium text-slate-300 hover:text-lime-400 transition-colors">
            Precios
          </a>
        </div>

        <div className="flex items-center gap-4">
          <Link 
            to="/login" 
            className="hidden sm:block text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            Iniciar Sesión
          </Link>
          <Link 
            to="/registro" 
            className="rounded-md bg-lime-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-lime-500 transition-colors"
          >
            Registrarse
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;