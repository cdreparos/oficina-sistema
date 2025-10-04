import { SUPABASE_URL, SUPABASE_KEY } from './config.js';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function testarConexao() {
  const { data, error } = await supabase.from('anotacoes').select('*');
  if (error) {
    console.error("❌ Erro ao conectar ao Supabase:", error.message);
  } else {
    console.log("✅ Conexão bem-sucedida!");
    console.log("Anotações encontradas:", data);
  }
}

testarConexao();
