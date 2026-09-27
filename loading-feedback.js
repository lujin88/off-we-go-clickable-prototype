(() => {
  const selector='h1,h2,h3,p,span,b,small,button,[role="status"],.transport-status,.api-status';
  const isLoading=text => /^(正在|加载中|核对中|Researching|Loading|Checking|Comparing|Looking up|Putting|Organising|Verifying|Generating|Deleting|Saving)/u.test(text.trim());
  const lastTextNode=element => {
    const walker=document.createTreeWalker(element,NodeFilter.SHOW_TEXT);
    let node,last; while((node=walker.nextNode())) if(node.nodeValue.trim()) last=node;
    return last;
  };
  const trimTrailingDots=element => {
    const last=lastTextNode(element);
    if(last){const next=last.nodeValue.replace(/[.…]{1,3}\s*$/u,'');if(next!==last.nodeValue)last.nodeValue=next;}
  };
  const localizeStem=element => {
    if (window.OffWeGoI18n?.getLanguage?.() !== 'en') return;
    const last=lastTextNode(element);
    if (!last) return;
    const translated=window.OffWeGoI18n.t(last.nodeValue).replace(/[.…]{1,3}\s*$/u,'');
    if (translated && translated !== last.nodeValue) last.nodeValue=translated;
  };
  const update=element => {
    if (!(element instanceof Element)) return;
    const loading=isLoading(element.textContent || '');
    element.classList.toggle('loading-copy',loading);
    if(loading){trimTrailingDots(element);localizeStem(element);element.setAttribute('aria-busy','true');}
    else element.removeAttribute('aria-busy');
  };
  const scan=root => {
    const scope=root instanceof Element ? root : root.parentElement;
    if(!scope) return;
    if(scope.matches(selector)) update(scope);
    scope.querySelectorAll(selector).forEach(update);
  };
  scan(document);
  const pending=new Set(); let scheduled=false;
  const flush=()=>{scheduled=false;const roots=[...pending];pending.clear();roots.forEach(scan);};
  new MutationObserver(records=>{
    records.forEach(record=>pending.add(record.target));
    if(!scheduled){scheduled=true;requestAnimationFrame(flush);}
  }).observe(document.body,{subtree:true,childList:true,characterData:true});
})();
