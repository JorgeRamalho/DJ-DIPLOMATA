(function () {
  const cfg = window.DIPLOMATA;

  document.documentElement.classList.add("js");

  const header = document.querySelector("[data-header]");
  const toggle = document.querySelector("[data-nav-toggle]");
  const menu = document.querySelector("#menu");

  function setNav(open) {
    if (!toggle || !menu) {
      return;
    }
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    menu.classList.toggle("is-open", open);
    document.body.classList.toggle("nav-open", open);
  }

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      setNav(toggle.getAttribute("aria-expanded") !== "true");
    });
    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setNav(false);
      });
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      setNav(false);
    }
  });

  if (header) {
    const onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  const revealNodes = document.querySelectorAll("[data-reveal]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduceMotion && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16 }
    );
    revealNodes.forEach(function (node) {
      observer.observe(node);
    });
  } else {
    revealNodes.forEach(function (node) {
      node.classList.add("is-in");
    });
  }

  document.querySelectorAll("[data-whatsapp]").forEach(function (node) {
    if (!cfg.whatsapp) {
      return;
    }
    node.hidden = false;
    const text = node.getAttribute("data-whatsapp-text") || "";
    const base = "https://wa.me/" + cfg.whatsapp;
    node.href = text ? base + "?text=" + encodeURIComponent(text) : base;
  });

  document.querySelectorAll("[data-handle]").forEach(function (node) {
    const kind = node.getAttribute("data-handle");
    let handle = "";
    switch (kind) {
      case "instagram":
        handle = cfg.instagram;
        break;
      case "soundcloud":
        handle = cfg.soundcloud;
        break;
      case "spotify":
        handle = cfg.spotify;
        break;
      default: {
        const unknown = kind;
        console.error("Canal não tratado:", unknown);
        return;
      }
    }
    node.textContent = "@" + handle;
  });

  document.querySelectorAll("[data-email]").forEach(function (node) {
    node.textContent = cfg.bookingEmail;
    if (node.tagName === "A") {
      node.href = "mailto:" + cfg.bookingEmail;
    }
  });

  const filters = document.querySelectorAll("[data-filter]");
  const venues = document.querySelectorAll("[data-kind]");
  filters.forEach(function (button) {
    button.addEventListener("click", function () {
      const value = button.getAttribute("data-filter");
      filters.forEach(function (item) {
        item.setAttribute("aria-pressed", item === button ? "true" : "false");
      });
      venues.forEach(function (card) {
        const kind = card.getAttribute("data-kind");
        card.hidden = value !== "todas" && kind !== value;
      });
    });
  });

  function fieldError(field, message) {
    field.classList.add("is-invalid");
    const slot = field.querySelector(".error");
    if (slot) {
      slot.textContent = message;
    }
  }

  function clearField(field) {
    field.classList.remove("is-invalid");
    const slot = field.querySelector(".error");
    if (slot) {
      slot.textContent = "";
    }
  }

  function validEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  async function copyText(text, button) {
    try {
      await navigator.clipboard.writeText(text);
      const previous = button.textContent;
      button.textContent = "Copiado";
      window.setTimeout(function () {
        button.textContent = previous;
      }, 1600);
    } catch (error) {
      window.prompt("Copie o texto:", text);
    }
  }

  document.querySelectorAll("[data-print]").forEach(function (button) {
    button.addEventListener("click", function () {
      window.print();
    });
  });

  document.querySelectorAll("[data-copy]").forEach(function (button) {
    button.addEventListener("click", function () {
      const id = button.getAttribute("data-copy");
      const source = document.getElementById(id);
      const value = source ? source.textContent.trim() : button.getAttribute("data-copy-value") || "";
      copyText(value, button);
    });
  });

  document.querySelectorAll("[data-swatch]").forEach(function (button) {
    button.addEventListener("click", function () {
      copyText(button.getAttribute("data-swatch"), button);
    });
  });

  const booking = document.querySelector("[data-booking]");
  if (booking) {
    const status = booking.querySelector("[data-booking-status]");
    const panel = booking.querySelector("[data-booking-ready]");
    const briefNode = booking.querySelector("[data-brief]");
    const fields = {
      nome: booking.querySelector("#nome"),
      email: booking.querySelector("#email"),
      telefone: booking.querySelector("#telefone"),
      tipo: booking.querySelector("#tipo"),
      data: booking.querySelector("#data"),
      local: booking.querySelector("#local"),
      publico: booking.querySelector("#publico"),
      mensagem: booking.querySelector("#mensagem"),
      consent: booking.querySelector("#consent-booking")
    };

    try {
      const draft = JSON.parse(sessionStorage.getItem(cfg.draftKey) || "null");
      if (draft) {
        Object.keys(fields).forEach(function (key) {
          if (key === "consent" || !fields[key] || draft[key] == null) {
            return;
          }
          fields[key].value = draft[key];
        });
      }
    } catch (error) {
      sessionStorage.removeItem(cfg.draftKey);
    }

    booking.addEventListener("input", function () {
      const draft = {};
      Object.keys(fields).forEach(function (key) {
        if (key === "consent") {
          return;
        }
        draft[key] = fields[key].value;
      });
      sessionStorage.setItem(cfg.draftKey, JSON.stringify(draft));
    });

    booking.addEventListener("submit", function (event) {
      event.preventDefault();
      let valid = true;
      booking.querySelectorAll(".field, .check").forEach(clearField);

      if (fields.nome.value.trim().length < 2) {
        fieldError(fields.nome.closest(".field"), "Diga como a produção deve te chamar.");
        valid = false;
      }
      if (!validEmail(fields.email.value.trim())) {
        fieldError(fields.email.closest(".field"), "Precisa de um e-mail válido.");
        valid = false;
      }
      const phone = fields.telefone.value.replace(/\D/g, "");
      if (phone && phone.length < 10) {
        fieldError(fields.telefone.closest(".field"), "Telefone incompleto.");
        valid = false;
      }
      if (!fields.tipo.value) {
        fieldError(fields.tipo.closest(".field"), "Escolha o tipo de evento.");
        valid = false;
      }
      if (fields.mensagem.value.trim().length < 12) {
        fieldError(fields.mensagem.closest(".field"), "Conte a data, a casa e o horário em uma frase.");
        valid = false;
      }
      if (!fields.consent.checked) {
        fieldError(fields.consent.closest(".check"), "Autorize o contato para seguir.");
        valid = false;
      }
      if (!valid) {
        status.textContent = "Revise os campos marcados.";
        const firstInvalid = booking.querySelector(".is-invalid input, .is-invalid select, .is-invalid textarea");
        if (firstInvalid) {
          firstInvalid.focus();
        }
        return;
      }

      const brief = [
        "Pedido de booking — DJ Diplomata",
        "Nome: " + fields.nome.value.trim(),
        "E-mail: " + fields.email.value.trim(),
        "Telefone: " + (fields.telefone.value.trim() || "não informado"),
        "Tipo: " + fields.tipo.value,
        "Data: " + (fields.data.value || "a combinar"),
        "Local: " + (fields.local.value.trim() || "Curitiba"),
        "Público: " + (fields.publico.value.trim() || "não informado"),
        "",
        fields.mensagem.value.trim()
      ].join("\n");

      briefNode.textContent = brief;
      panel.hidden = false;
      status.textContent = "Pedido pronto. O e-mail ainda precisa ser enviado.";
      const mail = booking.querySelector("[data-open-mail]");
      const subject = "Booking DJ Diplomata — " + fields.tipo.value;
      mail.href = "mailto:" + cfg.bookingEmail + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(brief);
      panel.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
    });
  }

  const clubStage = document.querySelector("[data-club-loop]");
  if (clubStage && reduceMotion) {
    clubStage.querySelectorAll("video").forEach(function (video) {
      video.pause();
      video.querySelectorAll("source").forEach(function (source) {
        source.remove();
      });
      video.removeAttribute("src");
    });
  }

  if (clubStage && !reduceMotion) {
    const clips = Array.prototype.slice.call(clubStage.querySelectorAll("video"));
    const passSeconds = parseFloat(getComputedStyle(clubStage.parentElement).getPropertyValue("--pass")) || 0.65;
    const passMs = Math.round(passSeconds * 1000);
    let active = 0;
    let passing = false;
    let running = false;

    function clipAt(index) {
      return clips[index % clips.length];
    }

    function playClip(video) {
      const pending = video.play();
      if (pending && typeof pending.catch === "function") {
        pending.catch(function () {});
      }
    }

    function beginPass() {
      if (passing) {
        return;
      }
      const outgoing = clipAt(active);
      const incoming = clipAt(active + 1);
      passing = true;
      incoming.currentTime = 0;
      playClip(incoming);
      window.requestAnimationFrame(function () {
        incoming.classList.add("is-passing");
      });
      window.setTimeout(function () {
        outgoing.classList.remove("is-front");
        outgoing.pause();
        outgoing.currentTime = 0;
        incoming.classList.remove("is-passing");
        incoming.classList.add("is-front");
        active = (active + 1) % clips.length;
        passing = false;
      }, passMs);
    }

    function watch() {
      const video = clipAt(active);
      if (running && !passing && video.duration && video.currentTime >= video.duration - passSeconds) {
        beginPass();
      }
      window.requestAnimationFrame(watch);
    }

    clips.forEach(function (video) {
      video.muted = true;
      video.addEventListener("ended", function () {
        if (video === clipAt(active)) {
          beginPass();
        }
      });
    });

    const loopObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          running = entry.isIntersecting && !document.hidden;
          if (running) {
            playClip(clipAt(active));
            return;
          }
          clips.forEach(function (video) {
            video.pause();
          });
        });
      },
      { threshold: 0.2 }
    );
    loopObserver.observe(clubStage);
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        running = false;
        clips.forEach(function (video) {
          video.pause();
        });
        return;
      }
      if (clubStage.getBoundingClientRect().bottom > 0 && clubStage.getBoundingClientRect().top < window.innerHeight) {
        running = true;
        playClip(clipAt(active));
      }
    });
    window.requestAnimationFrame(watch);
  }
})();
