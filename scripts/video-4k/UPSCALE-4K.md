# Pipeline 4K — clipes DJ Diplomata (Topaz + DaVinci)

Objetivo: sair dos MP4 em **720p gerados por IA** para **4K com cara de filmagem**, reduzindo o “filtro de IA” (pele plástica, borrão estranho, flicker no rosto).

## Clipes recomendados (ordem de prioridade)

| Prioridade | Arquivo | Uso sugerido | Proporção alvo 4K |
|------------|---------|--------------|-------------------|
| 1 | `img/club-live-mix-cinematic.mp4` | Close / detalhe / stories | **2160×2880** (3:4) |
| 2 | `img/club-pov-wide-cinematic.mp4` | Hero site / YouTube | **3840×2160** (16:9) |
| 3 | `img/club-crowd-shoulder-cinematic.mp4` | B-roll pista | **3840×2160** |
| 4 | `img/club-set-loop.mp4` | Só depois dos outros; costuma parecer mais IA | conforme uso |

Saída sugerida: `img/4k/` (o script cria essa pasta).

---

## Parte 1 — Instalar ferramentas (Windows)

### Topaz Video AI (recomendado para upscale + rosto)

1. Baixe em [topazlabs.com/topaz-video-ai](https://www.topazlabs.com/topaz-video-ai) e instale.
2. Faça login na conta Topaz (licença necessária para export em lote).
3. Caminho típico do CLI (se existir na sua versão):

   `C:\Program Files\Topaz Labs LLC\Topaz Video AI\tvai_up.exe`

   Se o CLI não existir, use só a interface — o fluxo da **Parte 2A** é o principal.

### FFmpeg (fallback / remux / compressão final)

No PowerShell (como administrador, se o winget pedir):

```powershell
winget install --id Gyan.FFmpeg -e --accept-source-agreements --accept-package-agreements
```

Feche e abra o terminal. Teste: `ffmpeg -version`.

### DaVinci Resolve (grátis — cor + grão + export)

1. [blackmagicdesign.com/products/davinciresolve](https://www.blackmagicdesign.com/products/davinciresolve)
2. Instale **Resolve** + **DaVinci Control Panels** (opcional).
3. Na primeira abertura: crie projeto **DJ Diplomata 4K**.

---

## Parte 2A — Topaz Video AI (interface) — configurações anti-IA

Repita para cada clipe da tabela acima.

### Passo a passo

1. **File → New project** (ou arraste o MP4 de `img/`).
2. **Output resolution**: escolha **4K** (ou custom: 3840×2160 ou 2160×2880 para o vertical).
3. **Frame rate**: mantenha o **mesmo FPS do original** (geralmente 24 ou 30). Não force 60 fps sem necessidade — interpolar frames pode aumentar artefatos de IA.
4. **Modelo de upscale** (Enhancement):
   - **Proteus** → preset **Fine Tune** ou **Default**.
   - Ajustes manuais (ponto de partida):
     - **Recover Detail**: 15–25 (não passar de 35)
     - **Reduce Noise**: 5–15 (valores altos = pele de borracha)
     - **Sharpen**: 5–10
     - **Fix Compression**: 10–20
   - Se o **rosto** distorcer no clipe: troque para **Iris** (Recover Face / Enhance Face moderado, 20–40).
5. **Não use** (na primeira exportação):
   - Slow motion / frame interpolation pesada (Apollo/Chronos alto)
   - Estabilização agressiva
   - “Auto” em tudo
6. **Preview** 2–3 segundos no rosto e nas mãos no mixer antes de renderizar o clipe inteiro.
7. **Export**: codec **H.265 (HEVC)** ou **ProRes 422 HQ** se for editar no DaVinci (ProRes = arquivo grande, melhor para correção).
8. Salve em `img/4k/` com sufixo `-topaz`, ex.: `club-live-mix-cinematic-topaz.mov`.

### Dica por clipe

- **club-live-mix**: Iris ou Proteus com Recover Detail baixo; priorize estabilidade do rosto.
- **club-pov-wide** / **shoulder**: Proteus; noise baixo; o público pode ficar mais soft — é natural.
- **club-set-loop**: Proteus + noise um pouco maior só se houver “crawling” na pele; senão regrave a partir de outro still.

---

## Parte 2B — Topaz via CLI (opcional)

Se `tvai_up.exe` existir após instalar o Topaz:

```powershell
cd "j:\area de trabalho\Fron_End\Projetos\Projeto-DJ-Diplomata"
.\scripts\video-4k\Invoke-TopazUpscale.ps1
```

Parâmetros e modelos variam por versão do Topaz; o script detecta o executável e mostra o comando base. Ajuste `-Model` conforme a documentação da sua versão.

---

## Parte 3 — DaVinci Resolve (acabamento cinematográfico)

### Configurar projeto

1. **File → Project Settings → Master Settings**
   - Timeline resolution: **3840×2160** (ou **2160×2880** para o clipe vertical).
   - Timeline frame rate: igual ao clipe.
2. **Import** os arquivos de `img/4k/*-topaz.mov` (ou `.mp4`).

### Cor (aba Color)

Para cada clipe, nó básico:

1. **Color Warper / Curves**: levemente **esmagar highlights** nos lasers (evita “neon de IA”).
2. **Contrast**: +5 a +10 no pivot médio; não estourar pele.
3. **Saturation**: −5 a −10 global; +5 só nos azuis se quiser manter identidade da boate.
4. **Film Grain** (OpenFX → Film Grain):
   - 35 mm, **intensidade 0,08–0,15**
   - Isso esconde micro-artefatos de IA sem suavizar demais.
5. **Evite**: Beauty/face smoothing, blur global, sharpening acima de 0,3 no nó final.

### Entrega (aba Deliver)

| Destino | Codec | Resolução | Bitrate / qualidade |
|---------|--------|-----------|---------------------|
| Site (hero) | H.265 | 3840×2160 | CBR ~35–45 Mbps ou VBR qualidade alta |
| Instagram/TikTok | H.265 | 2160×3840 | ~25–35 Mbps |
| Arquivo mestre | ProRes 422 HQ | 4K | máximo |

Nome final, ex.: `club-pov-wide-cinematic-4k-master.mp4` em `img/4k/`.

---

## Parte 4 — Script automático (FFmpeg fallback)

Se **ainda não** tiver Topaz, o FFmpeg só **aumenta pixels** (não recupera detalhe como IA do Topaz). Use só como prévia ou emergência:

```powershell
cd "j:\area de trabalho\Fron_End\Projetos\Projeto-DJ-Diplomata"
.\scripts\video-4k\Invoke-FfmpegUpscale.ps1
```

Depois que instalar o Topaz, **refaça** os mesmos clipes pela Parte 2A.

---

## Checklist rápido

- [ ] Topaz instalado e testado em 3 s de preview
- [ ] `club-live-mix-cinematic` exportado 2160×2880
- [ ] `club-pov-wide-cinematic` exportado 3840×2160
- [ ] DaVinci: grão leve + highlights controlados
- [ ] Export mestre em `img/4k/`
- [ ] Comparar lado a lado com o 720p original (rosto + dedos no mixer)

---

## Integrar no site (quando estiver satisfeito)

Troque referências em `index.html` / `paginas/lp.html` para o MP4 4K (ou versão 1080p derivada para web, se o peso for alto). Posso fazer essa troca no projeto quando você indicar qual arquivo virou o hero oficial.
