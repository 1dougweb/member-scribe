import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Calendar,
  Settings,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const PaymentSettings = () => {
  const [mercadoPagoConfig, setMercadoPagoConfig] = useState({
    publicKey: '',
    accessToken: '',
    webhookUrl: '',
    environment: 'sandbox'
  });
  const [loading, setLoading] = useState(false);

  const revenueData = {
    monthlyRevenue: 12450.80,
    activeSubscriptions: 156,
    conversionRate: 12.5,
    churnRate: 3.2
  };

  const handleSaveMercadoPago = async () => {
    setLoading(true);
    try {
      // Simular salvamento das configurações do Mercado Pago
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Configurações do Mercado Pago salvas",
        description: "As credenciais foram atualizadas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações do Mercado Pago",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <CreditCard className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold">Configurações de Pagamento</h1>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="mercadopago">Mercado Pago</TabsTrigger>
          <TabsTrigger value="subscriptions">Planos</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ {revenueData.monthlyRevenue.toLocaleString('pt-BR')}</div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 inline mr-1" />
                  +12% em relação ao mês anterior
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Assinaturas Ativas</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{revenueData.activeSubscriptions}</div>
                <p className="text-xs text-muted-foreground">
                  +8 novos assinantes este mês
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{revenueData.conversionRate}%</div>
                <p className="text-xs text-muted-foreground">
                  +2.1% em relação ao mês anterior
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Cancelamento</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{revenueData.churnRate}%</div>
                <p className="text-xs text-muted-foreground">
                  -0.5% em relação ao mês anterior
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Transações Recentes */}
          <Card>
            <CardHeader>
              <CardTitle>Transações Recentes</CardTitle>
              <CardDescription>Últimas transações processadas pela plataforma</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { id: 'TXN001', user: 'João Silva', plan: 'Premium', amount: 29.90, status: 'approved', date: '2024-01-15' },
                  { id: 'TXN002', user: 'Maria Santos', plan: 'VIP', amount: 59.90, status: 'approved', date: '2024-01-15' },
                  { id: 'TXN003', user: 'Pedro Costa', plan: 'Premium', amount: 29.90, status: 'pending', date: '2024-01-14' },
                  { id: 'TXN004', user: 'Ana Oliveira', plan: 'VIP', amount: 59.90, status: 'cancelled', date: '2024-01-14' },
                ].map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="font-medium">{transaction.user}</p>
                        <p className="text-sm text-muted-foreground">Plano {transaction.plan}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="font-medium">R$ {transaction.amount}</span>
                      <Badge 
                        variant={
                          transaction.status === 'approved' ? 'default' :
                          transaction.status === 'pending' ? 'secondary' : 'destructive'
                        }
                      >
                        {transaction.status === 'approved' ? 'Aprovado' :
                         transaction.status === 'pending' ? 'Pendente' : 'Cancelado'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações Mercado Pago */}
        <TabsContent value="mercadopago" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Configurações do Mercado Pago</span>
              </CardTitle>
              <CardDescription>
                Configure suas credenciais do Mercado Pago para processar pagamentos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="environment">Ambiente</Label>
                  <select 
                    id="environment"
                    className="w-full px-3 py-2 border rounded-md"
                    value={mercadoPagoConfig.environment}
                    onChange={(e) => setMercadoPagoConfig({...mercadoPagoConfig, environment: e.target.value})}
                  >
                    <option value="sandbox">Sandbox (Teste)</option>
                    <option value="production">Produção</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Status da Conexão</Label>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Conectado</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="publicKey">Chave Pública</Label>
                  <Input
                    id="publicKey"
                    type="password"
                    placeholder="TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    value={mercadoPagoConfig.publicKey}
                    onChange={(e) => setMercadoPagoConfig({...mercadoPagoConfig, publicKey: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accessToken">Access Token</Label>
                  <Input
                    id="accessToken"
                    type="password"
                    placeholder="TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    value={mercadoPagoConfig.accessToken}
                    onChange={(e) => setMercadoPagoConfig({...mercadoPagoConfig, accessToken: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="webhookUrl">URL do Webhook</Label>
                  <Input
                    id="webhookUrl"
                    placeholder="https://suaapi.com/webhooks/mercadopago"
                    value={mercadoPagoConfig.webhookUrl}
                    onChange={(e) => setMercadoPagoConfig({...mercadoPagoConfig, webhookUrl: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button variant="outline">Testar Conexão</Button>
                <Button onClick={handleSaveMercadoPago} disabled={loading}>
                  {loading ? "Salvando..." : "Salvar Configurações"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Webhook Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status dos Webhooks</CardTitle>
              <CardDescription>
                Monitore o status dos webhooks do Mercado Pago
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Pagamentos Aprovados</p>
                    <p className="text-sm text-muted-foreground">payment.approved</p>
                  </div>
                  <Badge variant="default">Ativo</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Pagamentos Cancelados</p>
                    <p className="text-sm text-muted-foreground">payment.cancelled</p>
                  </div>
                  <Badge variant="default">Ativo</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Assinaturas Criadas</p>
                    <p className="text-sm text-muted-foreground">subscription.created</p>
                  </div>
                  <Badge variant="default">Ativo</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Planos de Assinatura */}
        <TabsContent value="subscriptions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Planos de Assinatura</CardTitle>
              <CardDescription>
                Gerencie os planos disponíveis na plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'Gratuito', price: 0, period: 'Gratuito', features: ['Conteúdo básico', 'Suporte por email'], active: true },
                  { name: 'Premium', price: 29.90, period: 'mensal', features: ['Todo o conteúdo', 'Suporte prioritário', 'Downloads'], active: true },
                  { name: 'VIP', price: 59.90, period: 'mensal', features: ['Todo o conteúdo', 'Suporte 24/7', 'Conteúdo exclusivo'], active: true },
                ].map((plan) => (
                  <div key={plan.name} className="flex items-center justify-between p-6 border rounded-lg">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{plan.name}</h3>
                        <Badge variant={plan.active ? 'default' : 'secondary'}>
                          {plan.active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                      <p className="text-2xl font-bold">
                        R$ {plan.price.toFixed(2)} 
                        {plan.period !== 'Gratuito' && <span className="text-sm font-normal">/{plan.period}</span>}
                      </p>
                      <ul className="text-sm text-muted-foreground">
                        {plan.features.map((feature, idx) => (
                          <li key={idx}>• {feature}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">Editar</Button>
                      <Button variant="outline" size="sm">
                        {plan.active ? 'Desativar' : 'Ativar'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <Button>Criar Novo Plano</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Relatórios */}
        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Financeiros</CardTitle>
              <CardDescription>
                Visualize relatórios detalhados de receita e assinaturas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Receita por Mês</h4>
                  <div className="space-y-2">
                    {[
                      { month: 'Janeiro', revenue: 11200.50 },
                      { month: 'Dezembro', revenue: 10850.30 },
                      { month: 'Novembro', revenue: 9750.80 },
                    ].map((data) => (
                      <div key={data.month} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <span>{data.month}</span>
                        <span className="font-medium">R$ {data.revenue.toLocaleString('pt-BR')}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Assinaturas por Plano</h4>
                  <div className="space-y-2">
                    {[
                      { plan: 'Premium', count: 89 },
                      { plan: 'VIP', count: 45 },
                      { plan: 'Gratuito', count: 234 },
                    ].map((data) => (
                      <div key={data.plan} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <span>{data.plan}</span>
                        <Badge variant="outline">{data.count} usuários</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex space-x-4">
                <Button variant="outline">Exportar CSV</Button>
                <Button variant="outline">Gerar Relatório PDF</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PaymentSettings;