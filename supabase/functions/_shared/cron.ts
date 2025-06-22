// Configuração de Cron Jobs para Supabase Edge Functions
// Este arquivo define os agendamentos automáticos

export const cronJobs = [
  {
    name: 'cleanup-chat',
    schedule: '*/5 * * * *', // A cada 5 minutos
    function_name: 'cleanup-chat',
    description: 'Limpeza automática de mensagens e arquivos de chat antigos'
  }
] 