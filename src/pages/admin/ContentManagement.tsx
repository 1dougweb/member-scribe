import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Upload,
  FileText,
  Video,
  Download,
  Image,
  ShoppingBag,
  Package,
  Zap,
  Target
} from 'lucide-react';

interface Content {
  id: string;
  title: string;
  description?: string;
  content_type: string;
  content_url?: string;
  thumbnail_url?: string;
  is_published: boolean;
  content_categories?: {
    name: string;
  };
  subscription_plans?: {
    name: string;
  };
  created_at: string;
}

interface DigitalProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  file_url: string;
  product_type: string;
  is_active: boolean;
  downloads: number;
  created_at: string;
}

const ContentManagement = () => {
  const [content, setContent] = useState<Content[]>([]);
  const [digitalProducts, setDigitalProducts] = useState<DigitalProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [newContentForm, setNewContentForm] = useState({
    title: '',
    description: '',
    content_type: 'video',
    category_id: '',
    required_plan_id: ''
  });
  const [newProductForm, setNewProductForm] = useState({
    name: '',
    description: '',
    price: 0,
    product_type: 'ebook',
    file_url: ''
  });

  useEffect(() => {
    loadContent();
    loadDigitalProducts();
  }, []);

  const loadContent = async () => {
    try {
      const { data, error } = await supabase
        .from('content')
        .select(`
          *,
          content_categories (name),
          subscription_plans (name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContent(data || []);
    } catch (error) {
      console.error('Erro ao carregar conteúdo:', error);
    }
  };

  const loadDigitalProducts = async () => {
    // TODO: Implementar tabela de produtos digitais no banco
    // Por enquanto, vamos usar dados simulados
    setDigitalProducts([]);
  };

  const handleCreateContent = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('content')
        .insert([{
          ...newContentForm,
          created_by: (await supabase.auth.getUser()).data.user?.id
        }]);

      if (error) throw error;

      toast({
        title: "Conteúdo criado",
        description: "O novo conteúdo foi adicionado com sucesso.",
      });

      setNewContentForm({
        title: '',
        description: '',
        content_type: 'video',
        category_id: '',
        required_plan_id: ''
      });

      loadContent();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar conteúdo",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async () => {
    setLoading(true);
    try {
      // Simular criação do produto
      const newProduct: DigitalProduct = {
        id: Date.now().toString(),
        ...newProductForm,
        is_active: true,
        downloads: 0,
        created_at: new Date().toISOString()
      };

      setDigitalProducts(prev => [newProduct, ...prev]);

      toast({
        title: "Produto criado",
        description: "O novo produto digital foi adicionado com sucesso.",
      });

      setNewProductForm({
        name: '',
        description: '',
        price: 0,
        product_type: 'ebook',
        file_url: ''
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar produto",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'pdf':
        return <FileText className="h-4 w-4" />;
      case 'image':
        return <Image className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
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
        return <Package className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BookOpen className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Gerenciamento de Conteúdo</h1>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Conteúdo
        </Button>
      </div>

      <Tabs defaultValue="content" className="space-y-6">
        <TabsList>
          <TabsTrigger value="content">Aulas & Conteúdo</TabsTrigger>
          <TabsTrigger value="products">Produtos Digitais</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
          <TabsTrigger value="upload">Upload de Arquivos</TabsTrigger>
        </TabsList>

        {/* Aulas & Conteúdo */}
        <TabsContent value="content" className="space-y-6">
          {/* Formulário de Novo Conteúdo */}
          <Card>
            <CardHeader>
              <CardTitle>Adicionar Novo Conteúdo</CardTitle>
              <CardDescription>
                Crie uma nova aula ou conteúdo para seus membros
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    placeholder="Ex: Aula 1 - Introdução ao Marketing"
                    value={newContentForm.title}
                    onChange={(e) => setNewContentForm({...newContentForm, title: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content_type">Tipo de Conteúdo</Label>
                  <select 
                    id="content_type"
                    className="w-full px-3 py-2 border rounded-md bg-background"
                    value={newContentForm.content_type}
                    onChange={(e) => setNewContentForm({...newContentForm, content_type: e.target.value})}
                  >
                    <option value="video">Vídeo</option>
                    <option value="text">Texto/Artigo</option>
                    <option value="pdf">PDF</option>
                    <option value="image">Imagem</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva o conteúdo desta aula..."
                  value={newContentForm.description}
                  onChange={(e) => setNewContentForm({...newContentForm, description: e.target.value})}
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleCreateContent} disabled={loading}>
                  {loading ? "Criando..." : "Criar Conteúdo"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Conteúdos */}
          <Card>
            <CardHeader>
              <CardTitle>Conteúdos Existentes</CardTitle>
              <CardDescription>
                Gerencie todos os conteúdos da plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              {content.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum conteúdo encontrado</h3>
                  <p className="text-muted-foreground">
                    Comece criando seu primeiro conteúdo acima.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {content.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg card-hover">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          {getContentIcon(item.content_type)}
                        </div>
                        <div>
                          <h3 className="font-semibold">{item.title}</h3>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant="outline">
                              {item.content_type}
                            </Badge>
                            {item.content_categories && (
                              <Badge variant="secondary">
                                {item.content_categories.name}
                              </Badge>
                            )}
                            <Badge variant={item.is_published ? 'default' : 'destructive'}>
                              {item.is_published ? 'Publicado' : 'Rascunho'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Produtos Digitais */}
        <TabsContent value="products" className="space-y-6">
          {/* Formulário de Novo Produto */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ShoppingBag className="h-5 w-5" />
                <span>Adicionar Produto Digital</span>
              </CardTitle>
              <CardDescription>
                Crie um novo produto digital para venda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="product_name">Nome do Produto</Label>
                  <Input
                    id="product_name"
                    placeholder="Ex: E-book Marketing Digital"
                    value={newProductForm.name}
                    onChange={(e) => setNewProductForm({...newProductForm, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product_type">Tipo de Produto</Label>
                  <select 
                    id="product_type"
                    className="w-full px-3 py-2 border rounded-md bg-background"
                    value={newProductForm.product_type}
                    onChange={(e) => setNewProductForm({...newProductForm, product_type: e.target.value})}
                  >
                    <option value="ebook">E-book</option>
                    <option value="template">Template</option>
                    <option value="course">Curso</option>
                    <option value="software">Software</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product_price">Preço (R$)</Label>
                  <Input
                    id="product_price"
                    type="number"
                    step="0.01"
                    placeholder="29.90"
                    value={newProductForm.price}
                    onChange={(e) => setNewProductForm({...newProductForm, price: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="file_url">URL do Arquivo</Label>
                  <Input
                    id="file_url"
                    placeholder="https://exemplo.com/arquivo.pdf"
                    value={newProductForm.file_url}
                    onChange={(e) => setNewProductForm({...newProductForm, file_url: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="product_description">Descrição</Label>
                <Textarea
                  id="product_description"
                  placeholder="Descreva seu produto digital..."
                  value={newProductForm.description}
                  onChange={(e) => setNewProductForm({...newProductForm, description: e.target.value})}
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleCreateProduct} disabled={loading}>
                  {loading ? "Criando..." : "Criar Produto"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Produtos */}
          <Card>
            <CardHeader>
              <CardTitle>Produtos Digitais</CardTitle>
              <CardDescription>
                Gerencie seus produtos digitais
              </CardDescription>
            </CardHeader>
            <CardContent>
              {digitalProducts.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum produto encontrado</h3>
                  <p className="text-muted-foreground">
                    Comece criando seu primeiro produto digital acima.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {digitalProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-6 border rounded-lg card-hover">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-primary/10 rounded-lg">
                          {getProductIcon(product.product_type)}
                        </div>
                        <div>
                          <h3 className="font-semibold">{product.name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{product.description}</p>
                          <div className="flex items-center space-x-4 text-sm">
                            <span className="font-medium text-primary">R$ {product.price.toFixed(2)}</span>
                            <span className="text-muted-foreground">{product.downloads} downloads</span>
                            <Badge variant={product.is_active ? 'default' : 'secondary'}>
                              {product.is_active ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categorias */}
        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Categorias de Conteúdo</CardTitle>
              <CardDescription>
                Organize seu conteúdo em categorias para facilitar a navegação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'Tutoriais', count: 12, description: 'Conteúdo educacional e tutoriais' },
                  { name: 'Webinars', count: 8, description: 'Webinars e palestras ao vivo' },
                  { name: 'Downloads', count: 15, description: 'Materiais para download' },
                  { name: 'Exclusivo', count: 5, description: 'Conteúdo exclusivo para membros VIP' },
                ].map((category) => (
                  <div key={category.name} className="flex items-center justify-between p-4 border rounded-lg card-hover">
                    <div>
                      <h3 className="font-semibold">{category.name}</h3>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                      <Badge variant="outline" className="mt-2">
                        {category.count} conteúdos
                      </Badge>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Categoria
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Upload de Arquivos */}
        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="h-5 w-5" />
                <span>Upload de Arquivos</span>
              </CardTitle>
              <CardDescription>
                Faça upload de vídeos, PDFs, imagens e outros arquivos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Arraste e solte seus arquivos aqui</h3>
                <p className="text-muted-foreground mb-4">
                  Ou clique para selecionar arquivos do seu computador
                </p>
                <Button>
                  Selecionar Arquivos
                </Button>
                <div className="mt-4 text-sm text-muted-foreground">
                  <p>Formatos suportados: MP4, PDF, JPG, PNG, ZIP</p>
                  <p>Tamanho máximo: 500MB por arquivo</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Arquivos Recentes */}
          <Card>
            <CardHeader>
              <CardTitle>Arquivos Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'aula-01-introducao.mp4', size: '245MB', type: 'video', date: '2024-01-15' },
                  { name: 'ebook-marketing.pdf', size: '12MB', type: 'pdf', date: '2024-01-14' },
                  { name: 'template-landing.zip', size: '8MB', type: 'archive', date: '2024-01-13' },
                ].map((file) => (
                  <div key={file.name} className="flex items-center justify-between p-4 border rounded-lg card-hover">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        {getContentIcon(file.type)}
                      </div>
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-muted-foreground">{file.size} • {file.date}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentManagement;