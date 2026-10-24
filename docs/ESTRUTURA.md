# Estrutura do projeto · DJ Diplomata

Site estático (HTML, CSS e JavaScript) com raiz enxuta para publicação e pastas por responsabilidade.

## Visão geral

```
Projeto-DJ-Diplomata/
├── index.html              # Única página de conteúdo na raiz (home)
├── 404.html                # Página de erro (exigida na raiz pelo Netlify)
├── netlify.toml            # Deploy, rewrites de meta/SEO e redirects legados
├── README.md               # Entrada rápida do repositório
│
├── paginas/                # Demais páginas HTML do site
│   ├── lp.html
│   ├── imprensa.html
│   ├── privacidade.html
│   └── campanhas.html
│
├── meta/                   # SEO e PWA (servidos na raiz do domínio via netlify.toml)
│   ├── robots.txt
│   ├── sitemap.xml
│   └── site.webmanifest
│
├── css/
│   └── styles.css          # Folha de estilos global
│
├── js/
│   ├── config.js           # Canais, domínio, chaves LGPD (editar aqui)
│   ├── main.js             # Navegação, formulários, UI compartilhada
│   ├── cookies.js          # Banner e consentimento
│   └── lp.js               # Countdown e pré-save da LP
│
├── img/                    # Mídia publicada no site
│   ├── arquivo/            # Acervo / rascunhos de arte
│   ├── fonte/              # Originais não referenciados diretamente no HTML
│   ├── placas/             # Peças de campanha (placas)
│   ├── *.svg               # Marca e favicon
│   └── *.jpg, *.png, *.mp4 # Fotos e vídeos do site
│
├── docs/                   # Documentação do projeto (não vai ao ar)
│   └── ESTRUTURA.md        # Este arquivo
│
├── scripts/                # Automação local (não publicada)
│   └── video-4k/           # Pipeline FFmpeg / Topaz
│
└── .vscode/
    └── settings.json       # Porta do Live Server local
```

## Regras de organização

| O quê | Onde | Observação |
|--------|------|------------|
| Home do site | `index.html` na raiz | URL `/` |
| Outras rotas | `paginas/*.html` | URLs `/paginas/nome.html` |
| Estilos | `css/` | Um arquivo global por enquanto |
| Scripts do site | `js/` | `config.js` é o único ponto de “liga/desliga” de canais |
| Imagens no ar | `img/` | Caminhos no HTML: `/img/...` |
| Originais / backup de mídia | `img/fonte/` ou `img/arquivo/` | Não linkar no HTML se não for para o público |
| Robots, sitemap, manifest | `meta/` | Expostos como `/robots.txt`, `/sitemap.xml`, `/site.webmanifest` |
| Ferramentas de build | `scripts/` | Fora do fluxo do visitante |
| Documentação | `docs/` | Estrutura, processos, notas internas |

## URLs e compatibilidade

- **Canônicas atuais:** `https://djdiplomata.com.br/paginas/<página>.html` (exceto a home em `/`).
- **Redirects 301** em `netlify.toml` mantêm links antigos (`/lp.html`, `/imprensa.html`, etc.) funcionando.
- **Links internos:** páginas em `paginas/` usam caminhos absolutos (`/css/`, `/js/`, `/img/`) para não depender da profundidade da pasta.

## Desenvolvimento local

1. Abra a pasta do projeto no editor.
2. Sirva a raiz com um servidor estático (Live Server na porta `5502`, conforme `.vscode/settings.json`, ou `npx serve .`).
3. Acesse `http://localhost:<porta>/` — rewrites do Netlify (`/site.webmanifest`, etc.) só existem em produção; em local use `/meta/site.webmanifest` se precisar testar o manifest.

## Deploy (Netlify)

- **Publish directory:** raiz do repositório (`.`), configurado em `netlify.toml`.
- **404:** arquivo `404.html` na raiz (limitação da plataforma; não mover para `paginas/`).
- Após alterar `meta/sitemap.xml`, atualize `<lastmod>` nas URLs que mudaram.

## Checklist ao criar uma página nova

1. Adicionar `paginas/nova-pagina.html` com links `/css/`, `/js/`, `/img/`.
2. Incluir a URL em `meta/sitemap.xml`.
3. Linkar a partir de `index.html` ou do menu das outras páginas.
4. Se substituir uma URL antiga na raiz, adicionar redirect 301 em `netlify.toml`.

## Referência rápida por arquivo (`paginas/`)

| Arquivo | Função |
|---------|--------|
| `lp.html` | Landing da LP *Protocolo*, countdown, pré-save |
| `imprensa.html` | Press kit: bio, logos, fotos, rider |
| `privacidade.html` | LGPD e cookies |
| `campanhas.html` | Posicionamento e plano de campanha (uso interno / time) |
