import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { 
  CreditCard, 
  Calendar,
  AlertCircle,
  CheckCircle,
  Crown,
  Star,
  Gift,
  TrendingUp
} from 'lucide-react';

interface Subscription {
  id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  subscription_plans: {
    name: string;
    description: string;
    price_monthly: number;
    price_yearly: number;
    features: string[];
  };
}

interface Plan {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  is_active: boolean;
  popular?: boolean;
}

const MemberSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadSubscriptionData();
      loadAvailablePlans();
    }
  }, [user]);

  const loadSubscriptionData = async () => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          subscription_plans (
            name,
            description,
            price_monthly,
            price_yearly,
            features
          )
        `)
        .eq('user_id', user?.id)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        const subscriptionData = {
          ...data,
          subscription_plans: {
            ...data.subscription_plans,
            features: Array.isArray(data.subscription_plans.features) 
              ? data.subscription_plans.features 
              : JSON.parse(data.subscription_plans.features as string || '[]')
          }
        };
        setSubscription(subscriptionData);
      }
    } catch (error) {
      console.error('Erro ao carregar assinatura:', error);
    }
  };

  const loadAvailablePlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price_monthly', { ascending: true });

      if (error) throw error;
      
      // Marcar o plano Premium como popular
      const plansWithPopular = (data || []).map(plan => ({
        ...plan,
        features: Array.isArray(plan.features) ? plan.features : JSON.parse(plan.features as string || '[]'),
        popular: plan.name === 'Premium'
      }));
      
      setAvailablePlans(plansWithPopular);
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    toast({
      title: "Redirecionando para pagamento",
      description: "Você será redirecionado para o Mercado Pago para completar sua assinatura.",
    });
    // Aqui seria implementada a integração com Mercado Pago
  };

  const handleCancelSubscription = async () => {
    toast({
      title: "Cancelamento solicitado",
      description: "Sua assinatura será cancelada ao final do período atual.",
      variant: "destructive",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'cancelled':
        return 'destructive';
      case 'pending':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativa';
      case 'cancelled':
        return 'Cancelada';
      case 'pending':
        return 'Pendente';
      case 'expired':
        return 'Expirada';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Minha Assinatura</h1>

      {/* Status da Assinatura Atual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Status da Assinatura</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {subscription ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <Crown className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">{subscription.subscription_plans.name}</h3>
                  <p className="text-sm text-muted-foreground">Plano Atual</p>
                </div>
                
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <Badge variant={getStatusColor(subscription.status)}>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {getStatusText(subscription.status)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Status</p>
                </div>
                
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">{formatDate(subscription.current_period_end)}</h3>
                  <p className="text-sm text-muted-foreground">Próxima Cobrança</p>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-3">Recursos Inclusos:</h4>
                <ul className="space-y-2">
                  {subscription.subscription_plans.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex space-x-4">
                <Button variant="outline">
                  Alterar Plano
                </Button>
                <Button variant="destructive" onClick={handleCancelSubscription}>
                  Cancelar Assinatura
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma assinatura ativa</h3>
              <p className="text-muted-foreground mb-4">
                Escolha um plano para ter acesso a todo o conteúdo exclusivo
              </p>
              <Button>Ver Planos Disponíveis</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Planos Disponíveis */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Planos Disponíveis</h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm">Mensal</span>
            <Button
              variant="outline"
              size="sm"
              className={billingPeriod === 'yearly' ? 'bg-primary text-primary-foreground' : ''}
              onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
            >
              <TrendingUp className="h-4 w-4 mr-1" />
              {billingPeriod === 'monthly' ? 'Anual (Economize 20%)' : 'Anual'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {availablePlans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge variant="default" className="bg-primary">
                    <Star className="h-3 w-3 mr-1" />
                    Mais Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="py-4">
                  <span className="text-3xl font-bold">
                    R$ {(billingPeriod === 'monthly' ? plan.price_monthly : plan.price_yearly / 12).toFixed(2)}
                  </span>
                  <span className="text-muted-foreground">/mês</span>
                  {billingPeriod === 'yearly' && (
                    <div className="text-sm text-primary font-medium">
                      Faturado anualmente (R$ {plan.price_yearly.toFixed(2)})
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className="w-full"
                  variant={plan.popular ? 'default' : 'outline'}
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={subscription?.subscription_plans.name === plan.name}
                >
                  {subscription?.subscription_plans.name === plan.name ? 
                    'Plano Atual' : 
                    plan.price_monthly === 0 ? 'Gratuito' : 'Assinar Agora'
                  }
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Benefícios da Assinatura */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Gift className="h-5 w-5" />
            <span>Benefícios da Assinatura Premium</span>
          </CardTitle>
          <CardDescription>
            Veja tudo que você ganha com uma assinatura premium
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Acesso Completo ao Conteúdo</h4>
                  <p className="text-sm text-muted-foreground">
                    Todas as aulas, webinars e materiais exclusivos
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Suporte Prioritário</h4>
                  <p className="text-sm text-muted-foreground">
                    Atendimento preferencial e resposta em até 24h
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Downloads Ilimitados</h4>
                  <p className="text-sm text-muted-foreground">
                    Baixe todos os materiais para estudar offline
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Produtos Digitais Exclusivos</h4>
                  <p className="text-sm text-muted-foreground">
                    E-books, templates e ferramentas especiais
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Comunidade VIP</h4>
                  <p className="text-sm text-muted-foreground">
                    Acesso exclusivo ao grupo de membros premium
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Atualizações Antecipadas</h4>
                  <p className="text-sm text-muted-foreground">
                    Seja o primeiro a acessar novos conteúdos
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MemberSubscription;