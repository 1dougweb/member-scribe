-- Criar tabela para produtos digitais
CREATE TABLE public.digital_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  file_url TEXT,
  product_type TEXT NOT NULL DEFAULT 'ebook',
  is_active BOOLEAN DEFAULT true,
  downloads_count INTEGER DEFAULT 0,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.digital_products ENABLE ROW LEVEL SECURITY;

-- Políticas para produtos digitais
CREATE POLICY "Admins can manage digital products" 
ON public.digital_products 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Anyone can view active digital products" 
ON public.digital_products 
FOR SELECT 
USING (is_active = true);

-- Criar tabela para purchases de produtos digitais
CREATE TABLE public.product_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES public.digital_products(id) ON DELETE CASCADE,
  purchase_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  payment_status TEXT NOT NULL DEFAULT 'pending',
  price_paid DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.product_purchases ENABLE ROW LEVEL SECURITY;

-- Políticas para purchases
CREATE POLICY "Users can view their own purchases" 
ON public.product_purchases 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all purchases" 
ON public.product_purchases 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "System can manage purchases" 
ON public.product_purchases 
FOR ALL 
USING (true);

-- Criar tabela para favoritos
CREATE TABLE public.user_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content_id UUID NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, content_id)
);

-- Habilitar RLS
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- Políticas para favoritos
CREATE POLICY "Users can manage their own favorites" 
ON public.user_favorites 
FOR ALL 
USING (auth.uid() = user_id);

-- Adicionar colunas extras para conteúdo
ALTER TABLE public.content ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 0;
ALTER TABLE public.content ADD COLUMN IF NOT EXISTS difficulty_level TEXT DEFAULT 'beginner';
ALTER TABLE public.content ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;

-- Trigger para updated_at
CREATE TRIGGER update_digital_products_updated_at
BEFORE UPDATE ON public.digital_products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();