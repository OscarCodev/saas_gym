import React from 'react';
import { Link } from 'react-router-dom';
import { Users, CreditCard, BarChart3, Check, Dumbbell, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4 py-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-lime-400/10 via-slate-950 to-slate-950" />
        
        <div className="container relative mx-auto grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl">
              Gestiona tu Gimnasio <br />
              <span className="bg-gradient-to-r from-lime-400 to-green-500 bg-clip-text text-transparent">
                sin Límites
              </span>
            </h1>
            <p className="mb-8 max-w-lg text-lg text-slate-400">
              La plataforma todo en uno para administrar socios, pagos y métricas. 
              Lleva tu centro fitness al siguiente nivel con GymCore.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                to="/registro"
                className="inline-flex items-center justify-center rounded-lg bg-lime-400 px-8 py-3 text-base font-semibold text-slate-950 transition-all hover:bg-lime-500 hover:scale-105"
              >
                Comenzar Ahora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <a
                href="#pricing"
                className="inline-flex items-center justify-center rounded-lg border border-slate-700 px-8 py-3 text-base font-medium text-slate-300 transition-all hover:border-lime-400 hover:text-lime-400"
              >
                Ver Planes
              </a>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              <div className="absolute -inset-4 rounded-full bg-lime-400/20 blur-3xl" />
              <Dumbbell className="relative h-64 w-64 text-lime-400 animate-pulse" strokeWidth={1} />
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-24 bg-slate-900/50">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold text-slate-100 sm:text-4xl">Todo lo que necesitas</h2>
            <p className="mt-4 text-slate-400">Herramientas potentes para potenciar tu negocio</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Feature 1 */}
            <div className="group rounded-2xl border border-slate-800 bg-slate-900 p-8 transition-all hover:scale-105 hover:border-lime-400/30">
              <div className="mb-4 inline-flex rounded-lg bg-lime-400/10 p-3 text-lime-400">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-slate-100">Gestión de Socios</h3>
              <p className="text-slate-400">
                Administra perfiles, membresías y accesos de forma centralizada y eficiente.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group rounded-2xl border border-slate-800 bg-slate-900 p-8 transition-all hover:scale-105 hover:border-lime-400/30">
              <div className="mb-4 inline-flex rounded-lg bg-lime-400/10 p-3 text-lime-400">
                <CreditCard className="h-8 w-8" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-slate-100">Pagos Simplificados</h3>
              <p className="text-slate-400">
                Automatiza cobros, genera facturas y mantén tus finanzas bajo control.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group rounded-2xl border border-slate-800 bg-slate-900 p-8 transition-all hover:scale-105 hover:border-lime-400/30">
              <div className="mb-4 inline-flex rounded-lg bg-lime-400/10 p-3 text-lime-400">
                <BarChart3 className="h-8 w-8" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-slate-100">Métricas en Tiempo Real</h3>
              <p className="text-slate-400">
                Toma decisiones basadas en datos con dashboards intuitivos y reportes detallados.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="py-24">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold text-slate-100 sm:text-4xl">Planes Flexibles</h2>
            <p className="mt-4 text-slate-400">Elige la opción que mejor se adapte a tu gimnasio</p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3 max-w-6xl mx-auto">
            {/* BASIC PLAN */}
            <div className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900 p-8">
              <h3 className="text-xl font-semibold text-slate-100">Básico</h3>
              <div className="mt-4 mb-6">
                <span className="text-4xl font-bold text-slate-100">S/99</span>
                <span className="text-slate-400">/mes</span>
              </div>
              <ul className="mb-8 space-y-4 flex-1">
                <li className="flex items-center text-slate-300">
                  <Check className="mr-3 h-5 w-5 text-lime-400" /> Hasta 50 socios
                </li>
                <li className="flex items-center text-slate-300">
                  <Check className="mr-3 h-5 w-5 text-lime-400" /> Reportes básicos
                </li>
                <li className="flex items-center text-slate-300">
                  <Check className="mr-3 h-5 w-5 text-lime-400" /> Gestión de pagos
                </li>
              </ul>
              <Link
                to="/registro?plan=basic"
                className="block w-full rounded-lg border border-slate-700 py-3 text-center font-semibold text-slate-300 transition-colors hover:border-lime-400 hover:text-lime-400"
              >
                Seleccionar Plan
              </Link>
            </div>

            {/* PRO PLAN (Featured) */}
            <div className="relative flex flex-col rounded-2xl border-2 border-lime-400 bg-slate-900 p-8 shadow-2xl shadow-lime-400/10 transform scale-105 z-10">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-lime-400 px-4 py-1 text-xs font-bold text-slate-950">
                MÁS POPULAR
              </div>
              <h3 className="text-xl font-semibold text-slate-100">Pro</h3>
              <div className="mt-4 mb-6">
                <span className="text-4xl font-bold text-slate-100">S/269</span>
                <span className="text-slate-400">/mes</span>
              </div>
              <ul className="mb-8 space-y-4 flex-1">
                <li className="flex items-center text-slate-300">
                  <Check className="mr-3 h-5 w-5 text-lime-400" /> Hasta 200 socios
                </li>
                <li className="flex items-center text-slate-300">
                  <Check className="mr-3 h-5 w-5 text-lime-400" /> Reportes avanzados
                </li>
                <li className="flex items-center text-slate-300">
                  <Check className="mr-3 h-5 w-5 text-lime-400" /> Soporte por email
                </li>
                <li className="flex items-center text-slate-300">
                  <Check className="mr-3 h-5 w-5 text-lime-400" /> App para entrenadores
                </li>
              </ul>
              <Link
                to="/registro?plan=pro"
                className="block w-full rounded-lg bg-lime-400 py-3 text-center font-semibold text-slate-950 transition-colors hover:bg-lime-500"
              >
                Seleccionar Plan
              </Link>
            </div>

            {/* ELITE PLAN */}
            <div className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900 p-8">
              <h3 className="text-xl font-semibold text-slate-100">Elite</h3>
              <div className="mt-4 mb-6">
                <span className="text-4xl font-bold text-slate-100">S/499</span>
                <span className="text-slate-400">/mes</span>
              </div>
              <ul className="mb-8 space-y-4 flex-1">
                <li className="flex items-center text-slate-300">
                  <Check className="mr-3 h-5 w-5 text-lime-400" /> Socios ilimitados
                </li>
                <li className="flex items-center text-slate-300">
                  <Check className="mr-3 h-5 w-5 text-lime-400" /> API Access
                </li>
                <li className="flex items-center text-slate-300">
                  <Check className="mr-3 h-5 w-5 text-lime-400" /> Soporte prioritario 24/7
                </li>
                <li className="flex items-center text-slate-300">
                  <Check className="mr-3 h-5 w-5 text-lime-400" /> Marca blanca
                </li>
              </ul>
              <Link
                to="/registro?plan=elite"
                className="block w-full rounded-lg border border-slate-700 py-3 text-center font-semibold text-slate-300 transition-colors hover:border-lime-400 hover:text-lime-400"
              >
                Seleccionar Plan
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-20 bg-gradient-to-b from-slate-950 to-lime-400/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-6 text-3xl font-bold text-slate-100 sm:text-4xl">
            ¿Listo para transformar tu gimnasio?
          </h2>
          <p className="mb-8 text-lg text-slate-400">
            Únete a cientos de gimnasios que ya confían en GymCore.
          </p>
          <Link
            to="/registro"
            className="inline-flex items-center justify-center rounded-lg bg-lime-400 px-8 py-4 text-lg font-bold text-slate-950 transition-all hover:bg-lime-500 hover:scale-105 shadow-lg shadow-lime-400/20"
          >
            Empezar Prueba Gratuita
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-800 bg-slate-950 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2 text-xl font-bold text-slate-100">
              <Dumbbell className="h-6 w-6 text-lime-400" />
              <span>Gym<span className="text-lime-400">Core</span></span>
            </div>
            
            <div className="flex gap-8 text-sm text-slate-400">
              <a href="#" className="hover:text-lime-400 transition-colors">Términos</a>
              <a href="#" className="hover:text-lime-400 transition-colors">Privacidad</a>
              <a href="#" className="hover:text-lime-400 transition-colors">Contacto</a>
            </div>

            <div className="text-sm text-slate-500">
              © {new Date().getFullYear()} GymCore. Todos los derechos reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;