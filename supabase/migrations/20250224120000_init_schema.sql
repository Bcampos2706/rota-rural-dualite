/*
  # Inicialização do Banco de Dados AgroMarket
  
  ## Descrição
  Este script configura toda a estrutura inicial do banco de dados, incluindo:
  1. Tipos personalizados (user_role) com verificação de existência.
  2. Tabelas principais: profiles, addresses, quotes, proposals, chat_messages, promotions.
  3. Políticas de Segurança (RLS) para proteger os dados.
  4. Triggers para automação (ex: criar perfil ao cadastrar usuário).

  ## Segurança
  - RLS habilitado em todas as tabelas.
  - Políticas garantem que compradores só vejam seus dados e fornecedores vejam apenas o permitido.
*/

-- 1. Habilitar extensão UUID (necessário para IDs únicos)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Criar Tipo ENUM de forma segura (evita o erro 42710)
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('buyer', 'supplier', 'transporter', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Tabela de Perfis (Estende a tabela auth.users do Supabase)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    role user_role DEFAULT 'buyer',
    company_name TEXT,
    cpf_cnpj TEXT,
    phone TEXT,
    whatsapp TEXT,
    address TEXT,
    branch TEXT,
    categories TEXT[], -- Array de categorias de interesse
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS em profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas de Profiles
DROP POLICY IF EXISTS "Perfis públicos são visíveis por todos" ON public.profiles;
CREATE POLICY "Perfis públicos são visíveis por todos" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON public.profiles;
CREATE POLICY "Usuários podem atualizar seu próprio perfil" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Usuários podem inserir seu próprio perfil" ON public.profiles;
CREATE POLICY "Usuários podem inserir seu próprio perfil" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 4. Tabela de Endereços
CREATE TABLE IF NOT EXISTS public.addresses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    label TEXT,
    street TEXT,
    district TEXT,
    city TEXT,
    state TEXT,
    cep TEXT,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários gerenciam seus endereços" ON public.addresses;
CREATE POLICY "Usuários gerenciam seus endereços" ON public.addresses USING (auth.uid() = user_id);

-- 5. Tabela de Cotações (Pedidos)
CREATE TABLE IF NOT EXISTS public.quotes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    buyer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    product_name TEXT NOT NULL,
    product_category TEXT NOT NULL,
    product_unit TEXT NOT NULL,
    quantity NUMERIC NOT NULL,
    delivery_type TEXT CHECK (delivery_type IN ('delivery', 'pickup')),
    radius INTEGER DEFAULT 50,
    address_text TEXT,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- Políticas de Cotações
DROP POLICY IF EXISTS "Compradores veem suas cotações" ON public.quotes;
CREATE POLICY "Compradores veem suas cotações" ON public.quotes FOR SELECT USING (auth.uid() = buyer_id);

DROP POLICY IF EXISTS "Compradores criam cotações" ON public.quotes;
CREATE POLICY "Compradores criam cotações" ON public.quotes FOR INSERT WITH CHECK (auth.uid() = buyer_id);

DROP POLICY IF EXISTS "Fornecedores veem cotações abertas" ON public.quotes;
CREATE POLICY "Fornecedores veem cotações abertas" ON public.quotes FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'supplier')
);

-- 6. Tabela de Propostas
CREATE TABLE IF NOT EXISTS public.proposals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    quote_id UUID REFERENCES public.quotes(id) ON DELETE CASCADE NOT NULL,
    supplier_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    price NUMERIC NOT NULL,
    delivery_date TEXT,
    notes TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    attachment_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

-- Políticas de Propostas
DROP POLICY IF EXISTS "Fornecedores gerenciam suas propostas" ON public.proposals;
CREATE POLICY "Fornecedores gerenciam suas propostas" ON public.proposals USING (auth.uid() = supplier_id);

DROP POLICY IF EXISTS "Compradores veem propostas de suas cotações" ON public.proposals;
CREATE POLICY "Compradores veem propostas de suas cotações" ON public.proposals FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.quotes WHERE id = proposals.quote_id AND buyer_id = auth.uid())
);

-- 7. Tabela de Mensagens (Chat)
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    quote_id UUID REFERENCES public.quotes(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participantes do chat veem mensagens" ON public.chat_messages;
CREATE POLICY "Participantes do chat veem mensagens" ON public.chat_messages FOR SELECT USING (
    auth.uid() = sender_id OR 
    EXISTS (SELECT 1 FROM public.quotes q JOIN public.proposals p ON p.quote_id = q.id WHERE q.id = chat_messages.quote_id AND (q.buyer_id = auth.uid() OR p.supplier_id = auth.uid()))
);

DROP POLICY IF EXISTS "Participantes enviam mensagens" ON public.chat_messages;
CREATE POLICY "Participantes enviam mensagens" ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- 8. Tabela de Promoções
CREATE TABLE IF NOT EXISTS public.promotions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    supplier_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    original_price NUMERIC,
    promo_price NUMERIC,
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Todos podem ver promoções" ON public.promotions;
CREATE POLICY "Todos podem ver promoções" ON public.promotions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Fornecedores gerenciam suas promoções" ON public.promotions;
CREATE POLICY "Fornecedores gerenciam suas promoções" ON public.promotions USING (auth.uid() = supplier_id);

-- 9. Trigger para criar perfil automaticamente ao cadastrar usuário no Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', 'Usuário'), 
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'buyer')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
