import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Inicializar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log('🧹 Iniciando limpeza automática...')

    // Calcular tempo limite (5 minutos atrás)
    const cincoMinutosAtras = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    
    // 1. Buscar mensagens antigas antes de deletar (para pegar arquivos associados)
    const { data: mensagensAntigas, error: selectError } = await supabase
      .from('chat_messages')
      .select('id, content, message_type')
      .lt('created_at', cincoMinutosAtras)

    if (selectError) {
      console.error('❌ Erro ao buscar mensagens antigas:', selectError)
    }

    let arquivosDeletados = 0
    let mensagensDeletadas = 0

    // 2. Deletar arquivos do Storage associados às mensagens antigas
    if (mensagensAntigas && mensagensAntigas.length > 0) {
      console.log(`📁 Encontradas ${mensagensAntigas.length} mensagens antigas`)
      
      for (const mensagem of mensagensAntigas) {
        // Se for mensagem de mídia, tentar deletar arquivo do storage
        if (mensagem.message_type !== 'texto' && mensagem.content) {
          try {
            // Extrair nome do arquivo da URL ou content
            let fileName = null
            
            if (mensagem.content.includes('supabase.co/storage/')) {
              // Extrair nome do arquivo da URL do Supabase Storage
              const urlParts = mensagem.content.split('/')
              fileName = urlParts[urlParts.length - 1]
            } else if (mensagem.content.startsWith('uploads/')) {
              // Usar diretamente se já for o path do storage
              fileName = mensagem.content
            }
            
            if (fileName) {
              const { error: storageError } = await supabase.storage
                .from('chat-uploads')
                .remove([fileName])
              
              if (!storageError) {
                arquivosDeletados++
                console.log(`🗑️ Arquivo deletado: ${fileName}`)
              } else {
                console.warn(`⚠️ Erro ao deletar arquivo ${fileName}:`, storageError)
              }
            }
          } catch (error) {
            console.warn(`⚠️ Erro ao processar arquivo da mensagem ${mensagem.id}:`, error)
          }
        }
      }
    }

    // 3. Deletar mensagens antigas da tabela chat_messages
    const { error: deleteError, count } = await supabase
      .from('chat_messages')
      .delete({ count: 'exact' })
      .lt('created_at', cincoMinutosAtras)

    if (deleteError) {
      console.error('❌ Erro ao deletar mensagens:', deleteError)
      throw deleteError
    }

    mensagensDeletadas = count || 0

    // 4. Limpeza adicional de outras tabelas se existirem
    
    // Limpar tabela 'mensagens' se existir
    const { error: mensagensError, count: mensagensCount } = await supabase
      .from('mensagens')
      .delete({ count: 'exact' })
      .lt('created_at', cincoMinutosAtras)

    if (mensagensError) {
      console.warn('⚠️ Tabela mensagens não existe ou erro:', mensagensError)
    }

    // Limpar usuários online antigos (mais de 10 minutos offline)
    const dezMinutosAtras = new Date(Date.now() - 10 * 60 * 1000).toISOString()
    const { error: onlineError, count: onlineCount } = await supabase
      .from('usuarios_online')
      .delete({ count: 'exact' })
      .lt('last_seen', dezMinutosAtras)

    if (onlineError) {
      console.warn('⚠️ Tabela usuarios_online não existe ou erro:', onlineError)
    }

    // Limpar salas personalizadas antigas (mais de 1 hora)
    const umaHoraAtras = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { error: salasError, count: salasCount } = await supabase
      .from('salas_personalizadas')
      .delete({ count: 'exact' })
      .lt('created_at', umaHoraAtras)

    if (salasError) {
      console.warn('⚠️ Tabela salas_personalizadas não existe ou erro:', salasError)
    }

    // 5. Limpeza de arquivos órfãos no Storage (sem referência no banco)
    try {
      const { data: allFiles, error: listError } = await supabase.storage
        .from('chat-uploads')
        .list()

      if (!listError && allFiles) {
        const arquivosOrfaos = []
        
        for (const file of allFiles) {
          // Verificar se o arquivo tem referência no banco
          const { data: referencias } = await supabase
            .from('chat_messages')
            .select('id')
            .ilike('content', `%${file.name}%`)
            .limit(1)

          if (!referencias || referencias.length === 0) {
            // Verificar se o arquivo é antigo (mais de 5 minutos)
            const fileCreated = new Date(file.created_at || file.updated_at)
            if (fileCreated < new Date(cincoMinutosAtras)) {
              arquivosOrfaos.push(file.name)
            }
          }
        }

        if (arquivosOrfaos.length > 0) {
          const { error: orphanError } = await supabase.storage
            .from('chat-uploads')
            .remove(arquivosOrfaos)

          if (!orphanError) {
            arquivosDeletados += arquivosOrfaos.length
            console.log(`🗑️ Removidos ${arquivosOrfaos.length} arquivos órfãos`)
          }
        }
      }
    } catch (error) {
      console.warn('⚠️ Erro na limpeza de arquivos órfãos:', error)
    }

    const resultado = {
      success: true,
      timestamp: new Date().toISOString(),
      stats: {
        mensagens_deletadas: mensagensDeletadas,
        arquivos_deletados: arquivosDeletados,
        mensagens_extras: mensagensCount || 0,
        usuarios_online_limpos: onlineCount || 0,
        salas_limpas: salasCount || 0
      },
      message: `🧹 Limpeza concluída! ${mensagensDeletadas} mensagens e ${arquivosDeletados} arquivos removidos.`
    }

    console.log('✅ Limpeza automática concluída:', resultado)

    return new Response(
      JSON.stringify(resultado),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('❌ Erro na limpeza automática:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
}) 