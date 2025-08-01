import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { Crown, Users, FileText, CreditCard } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-6">
              MemberScribe
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              Sua plataforma exclusiva de conteúdo premium com acesso controlado por assinatura
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate('/auth')} className="text-lg px-8 py-6">
                Começar Agora
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/auth')} className="text-lg px-8 py-6">
                Fazer Login
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Recursos da Plataforma</h2>
            <p className="text-xl text-muted-foreground">
              Tudo que você precisa para gerenciar sua comunidade de membros
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
                  <Crown className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Área de Membros</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Acesso exclusivo a conteúdos premium baseado em assinatura
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Gestão de Conteúdo</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Sistema completo para upload e organização de vídeos, PDFs e textos
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
                  <CreditCard className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Pagamentos</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Integração com Mercado Pago para assinaturas mensais e anuais
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Painel Admin</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Dashboard completo para gerenciamento de membros e receitas
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-primary/5">
        <div className="container mx-auto text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Pronto para começar?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Crie sua conta e tenha acesso a todo o conteúdo exclusivo da nossa plataforma
            </p>
            <Button size="lg" onClick={() => navigate('/auth')} className="text-lg px-8 py-6">
              Criar Conta Grátis
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t">
        <div className="container mx-auto text-center">
          <p className="text-muted-foreground">
            © 2024 MemberScribe. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
