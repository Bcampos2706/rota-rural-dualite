/*
  # Separação de Perfis
  
  1. Cria tabelas específicas: profile_produtor e profile_fornecedor
  2. Atualiza o trigger de cadastro para direcionar os dados corretamente
*/

-- 1. Criar tabela de Produtores
CREATE TABLE IF NOT EXISTS public.profile_produtor (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    cpf_cnpj TEXT,
    email TEXT,
    birth_date DATE,
    farm_name TEXT,
    phone TEXT,
    whatsapp TEXT,
    address TEXT,
    categories TEXT[], -- Array de categorias
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Criar tabela de Fornecedores
CREATE TABLE IF NOT EXISTS public.profile_fornecedor (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT, -- Nome do Responsável
    company_name TEXT,
    cnpj TEXT,
    email TEXT,
    phone TEXT,
    whatsapp TEXT,
    address TEXT,
    branch TEXT, -- Filial
    categories TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Habilitar RLS (Segurança)
ALTER TABLE public.profile_produtor ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_fornecedor ENABLE ROW LEVEL SECURITY;

-- Políticas de Segurança (Produtor)
CREATE POLICY "Produtores veem seu próprio perfil" ON public.profile_produtor
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Produtores atualizam seu próprio perfil" ON public.profile_produtor
    FOR UPDATE USING (auth.uid() = id);

-- Políticas de Segurança (Fornecedor)
CREATE POLICY "Fornecedores veem seu próprio perfil" ON public.profile_fornecedor
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Fornecedores atualizam seu próprio perfil" ON public.profile_fornecedor
    FOR UPDATE USING (auth.uid() = id);

-- Permitir que fornecedores vejam dados básicos de produtores (para propostas)
CREATE POLICY "Fornecedores veem produtores em cotações" ON public.profile_produtor
    FOR SELECT TO authenticated USING (true);

-- Permitir que produtores vejam dados de fornecedores (para ver propostas)
CREATE POLICY "Produtores veem fornecedores" ON public.profile_fornecedor
    FOR SELECT TO authenticated USING (true);


-- 4. Atualizar a Função Trigger para distribuir os dados
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Verifica o metadado 'role' enviado pelo frontend
  IF (new.raw_user_meta_data->>'role' = 'producer') THEN
    INSERT INTO public.profile_produtor (
      id, 
      email, 
      full_name, 
      cpf_cnpj, 
      birth_date, 
      farm_name, 
      phone, 
      whatsapp, 
      address, 
      categories
    )
    VALUES (
      new.id,
      new.email,
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'document',
      (new.raw_user_meta_data->>'birthDate')::DATE,
      new.raw_user_meta_data->>'company_name', -- No front, farmName é mapeado para company_name no envio genérico, ou ajustaremos no front
      new.raw_user_meta_data->>'phone',
      new.raw_user_meta_data->>'whatsapp',
      new.raw_user_meta_data->>'address',
      ARRAY(SELECT jsonb_array_elements_text(new.raw_user_meta_data->'categories'))
    );
  
  ELSIF (new.raw_user_meta_data->>'role' = 'supplier') THEN
    INSERT INTO public.profile_fornecedor (
      id, 
      email, 
      full_name, 
      company_name, 
      cnpj, 
      phone, 
      whatsapp, 
      address, 
      branch, 
      categories
    )
    VALUES (
      new.id,
      new.email,
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'company_name',
      new.raw_user_meta_data->>'document',
      new.raw_user_meta_data->>'phone',
      new.raw_user_meta_data->>'whatsapp',
      new.raw_user_meta_data->>'address',
      new.raw_user_meta_data->>'branch',
      ARRAY(SELECT jsonb_array_elements_text(new.raw_user_meta_data->'categories'))
    );
  END IF;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recriar o trigger (caso já exista, removemos primeiro)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
