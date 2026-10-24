(function () {
  const cfg = window.DIPLOMATA;

  function read() {
    try {
      const raw = localStorage.getItem(cfg.consentKey);
      if (!raw) {
        return null;
      }
      const data = JSON.parse(raw);
      if (!data || data.version !== cfg.consentVersion) {
        return null;
      }
      return data;
    } catch (error) {
      return null;
    }
  }

  function write(choice) {
    const data = {
      necessary: true,
      analytics: Boolean(choice.analytics),
      marketing: Boolean(choice.marketing),
      version: cfg.consentVersion,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(cfg.consentKey, JSON.stringify(data));
    apply(data);
    return data;
  }

  function apply(data) {
    const root = document.documentElement;
    root.dataset.analytics = data && data.analytics ? "on" : "off";
    root.dataset.marketing = data && data.marketing ? "on" : "off";
    document.dispatchEvent(new CustomEvent("diplomata:consent", { detail: data }));
  }

  function bannerTemplate() {
    return (
      '<div class="cookie-banner" data-cookie-banner role="region" aria-label="Aviso de cookies">' +
      "<p><strong>Cookies deste site.</strong> Os necessários guardam a sua escolha. Analíticos e de campanha só ligam se você autorizar. Nada disso é vendido.</p>" +
      '<div class="cookie-actions">' +
      '<button type="button" class="button button-small" data-cookie="accept">Aceitar</button>' +
      '<button type="button" class="button button-small button-ghost" data-cookie="reject">Só necessários</button>' +
      '<button type="button" class="text-button" data-cookie="configure">Configurar</button>' +
      '<a href="/paginas/privacidade.html">Política</a>' +
      "</div></div>" +
      '<dialog class="cookie-dialog" data-cookie-dialog aria-labelledby="cookie-title">' +
      "<form method=\"dialog\">" +
      '<h2 id="cookie-title">Preferências de cookies</h2>' +
      '<p>Versão ' + cfg.consentVersion + ". Você pode mudar isso quando quiser, pelo rodapé.</p>" +
      '<label class="check lock"><input type="checkbox" checked disabled> <span><strong>Necessários</strong> Grava a decisão, o rascunho do booking e a segurança do formulário. Sempre ativos.</span></label>' +
      '<label class="check"><input type="checkbox" data-analytics> <span><strong>Analíticos</strong> Medem visita e origem, quando uma ferramenta for ligada. Hoje nenhuma ferramenta de terceiro entra sem esta chave.</span></label>' +
      '<label class="check"><input type="checkbox" data-marketing> <span><strong>Campanha</strong> Lembram interesse em conteúdo e lançamento. O pré-save da LP pede consentimento próprio, separado daqui.</span></label>' +
      '<div class="cookie-actions">' +
      '<button type="button" class="button button-small" data-cookie="save">Salvar</button>' +
      '<button type="button" class="button button-small button-ghost" data-cookie="reject">Só necessários</button>' +
      '<button type="button" class="text-button" data-cookie="close">Fechar</button>' +
      "</div></form></dialog>"
    );
  }

  function mount() {
    const holder = document.createElement("div");
    holder.innerHTML = bannerTemplate();
    document.body.append(holder);
    const banner = holder.querySelector("[data-cookie-banner]");
    const dialog = holder.querySelector("[data-cookie-dialog]");
    const analytics = dialog.querySelector("[data-analytics]");
    const marketing = dialog.querySelector("[data-marketing]");
    let lastFocus = null;

    function syncChecks() {
      const current = read();
      analytics.checked = Boolean(current && current.analytics);
      marketing.checked = Boolean(current && current.marketing);
    }

    function hideBanner() {
      banner.hidden = true;
    }

    function showBanner() {
      banner.hidden = false;
    }

    function openDialog() {
      lastFocus = document.activeElement;
      syncChecks();
      if (!dialog.open) {
        dialog.showModal();
      }
    }

    function closeDialog() {
      if (dialog.open) {
        dialog.close();
      }
      if (lastFocus && typeof lastFocus.focus === "function") {
        lastFocus.focus();
      }
    }

    function handle(action) {
      switch (action) {
        case "accept":
          write({ analytics: true, marketing: true });
          hideBanner();
          closeDialog();
          break;
        case "reject":
          write({ analytics: false, marketing: false });
          hideBanner();
          closeDialog();
          break;
        case "configure":
          openDialog();
          break;
        case "save":
          write({ analytics: analytics.checked, marketing: marketing.checked });
          hideBanner();
          closeDialog();
          break;
        case "close":
          closeDialog();
          break;
        default: {
          const unknown = action;
          console.error("Ação de cookie não tratada:", unknown);
        }
      }
    }

    document.addEventListener("click", function (event) {
      const trigger = event.target.closest("[data-cookie], [data-cookie-open]");
      if (!trigger) {
        return;
      }
      if (trigger.hasAttribute("data-cookie-open")) {
        event.preventDefault();
        openDialog();
        return;
      }
      const action = trigger.getAttribute("data-cookie");
      if (!action) {
        return;
      }
      event.preventDefault();
      handle(action);
    });

    dialog.addEventListener("cancel", function (event) {
      event.preventDefault();
      closeDialog();
    });

    const existing = read();
    if (existing) {
      apply(existing);
      hideBanner();
    } else {
      apply(null);
      showBanner();
    }

    window.DiplomataCookies = {
      read: read,
      write: write,
      open: openDialog
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
