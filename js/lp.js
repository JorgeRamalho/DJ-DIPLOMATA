(function () {
  const cfg = window.DIPLOMATA;
  const release = new Date(cfg.lpRelease);
  const start = new Date(cfg.campaignStart);
  const root = document.querySelector("[data-countdown]");
  const meter = document.querySelector("[data-campaign-meter]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let countdownDone = false;

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function renderCountdown() {
    if (!root || countdownDone) {
      return;
    }
    const diff = release.getTime() - Date.now();
    if (diff <= 0) {
      countdownDone = true;
      root.innerHTML = "<p class=\"count-live\">Protocolo está na rua.</p>";
      return;
    }
    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const units = { days: days, hours: pad(hours), minutes: pad(minutes), seconds: pad(seconds) };
    Object.keys(units).forEach(function (key) {
      const node = root.querySelector('[data-unit="' + key + '"]');
      if (node) {
        node.textContent = units[key];
      }
    });
  }

  function renderMeter() {
    if (!meter) {
      return;
    }
    const span = release.getTime() - start.getTime();
    const progress = span <= 0 ? 1 : (Date.now() - start.getTime()) / span;
    const value = Math.max(0, Math.min(100, Math.round(progress * 100)));
    meter.value = value;
    meter.textContent = value + "% da campanha até a data de rua";
  }

  renderCountdown();
  renderMeter();
  window.setInterval(function () {
    renderCountdown();
    renderMeter();
  }, 1000);

  const form = document.querySelector("[data-presave]");
  if (!form) {
    return;
  }
  const status = form.querySelector("[data-presave-status]");
  const panel = form.querySelector("[data-presave-ready]");
  const briefNode = form.querySelector("[data-presave-brief]");

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    form.querySelectorAll(".field, .check").forEach(function (field) {
      field.classList.remove("is-invalid");
      const slot = field.querySelector(".error");
      if (slot) {
        slot.textContent = "";
      }
    });

    const nome = form.querySelector("#pre-nome");
    const email = form.querySelector("#pre-email");
    const consent = form.querySelector("#consent-presave");
    const platforms = Array.from(form.querySelectorAll('input[name="plataforma"]:checked')).map(function (input) {
      return input.value;
    });
    let valid = true;

    function fail(input, message) {
      const field = input.closest(".field, .check");
      field.classList.add("is-invalid");
      const slot = field.querySelector(".error");
      if (slot) {
        slot.textContent = message;
      }
      valid = false;
    }

    if (nome.value.trim().length < 2) {
      fail(nome, "Como devemos te chamar?");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      fail(email, "E-mail inválido.");
    }
    if (!platforms.length) {
      fail(form.querySelector('input[name="plataforma"]'), "Escolha ao menos um canal.");
    }
    if (!consent.checked) {
      fail(consent, "O pré-save precisa desta autorização.");
    }
    if (!valid) {
      status.textContent = "Faltam dados para montar o pré-save.";
      return;
    }

    const record = {
      nome: nome.value.trim(),
      email: email.value.trim(),
      plataformas: platforms,
      lp: cfg.lpTitle,
      quando: new Date().toISOString()
    };
    const list = JSON.parse(localStorage.getItem(cfg.presaveKey) || "[]");
    list.push(record);
    localStorage.setItem(cfg.presaveKey, JSON.stringify(list));

    const brief = [
      "Pré-save — " + cfg.lpTitle + " — DJ Diplomata",
      "Nome: " + record.nome,
      "E-mail: " + record.email,
      "Canais: " + platforms.join(", "),
      "Quero saber quando a LP entrar no ar, em 4 de dezembro de 2026."
    ].join("\n");
    briefNode.textContent = brief;
    panel.hidden = false;
    status.textContent = "Intenção registrada neste navegador. Envie o e-mail para a produção receber.";
    const mail = form.querySelector("[data-presave-mail]");
    mail.href = "mailto:" + cfg.bookingEmail + "?subject=" + encodeURIComponent("Pré-save Protocolo") + "&body=" + encodeURIComponent(brief);
    const submit = form.querySelector('button[type="submit"]');
    if (submit) {
      submit.disabled = true;
    }
    panel.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
  });

  const share = document.querySelector("[data-share]");
  if (share) {
    share.addEventListener("click", async function () {
      const url = window.location.href;
      const payload = {
        title: "Protocolo — DJ Diplomata",
        text: "LP Protocolo, de DJ Diplomata. 4 de dezembro, 23h. Curitiba.",
        url: url
      };
      if (navigator.share) {
        try {
          await navigator.share(payload);
          return;
        } catch (error) {
          if (error && error.name === "AbortError") {
            return;
          }
        }
      }
      try {
        await navigator.clipboard.writeText(payload.text + " " + url);
        share.textContent = "Link copiado";
      } catch (error) {
        window.prompt("Copie o link:", url);
      }
    });
  }
})();
