-- ==============================================================================
-- CONFIGURAÇÃO INICIAL
-- ==============================================================================

-- Habilita extensão para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tipos ENUM para padronização de status e roles
CREATE TYPE user_role AS ENUM ('buyer', 'supplier', 'transporter');
CREATE TYPE quote_status AS ENUM ('open', 'closed', 'completed');
CREATE TYPE proposal_status AS ENUM ('pending', 'accepted', 'rejected');
CREATE TYPE delivery_type AS ENUM ('delivery', 'pickup');

-- ==============================================================================
-- 1. TABELA DE PERFIS (PROFILES)
-- Vinculada à tabela auth.users do Supabase
-- ==============================================================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role user_role NOT NULL DEFAULT 'buyer',
  
  -- Dados Comuns
  full_name TEXT,
  email TEXT,
  phone TEXT,
  whatsapp TEXT,
  avatar_url TEXT,
  
  -- Dados Específicos (Produtor/Empresa)
  document TEXT, -- CPF ou CNPJ
  company_name TEXT, -- Nome da Fazenda ou Empresa
  branch TEXT, -- Filial
  
  -- Preferências
  categories_interest TEXT[], -- Array de strings com categorias
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 2. TABELA DE ENDEREÇOS
-- ==============================================================================
CREATE TABLE addresses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  label TEXT, -- Ex: "Sede", "Retiro"
  street TEXT NOT NULL,
  district TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  cep TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  latitude FLOAT, -- Para cálculo de raio futuro
  longitude FLOAT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. TABELA DE SOLICITAÇÕES DE COTAÇÃO (QUOTES)
-- O pedido criado pelo comprador
-- ==============================================================================
CREATE TABLE quote_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Detalhes do Produto
  product_name TEXT NOT NULL,
  product_category TEXT NOT NULL,
  product_unit TEXT NOT NULL, -- kg, sc, un, ton
  quantity NUMERIC NOT NULL,
  description TEXT,
  product_image_url TEXT,
  
  -- Logística
  delivery_type delivery_type NOT NULL,
  radius_km INTEGER DEFAULT 50,
  address_text TEXT, -- Endereço formatado snapshot
  address_id UUID REFERENCES addresses(id), -- Link opcional
  
  -- Controle
  status quote_status DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. TABELA DE PROPOSTAS (PROPOSALS)
-- As respostas dos fornecedores
-- ==============================================================================
CREATE TABLE quote_proposals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  quote_request_id UUID REFERENCES quote_requests(id) ON DELETE CASCADE NOT NULL,
  supplier_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  price NUMERIC NOT NULL, -- Valor total
  delivery_deadline TEXT, -- Ex: "5 dias úteis"
  payment_terms TEXT, -- Ex: "30 dias boleto"
  notes TEXT,
  attachment_url TEXT, -- Arquivo PDF/Img da cotação oficial
  
  status proposal_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 5. TABELA DE CHAT
-- Mensagens vinculadas a um pedido específico
-- ==============================================================================
CREATE TABLE chat_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  quote_request_id UUID REFERENCES quote_requests(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES profiles(id) NOT NULL,
  
  content TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 6. TABELA DE PROMOÇÕES
-- Campanhas criadas pelos fornecedores
-- ==============================================================================
CREATE TABLE promotions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  supplier_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  original_price NUMERIC,
  promo_price NUMERIC NOT NULL,
  
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- TRIGGERS E FUNÇÕES (AUTOMATIZAÇÃO)
-- ==============================================================================

-- 1. Função para criar perfil automaticamente ao cadastrar no Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. Função para fechar pedido ao aceitar proposta
-- Quando uma proposta vira 'accepted', todas as outras desse pedido viram 'rejected'
-- E o pedido vira 'closed'
CREATE OR REPLACE FUNCTION handle_proposal_acceptance()
RETURNS trigger AS $$
BEGIN
  IF new.status = 'accepted' THEN
    -- Rejeita todas as outras propostas do mesmo pedido
    UPDATE quote_proposals
    SET status = 'rejected'
    WHERE quote_request_id = new.quote_request_id
    AND id <> new.id;

    -- Atualiza o status do pedido principal para fechado
    UPDATE quote_requests
    SET status = 'closed'
    WHERE id = new.quote_request_id;
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_proposal_accepted
  AFTER UPDATE OF status ON quote_proposals
  FOR EACH ROW
  WHEN (new.status = 'accepted')
  EXECUTE PROCEDURE handle_proposal_acceptance();

-- ==============================================================================
-- POLÍTICAS DE SEGURANÇA (RLS - Row Level Security)
-- ==============================================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

-- --- POLÍTICAS DE PERFIL ---
CREATE POLICY "Perfis são visíveis publicamente (leitura)"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Usuários podem editar seu próprio perfil"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- --- POLÍTICAS DE ENDEREÇO ---
CREATE POLICY "Usuários gerenciam seus próprios endereços"
  ON addresses FOR ALL
  USING (auth.uid() = user_id);

-- --- POLÍTICAS DE COTAÇÕES (REQUESTS) ---
CREATE POLICY "Comprador vê e edita suas cotações"
  ON quote_requests FOR ALL
  USING (auth.uid() = buyer_id);

CREATE POLICY "Fornecedores veem cotações abertas (para cotar)"
  ON quote_requests FOR SELECT
  USING (
    status = 'open' OR 
    EXISTS ( -- Ou se ele já mandou proposta para este pedido
      SELECT 1 FROM quote_proposals 
      WHERE quote_proposals.quote_request_id = quote_requests.id 
      AND quote_proposals.supplier_id = auth.uid()
    )
  );

-- --- POLÍTICAS DE PROPOSTAS ---
CREATE POLICY "Fornecedor gerencia suas propostas"
  ON quote_proposals FOR ALL
  USING (auth.uid() = supplier_id);

CREATE POLICY "Comprador vê propostas de seus pedidos"
  ON quote_proposals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM quote_requests
      WHERE quote_requests.id = quote_proposals.quote_request_id
      AND quote_requests.buyer_id = auth.uid()
    )
  );

-- --- POLÍTICAS DE CHAT ---
CREATE POLICY "Participantes do pedido acessam o chat"
  ON chat_messages FOR ALL
  USING (
    auth.uid() = sender_id OR -- É quem enviou
    EXISTS ( -- Ou é o dono do pedido
      SELECT 1 FROM quote_requests qr
      WHERE qr.id = chat_messages.quote_request_id
      AND qr.buyer_id = auth.uid()
    ) OR
    EXISTS ( -- Ou é o fornecedor com proposta aceita/ativa neste pedido
      SELECT 1 FROM quote_proposals qp
      WHERE qp.quote_request_id = chat_messages.quote_request_id
      AND qp.supplier_id = auth.uid()
    )
  );

-- --- POLÍTICAS DE PROMOÇÕES ---
CREATE POLICY "Promoções ativas são públicas"
  ON promotions FOR SELECT
  USING (is_active = true);

CREATE POLICY "Fornecedor gerencia suas promoções"
  ON promotions FOR ALL
  USING (auth.uid() = supplier_id);

-- ==============================================================================
-- STORAGE BUCKETS (Comandos para SQL Editor do Supabase Storage)
-- Nota: Isso geralmente é feito via UI, mas aqui está a inserção se a tabela existir
-- ==============================================================================
-- insert into storage.buckets (id, name) values ('avatars', 'avatars');
-- insert into storage.buckets (id, name) values ('attachments', 'attachments');
-- insert into storage.buckets (id, name) values ('products', 'products');
