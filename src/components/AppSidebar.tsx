import { 
  Home, 
  Settings, 
  CreditCard, 
  FileText, 
  Users, 
  BookOpen, 
  User, 
  Crown,
  Play,
  Download,
  ShoppingBag
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';

interface AppSidebarProps {
  userRole: 'admin' | 'member' | 'guest';
}

export function AppSidebar({ userRole }: AppSidebarProps) {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === 'collapsed';

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted/50';

  const memberItems = [
    { title: 'Visão Geral', url: '/dashboard', icon: Home },
    { title: 'Meus Produtos', url: '/dashboard/products', icon: ShoppingBag },
    { title: 'Aulas', url: '/dashboard/lessons', icon: Play },
    { title: 'Downloads', url: '/dashboard/downloads', icon: Download },
    { title: 'Minha Assinatura', url: '/dashboard/subscription', icon: CreditCard },
    { title: 'Meu Perfil', url: '/dashboard/profile', icon: User },
  ];

  const adminItems = [
    { title: 'Dashboard Admin', url: '/dashboard/admin', icon: Crown },
    { title: 'Usuários', url: '/dashboard/admin/users', icon: Users },
    { title: 'Produtos Digitais', url: '/dashboard/admin/products', icon: ShoppingBag },
    { title: 'Aulas & Conteúdo', url: '/dashboard/admin/content', icon: BookOpen },
    { title: 'Pagamentos', url: '/dashboard/admin/payments', icon: CreditCard },
    { title: 'Configurações', url: '/dashboard/admin/settings', icon: Settings },
  ];

  const items = userRole === 'admin' ? adminItems : memberItems;

  return (
    <Sidebar className={collapsed ? 'w-14' : 'w-64'}>
      <SidebarContent>
        {/* Logo Section */}
        <div className="p-4 border-b">
          {!collapsed ? (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-bold text-lg">MemberScribe</h2>
                <p className="text-xs text-muted-foreground">Plataforma Digital</p>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mx-auto">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
          )}
        </div>

        {/* User Role Badge */}
        {!collapsed && (
          <div className="p-4">
            <Badge variant={userRole === 'admin' ? 'default' : 'secondary'} className="w-fit">
              {userRole === 'admin' ? (
                <>
                  <Crown className="h-3 w-3 mr-1" />
                  Administrador
                </>
              ) : (
                <>
                  <User className="h-3 w-3 mr-1" />
                  Membro
                </>
              )}
            </Badge>
          </div>
        )}

        {/* Navigation Menu */}
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? 'sr-only' : ''}>
            {userRole === 'admin' ? 'Administração' : 'Navegação'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.url === '/dashboard'}
                      className={getNavCls}
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Quick Actions for Admin */}
        {userRole === 'admin' && !collapsed && (
          <SidebarGroup className="mt-auto">
            <SidebarGroupLabel>Ações Rápidas</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <FileText className="h-4 w-4" />
                    <span>Novo Conteúdo</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Users className="h-4 w-4" />
                    <span>Novo Usuário</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}