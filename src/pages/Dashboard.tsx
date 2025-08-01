import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { Users, FileText, CreditCard, Settings, LogOut, Crown, Play, Download } from 'lucide-react';

interface Profile {
  id: string;
  full_name: string;
  avatar_url?: string;
}

interface UserRole {
  role: 'admin' | 'member' | 'guest';
}

interface Subscription {
  id: string;
  status: string;
  subscription_plans: {
    name: string;
    description: string;
  };
}

interface Content {
  id: string;
  title: string;
  description?: string;
  content_type: string;
  thumbnail_url?: string;
  content_categories?: {
    name: string;
  };
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [content, setContent] = useState<Content[]>([]);
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalContent: 0,
    activeSubscriptions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      // Load profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      
      if (profileData) setProfile(profileData);

      // Load user role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user?.id)
        .single();
      
      if (roleData) setUserRole(roleData);

      // Load subscription
      const { data: subscriptionData } = await supabase
        .from('subscriptions')
        .select(`
          *,
          subscription_plans (name, description)
        `)
        .eq('user_id', user?.id)
        .eq('status', 'active')
        .single();
      
      if (subscriptionData) setSubscription(subscriptionData);

      // Load content
      const { data: contentData } = await supabase
        .from('content')
        .select(`
          *,
          content_categories (name)
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false });
      
      if (contentData) setContent(contentData);

      // Load stats for admin
      if (roleData?.role === 'admin') {
        const [membersResult, contentResult, subscriptionsResult] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('content').select('*', { count: 'exact', head: true }),
          supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        ]);

        setStats({
          totalMembers: membersResult.count || 0,
          totalContent: contentResult.count || 0,
          activeSubscriptions: subscriptionsResult.count || 0,
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do usuário",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } else {
      navigate('/auth');
    }
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Play className="h-4 w-4" />;
      case 'pdf':
        return <Download className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
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

  const isAdmin = userRole?.role === 'admin';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold">MemberScribe</h1>
              {isAdmin && <Badge variant="secondary"><Crown className="h-3 w-3 mr-1" />Admin</Badge>}
            </div>
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
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue={isAdmin ? "admin" : "content"} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="content" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Conteúdo
            </TabsTrigger>
            <TabsTrigger value="subscription" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Assinatura
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="admin" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Admin
              </TabsTrigger>
            )}
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Perfil
            </TabsTrigger>
          </TabsList>

          {/* Admin Panel */}
          {isAdmin && (
            <TabsContent value="admin" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-6">Painel Administrativo</h2>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total de Membros</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalMembers}</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Conteúdos Publicados</CardTitle>
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalContent}</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Assinaturas Ativas</CardTitle>
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Gerenciar Conteúdo</CardTitle>
                      <CardDescription>
                        Adicione, edite ou remova conteúdos da plataforma
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full">
                        Gerenciar Conteúdos
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Gerenciar Usuários</CardTitle>
                      <CardDescription>
                        Visualize e gerencie membros da plataforma
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full" variant="outline">
                        Ver Membros
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          )}

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-6">Biblioteca de Conteúdo</h2>
              
              {content.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhum conteúdo disponível</h3>
                    <p className="text-muted-foreground">
                      Novos conteúdos serão exibidos aqui quando disponíveis.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {content.map((item) => (
                    <Card key={item.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{item.title}</CardTitle>
                          {getContentIcon(item.content_type)}
                        </div>
                        {item.content_categories && (
                          <Badge variant="secondary" className="w-fit">
                            {item.content_categories.name}
                          </Badge>
                        )}
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="mb-4">
                          {item.description || 'Sem descrição disponível'}
                        </CardDescription>
                        <Button className="w-full">
                          Acessar Conteúdo
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-6">Minha Assinatura</h2>
              
              <Card>
                <CardHeader>
                  <CardTitle>Status da Assinatura</CardTitle>
                </CardHeader>
                <CardContent>
                  {subscription ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Plano Atual:</span>
                        <Badge variant="default">{subscription.subscription_plans.name}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Status:</span>
                        <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
                          {subscription.status === 'active' ? 'Ativo' : subscription.status}
                        </Badge>
                      </div>
                      <Separator />
                      <p className="text-sm text-muted-foreground">
                        {subscription.subscription_plans.description}
                      </p>
                      <Button variant="outline" className="w-full">
                        Gerenciar Assinatura
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Nenhuma assinatura ativa</h3>
                      <p className="text-muted-foreground mb-4">
                        Escolha um plano para acessar conteúdo exclusivo
                      </p>
                      <Button>Ver Planos Disponíveis</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-6">Meu Perfil</h2>
              
              <Card>
                <CardHeader>
                  <CardTitle>Informações Pessoais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Nome Completo</label>
                      <p className="text-muted-foreground">{profile?.full_name || 'Não informado'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Email</label>
                      <p className="text-muted-foreground">{user?.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Tipo de Conta</label>
                      <Badge variant="secondary">{userRole?.role || 'member'}</Badge>
                    </div>
                  </div>
                  <Separator />
                  <Button variant="outline">
                    Editar Perfil
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;