import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CreditCard, Check } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  description: string;
}

interface MercadoPagoCheckoutProps {
  plan: Plan;
  billingPeriod: 'monthly' | 'yearly';
}

const MercadoPagoCheckout = ({ plan, billingPeriod }: MercadoPagoCheckoutProps) => {
  const [loading, setLoading] = useState(false);

  const price = billingPeriod === 'monthly' ? plan.price_monthly : plan.price_yearly;

  const handleCheckout = async () => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-mercadopago-preference', {
        body: {
          plan_id: plan.id,
          plan_name: plan.name,
          price: price
        }
      });

      if (error) throw error;

      // Open MercadoPago checkout in new tab
      if (data.init_point) {
        window.open(data.init_point, '_blank');
      }
      
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Erro no checkout",
        description: "Erro ao iniciar processo de pagamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center space-x-2">
          <CreditCard className="h-5 w-5" />
          <span>Plano {plan.name}</span>
        </CardTitle>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="text-3xl font-bold">
            R$ {price?.toFixed(2)}
          </div>
          <div className="text-sm text-muted-foreground">
            por {billingPeriod === 'monthly' ? 'mês' : 'ano'}
          </div>
        </div>

        <div className="space-y-3">
          {plan.features?.map((feature, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-primary" />
              <span className="text-sm">{feature}</span>
            </div>
          ))}
        </div>

        <Button 
          onClick={handleCheckout} 
          disabled={loading}
          className="w-full"
          size="lg"
        >
          {loading ? 'Processando...' : 'Assinar Agora'}
        </Button>

        <div className="text-center">
          <Badge variant="secondary" className="text-xs">
            Pagamento seguro via Mercado Pago
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default MercadoPagoCheckout;