import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Crown, Shield, Settings2, Database, Mail } from 'lucide-react';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    platformName: 'MemberScribe',
    supportEmail: 'suporte@memberscribe.com',
    maxUsers: 1000,
    enableEmailNotifications: true,
    enableNewUserRegistration: true,
  });
  const [loading, setLoading] = useState(false);

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // Simular salvamento das configurações
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Configurações salvas",
        description: "As configurações da plataforma foram atualizadas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Settings2 className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold">Configurações do Sistema</h1>
        <Badge variant="secondary">
          <Crown className="h-3 w-3 mr-1" />
          Admin
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configurações Gerais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings2 className="h-5 w-5" />
              <span>Configurações Gerais</span>
            </CardTitle>
            <CardDescription>
              Configure as informações básicas da plataforma
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="platformName">Nome da Plataforma</Label>
              <Input
                id="platformName"
                value={settings.platformName}
                onChange={(e) => setSettings({...settings, platformName: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supportEmail">Email de Suporte</Label>
              <Input
                id="supportEmail"
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({...settings, supportEmail: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxUsers">Limite Máximo de Usuários</Label>
              <Input
                id="maxUsers"
                type="number"
                value={settings.maxUsers}
                onChange={(e) => setSettings({...settings, maxUsers: parseInt(e.target.value)})}
              />
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Segurança */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Segurança e Acesso</span>
            </CardTitle>
            <CardDescription>
              Configure as políticas de segurança da plataforma
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Registro de Novos Usuários</Label>
                <p className="text-sm text-muted-foreground">
                  Permitir que novos usuários se cadastrem
                </p>
              </div>
              <Badge variant={settings.enableNewUserRegistration ? "default" : "secondary"}>
                {settings.enableNewUserRegistration ? "Ativado" : "Desativado"}
              </Badge>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notificações por Email</Label>
                <p className="text-sm text-muted-foreground">
                  Enviar notificações automáticas por email
                </p>
              </div>
              <Badge variant={settings.enableEmailNotifications ? "default" : "secondary"}>
                {settings.enableEmailNotifications ? "Ativado" : "Desativado"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Informações do Sistema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>Informações do Sistema</span>
            </CardTitle>
            <CardDescription>
              Status e estatísticas da infraestrutura
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">99.9%</div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">2.1GB</div>
                <div className="text-sm text-muted-foreground">Armazenamento</div>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Versão da Plataforma:</span>
                <Badge variant="outline">v2.1.0</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Último Backup:</span>
                <span className="text-sm text-muted-foreground">Hoje às 03:00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Status do Banco:</span>
                <Badge variant="default">Conectado</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logs e Monitoramento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="h-5 w-5" />
              <span>Logs e Monitoramento</span>
            </CardTitle>
            <CardDescription>
              Monitore atividades e eventos do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-sm">Logins hoje</span>
                <Badge variant="default">23</Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-sm">Novos cadastros</span>
                <Badge variant="secondary">5</Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-sm">Erros reportados</span>
                <Badge variant="destructive">2</Badge>
              </div>
            </div>
            
            <Button variant="outline" className="w-full">
              Ver Logs Completos
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Salvar Configurações */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-end space-x-4">
            <Button variant="outline">
              Restaurar Padrões
            </Button>
            <Button onClick={handleSaveSettings} disabled={loading}>
              {loading ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;