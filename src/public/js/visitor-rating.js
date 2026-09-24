(() => {
  window.mountVisitorRating = function (projectId, parent) {
    const section = document.createElement('section');
    section.className = 'block visitor-rating'; section.id = 'avaliacao-publico';
    section.innerHTML = `<span class="eyebrow">A VOZ DE QUEM VISITA</span><h2>Avaliação do público</h2><p>O que você achou deste projeto? Sua opinião fica separada das notas dos professores e não altera o ranking da banca.</p><p class="visitor-summary" aria-live="polite">Carregando avaliações do público...</p><form><fieldset><legend>Sua nota para o projeto</legend><div class="visitor-rating-options">${[1,2,3,4,5].map(n=>`<label><input type="radio" name="notaVisitante" value="${n}" required><span>${n} <span aria-hidden="true">★</span></span></label>`).join('')}</div><small>1 = não gostei · 5 = excelente</small></fieldset><button class="btn" type="submit" disabled>Enviar avaliação do público</button></form><p class="visitor-feedback" role="status" aria-live="polite"></p><button type="button" class="btn ghost visitor-retry" hidden>Tentar novamente</button><p class="mini-help">Uma nota por projeto neste navegador. Você pode atualizar sua nota. Não pedimos nome nem e-mail.</p><a href="login.html">Sou professor: acessar avaliação da banca ↗</a>`;
    parent.append(section);
    const form=section.querySelector('form'), button=form.querySelector('button'), feedback=section.querySelector('.visitor-feedback'), retry=section.querySelector('.visitor-retry');
    const endpoint=`api/v1/avaliacoes-visitantes/${encodeURIComponent(projectId)}`;
    function render(data) {
      section.querySelector('.visitor-summary').textContent=data.total ? `Público: ${Number(data.media).toFixed(1).replace('.',',')} / 5 · ${data.total} avaliação(ões)` : 'Este projeto ainda não recebeu avaliações do público.';
      if(data.minhaNota){form.querySelector(`input[value="${data.minhaNota}"]`).checked=true;button.textContent='Atualizar minha avaliação';}
    }
    async function request(options) {const response=await fetch(endpoint,{credentials:'same-origin',cache:'no-store',...options});const json=await response.json();if(!response.ok||!json.success)throw new Error(json.message||'Não foi possível carregar a avaliação.');return json.data;}
    async function load(){button.disabled=true;retry.hidden=true;feedback.textContent='';try{const data=await request();render(data);button.disabled=Boolean(data.demonstracao);if(data.demonstracao)feedback.textContent="Prévia visual: o envio fica disponível no servidor conectado ao banco de dados.";}catch(error){section.querySelector('.visitor-summary').textContent='Avaliações do público indisponíveis no momento.';feedback.textContent=error.message;retry.hidden=false;}}
    form.addEventListener('submit',async event=>{event.preventDefault();if(!form.reportValidity())return;button.disabled=true;feedback.textContent='Enviando...';try{render(await request({method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({nota:Number(new FormData(form).get('notaVisitante'))})}));feedback.textContent='Obrigado! Sua avaliação do público foi registrada.';}catch(error){feedback.textContent=error.message;}finally{button.disabled=false;}});
    retry.addEventListener('click',load);load();
  };
})();