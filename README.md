# Pez MCP Server

Un MCP server personale che espone la mia expertise professionale come Brand & Communication Strategist. Collegalo a qualsiasi LLM compatibile con MCP e ottieni un'anteprima di come penso, che framework uso e come affronterei le tue sfide strategiche.

## Cos'è

Questo è un server [Model Context Protocol](https://modelcontextprotocol.io/) che gira su Cloudflare Workers.

Quando lo colleghi a un assistente AI come Claude, l'assistente ottiene accesso al mio profilo professionale, ai miei framework strategici, alla mia esperienza e alla mia carriera completa — e può simulare una conversazione di consulenza usando la mia metodologia.

Pensalo come un "assaggio strategico": fai una domanda, e l'AI risponde usando i miei framework e la mia esperienza come contesto.

## Come è stato costruito

La knowledge base non è stata scritta a mano. Ho costruito un'**interfaccia web di intervista** (`interview/index.html`) — un questionario strutturato in 8 sezioni e 51 domande che copre identità, filosofia, framework per ogni dominio, esperienze, AI e contatto.

Ho risposto a tutte le domande. Le risposte sono state poi compilate nei file JSON strutturati che alimentano il server. Questo approccio garantisce che i dati riflettano il mio modo di pensare e parlare, non un template generico.

I dati sulla carriera sono stati integrati dal mio profilo LinkedIn.

## Tool disponibili

| Tool | Descrizione |
|------|-------------|
| `get_profile` | Chi sono — background, aree di expertise, filosofia professionale |
| `get_frameworks` | Come penso — framework strategici e metodologie (filtrabile per dominio) |
| `get_experience` | Cosa ho fatto — track record e risultati (filtrabile per dominio) |
| `get_career` | La mia carriera — timeline completa, education, lingue, clienti notabili |
| `consult` | Chiedi a Pez — fornisci un brief e ottieni una risposta strategica strutturata |
| `get_contact` | Come contattarmi — info e opzioni di ingaggio |

### Domini

Framework e experience sono organizzati in 4 domini:
- **brand_positioning** — posizionamento e identità di brand
- **communication_planning** — piani di comunicazione
- **content_strategy** — strategia dei contenuti
- **ai_strategy** — adozione e strategia AI nel business

## Come collegarlo

### Claude Desktop

Aggiungi questo alla config di Claude Desktop (`~/Library/Application Support/Claude/claude_desktop_config.json` su macOS):

```json
{
  "mcpServers": {
    "pez": {
      "url": "https://mcp.pezbot.it"
    }
  }
}
```

### Claude Code (CLI)

```bash
claude mcp add pez --transport streamable-http https://mcp.pezbot.it
```

### Altri client MCP

Qualsiasi client MCP con supporto Streamable HTTP:

```
https://mcp.pezbot.it
```

## Prompt di esempio

Una volta collegato, prova a chiedere:

- **Conosci Pez:** "Chi è Pez e cosa fa?"
- **Esplora i framework:** "Che framework usa Pez per il brand positioning?"
- **Consulenza strategica:** "Sto lanciando un SaaS B2B nel mercato italiano. Lo spazio ha due player dominanti. Come dovrei approcciare il posizionamento?"
- **Carriera:** "Raccontami la carriera di Pez — dove ha lavorato e cosa ha costruito?"
- **Contatto:** "Vorrei lavorare con Pez. Quali sono le opzioni?"

## Struttura del progetto

```
pez-mcp-server/
├── src/
│   ├── index.ts                # Entry point, Cloudflare Worker handler
│   ├── tools/
│   │   ├── get-profile.ts      # Chi sono
│   │   ├── get-frameworks.ts   # Come penso
│   │   ├── get-experience.ts   # Cosa ho fatto
│   │   ├── get-career.ts       # La mia carriera
│   │   ├── consult.ts          # Chiedi a Pez (il tool principale)
│   │   └── get-contact.ts      # Come contattarmi
│   └── data/
│       ├── profile.json        # Bio, expertise, filosofia
│       ├── frameworks.json     # Framework per dominio
│       ├── experience.json     # Case study per dominio
│       ├── career.json         # Timeline carriera, education, lingue
│       └── contact.json        # Contatti e opzioni di ingaggio
├── interview/
│   └── index.html              # Interfaccia di intervista per knowledge mapping
├── wrangler.toml               # Config Cloudflare Workers
├── tsconfig.json
├── CLAUDE.md                   # Istruzioni per Claude Code
└── README.md
```

## Work in progress

Questo progetto è in continua evoluzione. Ho in mente di aggiungere altre funzionalità — più framework, più case study, tool più sofisticati — e non escludo di trasformarlo in un prodotto SaaS aperto a tutti per creare i propri digital twin interrogabili via LLM.

Se l'idea ti incuriosisce, scrivimi.

## Development

```bash
npm install
npm run dev          # Dev locale → http://localhost:8787
npm run deploy       # Deploy su Cloudflare Workers
npm run typecheck    # Verifica TypeScript
```
