import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  Play, 
  Download, 
  BookOpen, 
  Search,
  Clock,
  Star,
  ShoppingBag,
  FileText,
  Video,
  Image,
  Zap,
  Target
} from 'lucide-react';

interface Content {
  id: string;
  title: string;
  description?: string;
  content_type: string;
  thumbnail_url?: string;
  duration_minutes?: number;
  difficulty_level?: string;
  content_categories?: {
    name: string;
  };
}

interface DigitalProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  file_url: string;
  product_type: string;
  is_active: boolean;
  downloads_count: number;
  owned: boolean;
}

const MemberContent = () => {
  const [content, setContent] = useState<Content[]>([]);
  const [digitalProducts, setDigitalProducts] = useState<DigitalProduct[]>([]);
  const [userFavorites, setUserFavorites] = useState<string[]>([]);
  const [userPurchases, setUserPurchases] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadContent();
    loadDigitalProducts();
    loadUserData();
  }, []);

  const loadContent = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('content')
        .select(`
          *,
          content_categories (name)
        `)
        .eq('is_published', true)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setContent(data || []);
    } catch (error) {
      console.error('Erro ao carregar conteúdo:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar conteúdo",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadDigitalProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('digital_products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Verificar quais produtos o usuário já comprou
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: purchases } = await supabase
          .from('product_purchases')
          .select('product_id')
          .eq('user_id', user.id)
          .eq('payment_status', 'approved');

        const purchasedIds = purchases?.map(p => p.product_id) || [];
        
        const productsWithOwnership = (data || []).map(product => ({
          ...product,
          owned: purchasedIds.includes(product.id)
        }));

        setDigitalProducts(productsWithOwnership);
      } else {
        setDigitalProducts((data || []).map(product => ({ ...product, owned: false })));
      }
    } catch (error) {
      console.error('Erro ao carregar produtos digitais:', error);
    }
  };

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Carregar favoritos
      const { data: favorites } = await supabase
        .from('user_favorites')
        .select('content_id')
        .eq('user_id', user.id);

      setUserFavorites(favorites?.map(f => f.content_id) || []);

      // Carregar compras
      const { data: purchases } = await supabase
        .from('product_purchases')
        .select('product_id')
        .eq('user_id', user.id)
        .eq('payment_status', 'approved');

      setUserPurchases(purchases?.map(p => p.product_id) || []);
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
    }
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-5 w-5" />;
      case 'pdf':
        return <FileText className="h-5 w-5" />;
      case 'image':
        return <Image className="h-5 w-5" />;
      default:
        return <BookOpen className="h-5 w-5" />;
    }
  };

  const getProductIcon = (type: string) => {
    switch (type) {
      case 'ebook':
        return <BookOpen className="h-5 w-5" />;
      case 'template':
        return <Zap className="h-5 w-5" />;
      case 'course':
        return <Target className="h-5 w-5" />;
      default:
        return <ShoppingBag className="h-5 w-5" />;
    }
  };

  const filteredContent = content.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                           item.content_categories?.name.toLowerCase() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handlePurchaseProduct = (productId: string) => {
    // Integrar com sistema de pagamento real
    toast({
      title: "Redirecionando para pagamento",
      description: "Você será redirecionado para completar a compra.",
    });
  };

  const toggleFavorite = async (contentId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (userFavorites.includes(contentId)) {
        // Remover dos favoritos
        await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('content_id', contentId);
        
        setUserFavorites(prev => prev.filter(id => id !== contentId));
        toast({ title: "Removido dos favoritos" });
      } else {
        // Adicionar aos favoritos
        await supabase
          .from('user_favorites')
          .insert({ user_id: user.id, content_id: contentId });
        
        setUserFavorites(prev => [...prev, contentId]);
        toast({ title: "Adicionado aos favoritos" });
      }
    } catch (error) {
      console.error('Erro ao gerenciar favoritos:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar favoritos",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Meu Conteúdo</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar conteúdo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      <Tabs defaultValue="lessons" className="space-y-6">
        <TabsList>
          <TabsTrigger value="lessons">Aulas</TabsTrigger>
          <TabsTrigger value="products">Produtos Digitais</TabsTrigger>
          <TabsTrigger value="downloads">Meus Downloads</TabsTrigger>
          <TabsTrigger value="favorites">Favoritos</TabsTrigger>
        </TabsList>

        {/* Aulas */}
        <TabsContent value="lessons" className="space-y-6">
          {/* Filtros */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium">Filtrar por categoria:</span>
                <div className="flex space-x-2">
                  {['all', 'tutoriais', 'webinars', 'downloads'].map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category === 'all' ? 'Todas' : category.charAt(0).toUpperCase() + category.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Aulas */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Carregando aulas...</p>
            </div>
          ) : filteredContent.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma aula encontrada</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? 'Tente usar termos diferentes para sua busca.' : 'Novas aulas serão adicionadas em breve.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredContent.map((item) => (
                <Card key={item.id} className="hover:shadow-lg transition-shadow group">
                  <div className="relative">
                    {item.thumbnail_url ? (
                      <img
                        src={item.thumbnail_url}
                        alt={item.title}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-primary/5 rounded-t-lg flex items-center justify-center">
                        {getContentIcon(item.content_type)}
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <Badge variant="secondary" className="bg-black/50 text-white">
                        {item.content_type}
                      </Badge>
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <Badge variant="secondary" className="bg-black/50 text-white">
                        <Clock className="h-3 w-3 mr-1" />
                        {item.duration_minutes ? `${item.duration_minutes} min` : '15 min'}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardHeader>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {item.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {item.description || 'Sem descrição disponível'}
                    </CardDescription>
                    <div className="flex items-center space-x-2">
                      {item.content_categories && (
                        <Badge variant="outline">
                          {item.content_categories.name}
                        </Badge>
                      )}
                      <Badge variant="secondary">
                        {item.difficulty_level || 'Iniciante'}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex space-x-2">
                      <Button className="flex-1">
                        <Play className="h-4 w-4 mr-2" />
                        Assistir
                      </Button>
                      <Button 
                        variant={userFavorites.includes(item.id) ? "default" : "outline"} 
                        size="icon"
                        onClick={() => toggleFavorite(item.id)}
                      >
                        <Star className={`h-4 w-4 ${userFavorites.includes(item.id) ? 'fill-current' : ''}`} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Produtos Digitais */}
        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ShoppingBag className="h-5 w-5" />
                <span>Loja de Produtos Digitais</span>
              </CardTitle>
              <CardDescription>
                E-books, templates, ferramentas e outros recursos para acelerar seu aprendizado
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {digitalProducts.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <div className="relative">
                  <div className="w-full h-48 bg-gradient-to-br from-secondary/20 to-secondary/5 rounded-t-lg flex items-center justify-center">
                    <div className="p-4 bg-primary/10 rounded-full">
                      {getProductIcon(product.product_type)}
                    </div>
                  </div>
                  {product.owned && (
                    <div className="absolute top-3 right-3">
                      <Badge variant="default" className="bg-green-500">
                        Adquirido
                      </Badge>
                    </div>
                  )}
                </div>
                
                <CardHeader>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <CardDescription className="line-clamp-3">
                    {product.description}
                  </CardDescription>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">
                      R$ {product.price.toFixed(2)}
                    </span>
                    <Badge variant="outline">{product.product_type}</Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {product.owned ? (
                    <Button variant="outline" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  ) : (
                    <Button 
                      className="w-full"
                      onClick={() => handlePurchaseProduct(product.id)}
                    >
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      Comprar Agora
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Meus Downloads */}
        <TabsContent value="downloads" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Download className="h-5 w-5" />
                <span>Meus Downloads</span>
              </CardTitle>
              <CardDescription>
                Todos os arquivos que você adquiriu e pode baixar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {digitalProducts
                  .filter(product => product.owned)
                  .map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        {getProductIcon(product.product_type)}
                      </div>
                      <div>
                          <h3 className="font-semibold">{product.name}</h3>
                          <p className="text-sm text-muted-foreground">Adquirido em 15/01/2024</p>
                        </div>
                      </div>
                      <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Baixar
                      </Button>
                    </div>
                  ))}
                
                {digitalProducts.filter(product => product.owned).length === 0 && (
                  <div className="text-center py-8">
                    <Download className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhum download disponível</h3>
                    <p className="text-muted-foreground">
                      Compre produtos digitais para ter acesso aos downloads.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Favoritos */}
        <TabsContent value="favorites" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Star className="h-5 w-5" />
                <span>Meus Favoritos</span>
              </CardTitle>
              <CardDescription>
                Aulas e conteúdos que você marcou como favoritos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userFavorites.length === 0 ? (
                <div className="text-center py-8">
                  <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum favorito ainda</h3>
                  <p className="text-muted-foreground">
                    Clique no ícone de estrela nas aulas para adicioná-las aos favoritos.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {content
                    .filter(item => userFavorites.includes(item.id))
                    .map((item) => (
                      <Card key={item.id} className="hover:shadow-lg transition-shadow">
                        <div className="relative">
                          {item.thumbnail_url ? (
                            <img
                              src={item.thumbnail_url}
                              alt={item.title}
                              className="w-full h-32 object-cover rounded-t-lg"
                            />
                          ) : (
                            <div className="w-full h-32 bg-gradient-to-br from-primary/20 to-primary/5 rounded-t-lg flex items-center justify-center">
                              {getContentIcon(item.content_type)}
                            </div>
                          )}
                        </div>
                        
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">{item.title}</CardTitle>
                          <CardDescription className="line-clamp-2">
                            {item.description || 'Sem descrição disponível'}
                          </CardDescription>
                        </CardHeader>
                        
                        <CardContent>
                          <div className="flex space-x-2">
                            <Button size="sm" className="flex-1">
                              <Play className="h-4 w-4 mr-2" />
                              Assistir
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => toggleFavorite(item.id)}
                            >
                              <Star className="h-4 w-4 fill-current" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MemberContent;