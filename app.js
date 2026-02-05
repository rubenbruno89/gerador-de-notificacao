const templates = {
  dias: `Olá #NOMECOMPLETO#

🟨 Este é apenas um lembrete da sua fatura vence em #DIAS# dias.

DADOS DA FATURA
------------------------------------
🔸Vencimento: #VENCIMENTO# 
🔸Valor da Fatura: R$ #VALOR#
🔸Sub-Total: R$ #VALOR#
------------------------------------


🏦 Pagamento via PIX: #PIX#

📲 Clique no link Chave abaixo para Fazer o Pagamento.

🔑 #LINKPAGAMENTO#


Após o pagamento encaminhar o comprovante via whatsapp.`,
  dia: `Olá *#NOMECOMPLETO#*

🟦 Este é apenas um lembrete da sua fatura vence hoje: 

DADOS DA FATURA
------------------------------------
🔸Vencimento: #VENCIMENTO# 
🔸Valor da Fatura: R$ #VALOR#
🔸Sub-Total: R$ #VALOR#
------------------------------------


🏦 Pagamento via PIX: #PIX#

📲 Clique no link Chave abaixo para Fazer o Pagamento.

🔑 #LINKPAGAMENTO#


Após o pagamento encaminhar o comprovante via whatsapp.`,
  vencida: `Olá *#NOMECOMPLETO#*

🟥 Este é apenas um lembrete da sua fatura que venceu.

DADOS DA FATURA
------------------------------------
🔸Vencimento: #VENCIMENTO# 
🔸Valor da Fatura: R$ #VALOR#
🔸Sub-Total: R$ #VALOR#
------------------------------------


🏦 Pagamento via PIX: #PIX# 

📲 Clique no link Chave abaixo para Fazer o Pagamento.

🔑 #LINKPAGAMENTO#


Após o pagamento encaminhar o comprovante via whatsapp..`,
  comprovante: `Olá #NOMECOMPLETO#

✅ Pagamento confirmado com sucesso!

📄 DADOS DA FATURA
━━━━━━━━━━━━━━━━━━━━━━
💰 Valor Pago: R$   #VALOR#
🧾 Sub-total: R$   #VALOR#
📅 Próximo vencimento: #VENCIMENTO#❗
━━━━━━━━━━━━━━━━━━━━━━

🛡️ Seu serviço foi renovado com sucesso!
📌 Em caso de dúvidas, estamos à disposição para te ajudar.

Obrigado!`,
  boasvindas: `👋 Olá, #NOMECOMPLETO#!
É uma alegria ter você com a gente.
Se precisar de algo ou tiver alguma dúvida, é só nos chamar por aqui!`
};

const $ = sel => document.querySelector(sel);
const els = {
  nome: $('#nome'),
  vencimento: $('#vencimento'),
  valor: $('#valor'),
  dias: $('#dias'),
  pix: $('#pix'),
  link: $('#link'),
  tplBtns: [...document.querySelectorAll('.tpl-btn')],
  generate: $('#generate'),
  output: $('#output'),
  copy: $('#copy'),
  download: $('#download'),
  reset: $('#reset'),
  meta: $('#meta')
};

let activeTpl = 'dias';

function formatCurrencyInput(v){
  if(!v) return '';
  // normalize comma to dot, ensure two decimals
  v = String(v).trim().replace(',', '.').replace(/[^0-9.]/g,'');
  if(v === '') return '';
  let n = parseFloat(v);
  if(isNaN(n)) return '';
  return n.toFixed(2).replace('.',',');
}

function formatDateInput(iso){
  if(!iso) return '';
  try{
    const d = new Date(iso);
    if (isNaN(d)) return iso;
    return d.toLocaleDateString('pt-BR');
  }catch(e){ return iso }
}

function buildMessage(){
  const data = {
    NOMECOMPLETO: els.nome.value || '#NOMECOMPLETO#',
    DIAS: els.dias.value || '#DIAS#',
    VENCIMENTO: els.vencimento.value ? formatDateInput(els.vencimento.value) : '#VENCIMENTO#',
    VALOR: formatCurrencyInput(els.valor.value) || '#VALOR#',
    PIX: els.pix.value || '#PIX#',
    LINKPAGAMENTO: els.link.value || '#LINKPAGAMENTO#'
  };
  let tpl = templates[activeTpl] || '';
  Object.entries(data).forEach(([k,v])=>{
    const re = new RegExp(`#${k}#`,'g');
    tpl = tpl.replace(re, v);
  });
  return tpl;
}

function updatePreview(){
  const text = buildMessage();
  els.output.textContent = text;
  els.meta.textContent = activeTpl.toUpperCase();
}

els.tplBtns.forEach(btn=>{
  btn.addEventListener('click', ()=>{
    els.tplBtns.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    activeTpl = btn.getAttribute('data-tpl');
    updatePreview();
  });
});

els.generate.addEventListener('click', ()=>{
  updatePreview();
  // small highlight
  els.output.animate([{transform:'scale(0.995)'},{transform:'scale(1)'}],{duration:120});
});

els.copy.addEventListener('click', async ()=>{
  const text = buildMessage();
  try{
    await navigator.clipboard.writeText(text);
    els.copy.textContent = 'Copiado';
    setTimeout(()=>els.copy.textContent='Copiar',1200);
  }catch(e){
    alert('Não foi possível copiar. Selecione e copie manualmente.');
  }
});

els.download.addEventListener('click', ()=>{
  const text = buildMessage();
  const blob = new Blob([text],{type:'text/plain;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${activeTpl}-mensagem.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

els.reset.addEventListener('click', ()=>{
  els.nome.value = '';
  els.vencimento.value = '';
  els.valor.value = '';
  els.dias.value = '3';
  els.pix.value = '';
  els.link.value = '';
  updatePreview();
});

// live updates for nicer UX
['input','change'].forEach(ev=>{
  ['nome','vencimento','valor','dias','pix','link'].forEach(id=>{
    $( `#${id}` ).addEventListener(ev, updatePreview);
  });
});

// initial
updatePreview();
