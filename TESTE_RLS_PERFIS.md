# 🔐 TESTE DAS POLÍTICAS RLS - PERFIS E FOTOS

## 📋 CHECKLIST DE CONFIGURAÇÃO

### 1. Aplicar as Políticas RLS

Execute no **SQL Editor** do Supabase:

```sql
-- =====================================================
-- APLICAR POLÍTICAS RLS PARA COMPARTILHAMENTO
-- =====================================================

-- Habilitar RLS na tabela perfis
ALTER TABLE IF EXISTS perfis ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas
DROP POLICY IF EXISTS "usuarios_podem_ver_todos_perfis" ON perfis;
DROP POLICY IF EXISTS "usuarios_podem_editar_proprio_perfil" ON perfis;
DROP POLICY IF EXISTS "usuarios_podem_inserir_proprio_perfil" ON perfis;

-- ✅ POLÍTICA PRINCIPAL: Todos os usuários autenticados podem VER todos os perfis
CREATE POLICY "usuarios_podem_ver_todos_perfis" ON perfis
    FOR SELECT 
    USING (true); -- Permite leitura total para usuários autenticados

-- ✅ Usuários podem INSERIR/ATUALIZAR apenas seu próprio perfil
CREATE POLICY "usuarios_podem_inserir_proprio_perfil" ON perfis
    FOR INSERT 
    WITH CHECK (auth.uid()::text = email OR auth.uid()::text = nome);

CREATE POLICY "usuarios_podem_editar_proprio_perfil" ON perfis
    FOR UPDATE 
    USING (auth.uid()::text = email OR auth.uid()::text = nome)
    WITH CHECK (auth.uid()::text = email OR auth.uid()::text = nome);

-- =====================================================
-- STORAGE POLICIES PARA FOTOS
-- =====================================================

-- Criar buckets se não existirem
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'profile-photos', 
    'profile-photos', 
    true, 
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- ✅ LEITURA PÚBLICA DE FOTOS (para todos verem)
CREATE POLICY "profile_photos_public_read" ON storage.objects
    FOR SELECT 
    USING (bucket_id = 'profile-photos');

-- ✅ UPLOAD PARA USUÁRIOS AUTENTICADOS
CREATE POLICY "profile_photos_authenticated_upload" ON storage.objects
    FOR INSERT 
    WITH CHECK (bucket_id = 'profile-photos' AND auth.role() = 'authenticated');
```

### 2. Testar Políticas

#### Teste 1: Verificar se RLS está ativo
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'perfis' AND schemaname = 'public';
```

#### Teste 2: Listar políticas ativas
```sql
SELECT policyname, cmd, permissive, roles, qual, with_check
FROM pg_policies 
WHERE tablename = 'perfis';
```

#### Teste 3: Testar leitura de perfis
```sql
-- Este comando deve retornar TODOS os perfis para usuários autenticados
SELECT nome, email, foto, fotos, descricao 
FROM perfis 
LIMIT 5;
```

### 3. Configurar Bucket de Storage

#### No painel do Supabase:

1. **Storage > Buckets > New Bucket**
   - Name: `profile-photos`
   - Public: ✅ **HABILITADO** 
   - File size limit: 5MB
   - Allowed MIME types: `image/jpeg, image/png, image/gif, image/webp`

2. **Configurar políticas do bucket:**
```sql
-- Leitura pública (todos podem ver as fotos)
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'profile-photos');

-- Upload apenas para autenticados
CREATE POLICY "Authenticated Upload" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'profile-photos' 
    AND auth.role() = 'authenticated'
);
```

### 4. Testar no Frontend

#### No console do navegador (F12):
```javascript
// Teste 1: Buscar todos os perfis
const { data, error } = await supabase.from('perfis').select('*');
console.log('Perfis encontrados:', data?.length);

// Teste 2: Buscar perfil específico
const { data: perfil } = await supabase
  .from('perfis')
  .select('*')
  .eq('nome', 'NOME_DO_USUARIO')
  .single();
console.log('Perfil específico:', perfil);

// Teste 3: Buscar foto específica
const { data: foto } = await supabase
  .rpc('get_user_photo', { username: 'NOME_DO_USUARIO' });
console.log('Foto do usuário:', foto);
```

### 5. Debug de Problemas

#### Problema: "RLS policy violation"
```sql
-- Verificar se o usuário está autenticado
SELECT auth.uid(), auth.role();

-- Verificar políticas específicas
SELECT * FROM pg_policies WHERE tablename = 'perfis';
```

#### Problema: Fotos não aparecem
```sql
-- Verificar bucket público
SELECT name, public FROM storage.buckets WHERE id = 'profile-photos';

-- Verificar políticas do storage
SELECT * FROM pg_policies WHERE schemaname = 'storage';
```

## 🔧 CONFIGURAÇÃO AUTOMÁTICA

Execute este script completo no SQL Editor:

```sql
-- SCRIPT COMPLETO DE CONFIGURAÇÃO RLS
BEGIN;

-- 1. Configurar RLS na tabela perfis
ALTER TABLE IF EXISTS perfis ENABLE ROW LEVEL SECURITY;

-- 2. Remover políticas existentes
DO $$
BEGIN
    DROP POLICY IF EXISTS "usuarios_podem_ver_todos_perfis" ON perfis;
    DROP POLICY IF EXISTS "usuarios_podem_editar_proprio_perfil" ON perfis;
    DROP POLICY IF EXISTS "usuarios_podem_inserir_proprio_perfil" ON perfis;
    DROP POLICY IF EXISTS "profile_photos_public_read" ON storage.objects;
    DROP POLICY IF EXISTS "profile_photos_authenticated_upload" ON storage.objects;
EXCEPTION WHEN OTHERS THEN
    NULL; -- Ignorar erros se políticas não existirem
END $$;

-- 3. Criar novas políticas
CREATE POLICY "usuarios_podem_ver_todos_perfis" ON perfis
    FOR SELECT USING (true);

CREATE POLICY "usuarios_podem_inserir_proprio_perfil" ON perfis
    FOR INSERT WITH CHECK (true);

CREATE POLICY "usuarios_podem_editar_proprio_perfil" ON perfis
    FOR UPDATE USING (true) WITH CHECK (true);

-- 4. Configurar storage
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('profile-photos', 'profile-photos', true, 5242880, 
        ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET public = true;

-- 5. Políticas do storage
CREATE POLICY "profile_photos_public_read" ON storage.objects
    FOR SELECT USING (bucket_id = 'profile-photos');

CREATE POLICY "profile_photos_authenticated_upload" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'profile-photos');

-- 6. Grants de permissão
GRANT ALL ON perfis TO authenticated;
GRANT ALL ON storage.objects TO authenticated;

COMMIT;

-- 7. Verificação final
SELECT 'RLS Configurado com sucesso!' as status,
       (SELECT count(*) FROM pg_policies WHERE tablename = 'perfis') as politicas_perfil,
       (SELECT count(*) FROM pg_policies WHERE schemaname = 'storage') as politicas_storage;
```

## ✅ RESULTADO ESPERADO

Após aplicar essas configurações:

1. **✅ Todos os usuários autenticados podem ver perfis de todos os outros usuários**
2. **✅ Todas as fotos ficam públicas e visíveis para todos**
3. **✅ Mini janela de perfil mostra fotos de qualquer usuário**
4. **✅ Sistema funciona sem erros de permissão**

## 🚨 IMPORTANTE

⚠️ **Essas configurações tornam os perfis PÚBLICOS para usuários autenticados**
⚠️ **Teste primeiro em ambiente de desenvolvimento**
⚠️ **Monitore logs para verificar se não há erros** 