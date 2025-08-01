import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { toast } from '@/hooks/use-toast';
import { LogOut } from 'lucide-react';

interface UserRole {
  role: 'admin' | 'member' | 'guest';
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      // Load user role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user?.id)
        .single();
      
      if (roleData) setUserRole(roleData);

      // Load profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      
      if (profileData) setProfile(profileData);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        toast({
          title: "Erro",
          description: error.message,
          variant: "destructive",
        });
      } else {
        window.location.href = '/auth';
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao fazer logout",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se estamos na rota exata do dashboard, mostrar uma página de visão geral
  const isMainDashboard = location.pathname === '/dashboard';

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar userRole={userRole?.role || 'member'} />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="border-b bg-card">
            <div className="flex h-14 items-center px-4 gap-4">
              <SidebarTrigger />
              <div className="flex-1" />
              <div className="flex items-center space-x-4">
                <span className="text-sm text-muted-foreground">
                  Olá, {profile?.full_name || user?.email}
                </span>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6">
            {isMainDashboard ? (
              <DashboardOverview userRole={userRole?.role || 'member'} />
            ) : (
              <Outlet />
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

// Componente para a página de visão geral do dashboard
const DashboardOverview = ({ userRole }: { userRole: string }) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {userRole === 'admin' ? 'Painel Administrativo' : 'Minha Área'}
        </h1>
        <p className="text-muted-foreground">
          {userRole === 'admin' 
            ? 'Gerencie sua plataforma e conteúdos'
            : 'Acesse seus cursos e materiais'
          }
        </p>
      </div>

      {userRole === 'admin' ? (
        <AdminOverview />
      ) : (
        <MemberOverview />
      )}
    </div>
  );
};

const AdminOverview = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-card p-6 rounded-lg border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total de Membros</p>
            <p className="text-2xl font-bold">23</p>
          </div>
          <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
            👥
          </div>
        </div>
      </div>
      
      <div className="bg-card p-6 rounded-lg border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Conteúdos</p>
            <p className="text-2xl font-bold">12</p>
          </div>
          <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
            📚
          </div>
        </div>
      </div>
      
      <div className="bg-card p-6 rounded-lg border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Receita Mensal</p>
            <p className="text-2xl font-bold">R$ 2.340</p>
          </div>
          <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
            💰
          </div>
        </div>
      </div>
      
      <div className="bg-card p-6 rounded-lg border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Assinaturas Ativas</p>
            <p className="text-2xl font-bold">18</p>
          </div>
          <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
            ⭐
          </div>
        </div>
      </div>
    </div>
  );
};

const MemberOverview = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-card p-6 rounded-lg border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Aulas Concluídas</p>
            <p className="text-2xl font-bold">8</p>
          </div>
          <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
            ✅
          </div>
        </div>
      </div>
      
      <div className="bg-card p-6 rounded-lg border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Próxima Aula</p>
            <p className="text-lg font-semibold">Marketing Digital</p>
          </div>
          <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
            📖
          </div>
        </div>
      </div>
      
      <div className="bg-card p-6 rounded-lg border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Progresso Geral</p>
            <p className="text-2xl font-bold">67%</p>
          </div>
          <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
            📊
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;