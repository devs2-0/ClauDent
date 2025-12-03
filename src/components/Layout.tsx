// Main layout (LOGO MÁS GRANDE)
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Stethoscope, 
  FileText, 
  Search,
  Menu,
  X,
  LogOut,
  History,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp, Patient } from '@/state/AppContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Estados para el buscador directo
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout, patients } = useApp();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [recentSearches, setRecentSearches] = useState<Patient[]>([]);

  // Detectar móvil para cerrar sidebar
  useEffect(() => {
    const handleResize = () => {
        if (window.innerWidth < 768 && sidebarOpen) {
             setSidebarOpen(false);
        }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]);

  // Manejo de clics fuera del buscador
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNavigateToPatient = (patient: Patient) => {
    setRecentSearches(prev => {
        const filtered = prev.filter(p => p.id !== patient.id);
        return [patient, ...filtered].slice(0, 5);
    });
    
    setShowResults(false);
    setSearchQuery(''); // Limpiar búsqueda
    navigate(`/pacientes/${patient.id}`);
  };

  const handleLogout = () => setShowLogoutConfirm(true);

  const confirmLogout = () => {
    logout();
    navigate('/login');
    setShowLogoutConfirm(false);
  };

  const navItems = [
    { icon: Home, label: 'Principal', path: '/dashboard' },
    { icon: Users, label: 'Pacientes', path: '/pacientes' },
    { icon: Stethoscope, label: 'Servicios', path: '/servicios' },
    { icon: FileText, label: 'Cotizaciones', path: '/cotizaciones' },
  ];

  const filteredPatients = patients.filter(p => {
      const searchLower = searchQuery.toLowerCase();
      return p.nombres.toLowerCase().includes(searchLower) || 
              p.apellidos.toLowerCase().includes(searchLower) ||
              (p.curp && p.curp.toLowerCase().includes(searchLower));
  }).slice(0, 10); 

  return (
    <div className="min-h-screen bg-background w-full flex flex-col">
      {/* Top Navigation */}
      <header className="h-16 border-b border-border bg-card sticky top-0 z-40 flex items-center px-4 gap-4 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

        <div className="flex items-center gap-3">
          {/* --- ÁREA DEL LOGO MODIFICADA (MÁS GRANDE) --- */}
          
          {/* LOGO IMAGEN: Descomenta y usa esta línea. Ahora es h-12 w-12 (más grande) */}
          <img src="/logo.png" alt="ClauDent Logo" className="w-16 object-contain rounded-md" /> 

          {/* NOMBRE DE LA EMPRESA */}
          <h1 className="text-xl font-bold text-foreground hidden sm:block">ClauDent</h1>
        </div>

        {/* BUSCADOR GLOBAL */}
        <div className="flex-1 max-w-md mx-auto relative z-50" ref={searchContainerRef}>
            <Command 
                shouldFilter={false} 
                className="rounded-lg border shadow-sm overflow-visible bg-background"
            >
                <div className="flex items-center border-0 px-3" cmdk-input-wrapper="">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    <input
                        className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Buscar paciente (Nombre o CURP)..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setShowResults(true);
                        }}
                        onFocus={() => setShowResults(true)}
                    />
                </div>

                {showResults && (
                    <div className="absolute top-full left-0 w-full bg-popover border rounded-b-md shadow-lg mt-1 max-h-[300px] overflow-y-auto">
                        <CommandList>
                            {!searchQuery && recentSearches.length > 0 && (
                                <CommandGroup heading="Recientes">
                                    {recentSearches.map((patient) => (
                                        <CommandItem key={patient.id} value={patient.id + "recent"} onSelect={() => handleNavigateToPatient(patient)}>
                                            <History className="mr-2 h-4 w-4 text-muted-foreground" />
                                            <span>{patient.nombres} {patient.apellidos}</span>
                                        </CommandItem>
                                    ))}
                                    <CommandSeparator />
                                </CommandGroup>
                            )}

                            {searchQuery && filteredPatients.length === 0 && (
                                <CommandEmpty>No se encontraron pacientes.</CommandEmpty>
                            )}

                            {searchQuery && filteredPatients.length > 0 && (
                                <CommandGroup heading="Pacientes">
                                    {filteredPatients.map((patient) => (
                                        <CommandItem
                                            key={patient.id}
                                            value={patient.id}
                                            onSelect={() => handleNavigateToPatient(patient)}
                                        >
                                            <User className="mr-2 h-4 w-4 text-muted-foreground" />
                                            <div className="flex flex-col">
                                                <span>{patient.nombres} {patient.apellidos}</span>
                                                {patient.curp && <span className="text-xs text-muted-foreground">{patient.curp}</span>}
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            )}
                        </CommandList>
                    </div>
                )}
            </Command>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-foreground">{currentUser?.email}</p>
            <p className="text-xs text-muted-foreground">Dentista</p> 
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            aria-label="Cerrar sesión"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <Dialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>¿Cerrar sesión?</DialogTitle>
            <DialogDescription>
              Saldrás de tu cuenta actual y deberás ingresar de nuevo para continuar.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowLogoutConfirm(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmLogout}>
              Cerrar sesión
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Sidebar Desktop */}
        <AnimatePresence mode="wait">
          {sidebarOpen && window.innerWidth >= 768 && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 250, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-r border-border bg-sidebar h-full hidden md:block"
            >
              <nav className="p-4 space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors whitespace-nowrap',
                        isActive
                          ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent'
                      )}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Sidebar Mobile (Overlay) */}
        <AnimatePresence>
          {sidebarOpen && window.innerWidth < 768 && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
                className="fixed inset-0 bg-black/50 z-40 md:hidden"
                style={{ top: '64px' }} 
              />
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                className="fixed top-16 left-0 bottom-0 w-64 bg-background border-r border-border z-50 md:hidden shadow-xl"
              >
                <nav className="p-4 space-y-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={cn(
                          'flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors',
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'text-foreground hover:bg-muted'
                        )}
                      >
                        <Icon className="h-5 w-5 shrink-0" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
                <div className="absolute bottom-8 left-0 w-full px-4">
                    <div className="p-4 bg-muted/50 rounded-xl flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                            {currentUser?.email?.charAt(0).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium truncate">{currentUser?.email}</p>
                            <p className="text-xs text-muted-foreground">Dentista</p>
                        </div>
                    </div>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-secondary/10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export default Layout;