-- =====================================================
-- SCRIPT RLS PARA COMPARTILHAMENTO DE PERFIS E FOTOS
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- 1. HABILITAR RLS NA TABELA PERFIS
ALTER TABLE IF EXISTS perfis ENABLE ROW LEVEL SECURITY;

-- 2. REMOVER POLÍTICAS ANTIGAS SE EXISTIREM
DROP POLICY IF EXISTS "usuarios_podem_ver_todos_perfis" ON perfis;
DROP POLICY IF EXISTS "usuarios_podem_editar_proprio_perfil" ON perfis;
DROP POLICY IF EXISTS "usuarios_podem_inserir_proprio_perfil" ON perfis;
DROP POLICY IF EXISTS "profile_photos_public_read" ON storage.objects;
DROP POLICY IF EXISTS "profile_photos_authenticated_upload" ON storage.objects;
DROP POLICY IF EXISTS "chat_uploads_public_read" ON storage.objects;

-- 3. CRIAR POLÍTICAS PARA PERFIS (PERMITIR VER TODOS OS PERFIS)
CREATE POLICY "usuarios_podem_ver_todos_perfis" ON perfis
    FOR SELECT 
    USING (true); -- ✅ TODOS os usuários autenticados podem ver TODOS os perfis

CREATE POLICY "usuarios_podem_inserir_proprio_perfil" ON perfis
    FOR INSERT 
    WITH CHECK (true); -- ✅ Permitir inserção (será controlado pelo app)

CREATE POLICY "usuarios_podem_editar_proprio_perfil" ON perfis
    FOR UPDATE 
    USING (true) 
    WITH CHECK (true); -- ✅ Permitir edição (será controlado pelo app)

-- 4. CRIAR BUCKET PARA FOTOS DE PERFIL (SE NÃO EXISTIR)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'profile-photos', 
    'profile-photos', 
    true, -- ✅ PÚBLICO para todos poderem ver
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO UPDATE SET 
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

-- 5. CRIAR BUCKET PARA CHAT (SE NÃO EXISTIR)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'chat-uploads', 
    'chat-uploads', 
    true, -- ✅ PÚBLICO 
    10485760, -- 10MB
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'audio/mpeg', 'audio/wav', 'video/mp4']
) ON CONFLICT (id) DO UPDATE SET 
    public = true,
    file_size_limit = 10485760;

-- 6. POLÍTICAS PARA STORAGE DE FOTOS DE PERFIL
CREATE POLICY "profile_photos_public_read" ON storage.objects
    FOR SELECT 
    USING (bucket_id = 'profile-photos'); -- ✅ LEITURA PÚBLICA de fotos de perfil

CREATE POLICY "profile_photos_authenticated_upload" ON storage.objects
    FOR INSERT 
    WITH CHECK (bucket_id = 'profile-photos' AND auth.role() = 'authenticated');

CREATE POLICY "profile_photos_authenticated_update" ON storage.objects
    FOR UPDATE 
    USING (bucket_id = 'profile-photos' AND auth.role() = 'authenticated');

CREATE POLICY "profile_photos_authenticated_delete" ON storage.objects
    FOR DELETE 
    USING (bucket_id = 'profile-photos' AND auth.role() = 'authenticated');

-- 7. POLÍTICAS PARA STORAGE DE CHAT
CREATE POLICY "chat_uploads_public_read" ON storage.objects
    FOR SELECT 
    USING (bucket_id = 'chat-uploads'); -- ✅ LEITURA PÚBLICA de uploads do chat

CREATE POLICY "chat_uploads_authenticated_upload" ON storage.objects
    FOR INSERT 
    WITH CHECK (bucket_id = 'chat-uploads' AND auth.role() = 'authenticated');

CREATE POLICY "chat_uploads_authenticated_delete" ON storage.objects
    FOR DELETE 
    USING (bucket_id = 'chat-uploads' AND auth.role() = 'authenticated');

-- 8. GRANTS DE PERMISSÃO
GRANT SELECT ON perfis TO authenticated;
GRANT INSERT ON perfis TO authenticated;
GRANT UPDATE ON perfis TO authenticated;
GRANT DELETE ON perfis TO authenticated;

-- 9. FUNÇÃO AUXILIAR PARA BUSCAR PERFIL
CREATE OR REPLACE FUNCTION get_user_profile(username text)
RETURNS TABLE(
    nome text,
    email text,
    foto text,
    fotos text[],
    descricao text,
    idade integer,
    is_premium boolean,
    created_at timestamp with time zone,
    foto_principal integer
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
        p.created_at,
        COALESCE(p.foto_principal, 0) as foto_principal
    FROM perfis p
    WHERE p.nome = username
    LIMIT 1;
END;
$$;

-- Grant na função
GRANT EXECUTE ON FUNCTION get_user_profile(text) TO authenticated;

-- 10. VERIFICAÇÃO FINAL
SELECT 
    'CONFIGURAÇÃO COMPLETA!' as status,
    (SELECT count(*) FROM pg_policies WHERE tablename = 'perfis') as politicas_perfil,
    (SELECT count(*) FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects') as politicas_storage,
    (SELECT count(*) FROM storage.buckets WHERE public = true) as buckets_publicos;

-- 11. MOSTRAR POLÍTICAS CRIADAS
SELECT 
    'PERFIS' as tabela,
    policyname,
    cmd,
    permissive,
    qual
FROM pg_policies 
WHERE tablename = 'perfis'

UNION ALL

SELECT 
    'STORAGE' as tabela,
    policyname,
    cmd,
    permissive,
    qual
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY tabela, cmd; 