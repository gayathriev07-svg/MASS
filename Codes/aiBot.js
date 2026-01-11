(function(){
  const ID = 'ai-bot-root';
  if(document.getElementById(ID)) return;

  const root = document.createElement('div');
  root.id = ID;
  document.documentElement.appendChild(root);

  const css = `
    #ai-bot-root{z-index:99999;font-family:Segoe UI,Arial,sans-serif}
    .ai-bot-button{position:fixed;right:22px;bottom:22px;width:64px;height:64px;border-radius:50%;background:#0b5ed7;color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 10px 30px rgba(11,94,215,0.25);cursor:pointer;border:none}
    .ai-bot-panel{position:fixed;right:22px;bottom:100px;width:340px;max-width:calc(100% - 48px);height:420px;border-radius:12px;background:#fff;box-shadow:0 18px 40px rgba(2,6,23,0.2);overflow:hidden;display:flex;flex-direction:column}
    .ai-bot-header{background:#0b5ed7;color:#fff;padding:12px 14px;font-weight:700;display:flex;align-items:center;justify-content:space-between}
    .ai-bot-messages{flex:1;padding:12px;overflow:auto;background:linear-gradient(#f7fbff,#f3f8ff)}
    .ai-bot-row{display:flex;margin-bottom:10px}
    .ai-bot-row.user{justify-content:flex-end}
    .ai-bot-bubble{max-width:78%;padding:10px 12px;border-radius:12px;background:#eaf3ff;color:#0b2545}
    .ai-bot-row.user .ai-bot-bubble{background:#0b5ed7;color:white}
    .ai-bot-input{display:flex;padding:10px;border-top:1px solid #eef3ff;background:#fff}
    .ai-bot-input input{flex:1;padding:10px;border-radius:8px;border:1px solid #e6efff;margin-right:8px}
    .ai-bot-input button{background:#0b5ed7;color:#fff;border:none;padding:10px 12px;border-radius:8px;cursor:pointer}
    .ai-bot-small{font-size:13px;opacity:0.9}
  `;

  const style = document.createElement('style');
  style.appendChild(document.createTextNode(css));
  root.appendChild(style);

  // Button
  const btn = document.createElement('button');
  btn.className = 'ai-bot-button';
  btn.title = 'Career Assistant';
  btn.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="currentColor"/></svg>';
  root.appendChild(btn);

  // Panel
  const panel = document.createElement('div');
  panel.className = 'ai-bot-panel';
  panel.style.display = 'none';

  panel.innerHTML = `
    <div class="ai-bot-header">
      <div>Career Assistant</div>
      <div style="display:flex;gap:8px;align-items:center">
        <div class="ai-bot-small" id="ai-bot-status">Offline</div>
        <button id="ai-bot-close" style="background:transparent;border:none;color:#fff;cursor:pointer;font-size:18px">✕</button>
      </div>
    </div>
    <div class="ai-bot-messages" id="ai-bot-messages"></div>
    <div class="ai-bot-input">
      <input id="ai-bot-input" placeholder="Ask about careers, skills, jobs..." />
      <button id="ai-bot-send">Send</button>
    </div>
  `;
  root.appendChild(panel);

  const messagesEl = panel.querySelector('#ai-bot-messages');
  const inputEl = panel.querySelector('#ai-bot-input');
  const sendBtn = panel.querySelector('#ai-bot-send');
  const closeBtn = panel.querySelector('#ai-bot-close');
  const statusEl = panel.querySelector('#ai-bot-status');

  // simple persistence per origin
  const STORAGE_KEY = 'aiBot_conversation_v1';
  function loadMessages(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    }catch(e){return []}
  }
  function saveMessages(list){
    try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }catch(e){}
  }

  function appendMessage(text, who='bot'){
    const row = document.createElement('div');
    row.className = 'ai-bot-row ' + (who==='user' ? 'user' : 'bot');
    const bubble = document.createElement('div');
    bubble.className = 'ai-bot-bubble';
    bubble.innerText = text;
    row.appendChild(bubble);
    messagesEl.appendChild(row);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function renderLoaded(){
    messagesEl.innerHTML = '';
    const list = loadMessages();
    list.forEach(m=> appendMessage(m.text, m.who));
  }

  function botReply(userText){
    // simple rule-based replies
    const t = userText.toLowerCase();
    if(t.includes('job') || t.includes('jobs') || t.includes('apply')){
      return 'You can search live jobs on the Results page, or tell me which skill you want and I can suggest job roles.';
    }
    if(t.includes('degree') || t.includes('degree vs') || t.includes('demand')){
      return 'Degree vs Demand: degrees open doors, skills keep you moving. Which field are you curious about?';
    }
    if(t.includes('soft') || t.includes('skill') || t.includes('skills')){
      return 'Soft skills like communication and teamwork are crucial. Want a quick list of top soft skills?';
    }
    if(t.includes('hello')||t.includes('hi')) return 'Hi — I can help with career suggestions, job search tips, and skills. Try asking "what jobs for data analyst?"';
    // fallback echo with delay
    return "Thanks — I'll look into that. Meanwhile, try asking 'what jobs for <skill>' or 'degree vs demand'.";
  }

  function handleSend(){
    const text = inputEl.value.trim();
    if(!text) return;
    appendMessage(text,'user');
    const list = loadMessages();
    list.push({who:'user',text});
    saveMessages(list);
    inputEl.value = '';
    statusEl.innerText = 'Thinking...';
    setTimeout(()=>{
      const reply = botReply(text);
      appendMessage(reply,'bot');
      const newList = loadMessages();
      newList.push({who:'bot',text:reply});
      saveMessages(newList);
      statusEl.innerText = 'Online';
    },600);
  }

  sendBtn.addEventListener('click', handleSend);
  inputEl.addEventListener('keydown', (e)=>{ if(e.key==='Enter') handleSend(); });

  btn.addEventListener('click', ()=>{
    const showing = panel.style.display !== 'none';
    panel.style.display = showing ? 'none' : 'flex';
    if(panel.style.display === 'flex'){
      renderLoaded();
      inputEl.focus();
      statusEl.innerText = 'Online';
    }
  });
  closeBtn.addEventListener('click', ()=>{ panel.style.display='none'; });

  // render initial button only; if conversation exists, show a small indicator dot
  const conv = loadMessages();
  if(conv.length) btn.innerHTML += '<span style="position:absolute;right:8px;top:8px;width:10px;height:10px;border-radius:50%;background:#22c55e;box-shadow:0 0 6px rgba(34,197,94,0.6)"></span>';

  // accessibility: allow focusing
  btn.setAttribute('aria-label','Open career assistant');
})();
