-- =====================================================
-- POLÍTICAS RLS PARA COMPARTILHAMENTO DE PERFIS E FOTOS
-- =====================================================

-- 1. TABELA DE PERFIS (permitir SELECT para usuários autenticados)
-- =====================================================

-- Habilitar RLS na tabela perfis se ainda não estiver
ALTER TABLE IF EXISTS perfis ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "usuarios_podem_ver_todos_perfis" ON perfis;
DROP POLICY IF EXISTS "usuarios_podem_editar_proprio_perfil" ON perfis;
DROP POLICY IF EXISTS "usuarios_podem_inserir_proprio_perfil" ON perfis;
DROP POLICY IF EXISTS "public_profiles" ON perfis;
DROP POLICY IF EXISTS "own_profile_update" ON perfis;

-- POLÍTICA 1: Todos os usuários autenticados podem VER todos os perfis
CREATE POLICY "usuarios_podem_ver_todos_perfis" ON perfis
    FOR SELECT 
    USING (auth.role() = 'authenticated');

-- POLÍTICA 2: Usuários podem INSERIR apenas seu próprio perfil
CREATE POLICY "usuarios_podem_inserir_proprio_perfil" ON perfis
    FOR INSERT 
    WITH CHECK (auth.uid()::text = email OR auth.uid()::text = nome);

-- POLÍTICA 3: Usuários podem ATUALIZAR apenas seu próprio perfil
CREATE POLICY "usuarios_podem_editar_proprio_perfil" ON perfis
    FOR UPDATE 
    USING (auth.uid()::text = email OR auth.uid()::text = nome)
    WITH CHECK (auth.uid()::text = email OR auth.uid()::text = nome);

-- POLÍTICA 4: Usuários podem DELETAR apenas seu próprio perfil
CREATE POLICY "usuarios_podem_deletar_proprio_perfil" ON perfis
    FOR DELETE 
    USING (auth.uid()::text = email OR auth.uid()::text = nome);

-- =====================================================
-- 2. STORAGE BUCKET PARA FOTOS DE PERFIL
-- =====================================================

-- Criar bucket se não existir
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'profile-photos', 
    'profile-photos', 
    true, 
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Remover políticas existentes do storage
DROP POLICY IF EXISTS "profile_photos_public_read" ON storage.objects;
DROP POLICY IF EXISTS "profile_photos_authenticated_upload" ON storage.objects;
DROP POLICY IF EXISTS "profile_photos_own_update" ON storage.objects;
DROP POLICY IF EXISTS "profile_photos_own_delete" ON storage.objects;

-- POLÍTICA STORAGE 1: Leitura pública de fotos de perfil
CREATE POLICY "profile_photos_public_read" ON storage.objects
    FOR SELECT 
    USING (bucket_id = 'profile-photos');

-- POLÍTICA STORAGE 2: Upload apenas para usuários autenticados
CREATE POLICY "profile_photos_authenticated_upload" ON storage.objects
    FOR INSERT 
    WITH CHECK (
        bucket_id = 'profile-photos' 
        AND auth.role() = 'authenticated'
    );

-- POLÍTICA STORAGE 3: Usuários podem atualizar suas próprias fotos
CREATE POLICY "profile_photos_own_update" ON storage.objects
    FOR UPDATE 
    USING (
        bucket_id = 'profile-photos' 
        AND auth.role() = 'authenticated'
        AND (owner = auth.uid() OR name ILIKE '%' || auth.uid()::text || '%')
    );

-- POLÍTICA STORAGE 4: Usuários podem deletar suas próprias fotos
CREATE POLICY "profile_photos_own_delete" ON storage.objects
    FOR DELETE 
    USING (
        bucket_id = 'profile-photos' 
        AND auth.role() = 'authenticated'
        AND (owner = auth.uid() OR name ILIKE '%' || auth.uid()::text || '%')
    );

-- =====================================================
-- 3. BUCKET CHAT-UPLOADS (para mídias do chat)
-- =====================================================

-- Criar bucket para uploads do chat se não existir
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'chat-uploads', 
    'chat-uploads', 
    true, 
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'audio/mpeg', 'audio/wav', 'video/mp4']
) ON CONFLICT (id) DO NOTHING;

-- Políticas para chat-uploads (leitura pública, upload para autenticados)
DROP POLICY IF EXISTS "chat_uploads_public_read" ON storage.objects;
DROP POLICY IF EXISTS "chat_uploads_authenticated_insert" ON storage.objects;
DROP POLICY IF EXISTS "chat_uploads_authenticated_delete" ON storage.objects;

CREATE POLICY "chat_uploads_public_read" ON storage.objects
    FOR SELECT 
    USING (bucket_id = 'chat-uploads');

CREATE POLICY "chat_uploads_authenticated_insert" ON storage.objects
    FOR INSERT 
    WITH CHECK (bucket_id = 'chat-uploads' AND auth.role() = 'authenticated');

CREATE POLICY "chat_uploads_authenticated_delete" ON storage.objects
    FOR DELETE 
    USING (bucket_id = 'chat-uploads' AND auth.role() = 'authenticated');

-- =====================================================
-- 4. FUNÇÕES AUXILIARES PARA PERFIS
-- =====================================================

-- Função para buscar perfil por nome de usuário
CREATE OR REPLACE FUNCTION get_user_profile(username text)
RETURNS TABLE(
    nome text,
    email text,
    foto text,
    fotos text[],
    descricao text,
    idade integer,
    is_premium boolean,
    created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.nome,
        p.email,
        p.foto,
        p.fotos,
        p.descricao,
        p.idade,
        p.is_premium,
        p.created_at
    FROM perfis p
    WHERE p.nome = username
    LIMIT 1;
END;
$$;

-- Função para buscar foto de perfil por nome de usuário
CREATE OR REPLACE FUNCTION get_user_photo(username text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_photo text;
BEGIN
    SELECT 
        CASE 
            WHEN p.fotos IS NOT NULL AND array_length(p.fotos, 1) > 0 THEN p.fotos[1]
            WHEN p.foto IS NOT NULL THEN p.foto
            ELSE NULL
        END INTO user_photo
    FROM perfis p
    WHERE p.nome = username
    LIMIT 1;
    
    RETURN user_photo;
END;
$$;

-- =====================================================
-- 5. ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índice na coluna nome para busca rápida
CREATE INDEX IF NOT EXISTS idx_perfis_nome ON perfis(nome);

-- Índice na coluna email para busca rápida
CREATE INDEX IF NOT EXISTS idx_perfis_email ON perfis(email);

-- Índice na coluna created_at para ordenação
CREATE INDEX IF NOT EXISTS idx_perfis_created_at ON perfis(created_at DESC);

-- =====================================================
-- 6. VERIFICAÇÃO DAS POLÍTICAS
-- =====================================================

-- Verificar políticas da tabela perfis
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'perfis';

-- Verificar políticas do storage
SELECT 
    policyname,
    cmd,
    permissive,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects';

-- =====================================================
-- 7. GRANTS DE PERMISSÃO
-- =====================================================

-- Garantir permissões na tabela perfis
GRANT SELECT ON perfis TO authenticated;
GRANT INSERT ON perfis TO authenticated;
GRANT UPDATE ON perfis TO authenticated;
GRANT DELETE ON perfis TO authenticated;

-- Garantir permissões nas funções
GRANT EXECUTE ON FUNCTION get_user_profile(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_photo(text) TO authenticated;

-- Comentários para documentação
COMMENT ON POLICY "usuarios_podem_ver_todos_perfis" ON perfis IS 
'Permite que usuários autenticados vejam perfis de todos os outros usuários';

COMMENT ON POLICY "profile_photos_public_read" ON storage.objects IS 
'Permite leitura pública de fotos de perfil para todos verem';

COMMENT ON FUNCTION get_user_profile(text) IS 
'Função segura para buscar perfil completo de um usuário pelo nome';

COMMENT ON FUNCTION get_user_photo(text) IS 
'Função segura para buscar foto de perfil de um usuário pelo nome'; 