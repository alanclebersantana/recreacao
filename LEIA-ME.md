# Recreação · Congregação Sul de Marialva

Jogo de perguntas bíblicas sincronizado entre celulares (GitHub Pages + Firebase Realtime Database).

## Arquivos

| Arquivo | Para que serve |
|---|---|
| `index.html` | Tela dos **participantes** (link que vai no WhatsApp) |
| `anfitriao.html` | Tela do **anfitrião**: abre a sala, conduz o jogo e edita temas e perguntas |
| `config.js` | Dados do seu projeto Firebase (preencher) |
| `comum.js` / `estilo.css` | Código e visual compartilhados pelas duas telas |
| `manifest.json` / `icon.svg` | Instalação como app (PWA) |

## 1. Firebase

1. Acesse https://console.firebase.google.com e crie um projeto (ou use um existente).
2. **Criação → Realtime Database → Criar banco de dados** (pode escolher "modo bloqueado").
3. Na aba **Regras** do Realtime Database, cole e publique:

```json
{
  "rules": {
    "recreacao": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

4. **Criação → Authentication → Começar → Método de login → Anônimo → Ativar.**
5. **Configurações do projeto (engrenagem) → Seus apps → Web (`</>`)** → registre o app e copie o objeto `firebaseConfig`.
6. Cole os valores no `config.js`. Confira se o `databaseURL` está preenchido (fica no topo da página do Realtime Database).

## 2. GitHub Pages

1. Crie um repositório (ex.: `recreacao`) e envie **todos** os arquivos desta pasta.
2. **Settings → Pages → Branch: main / root → Save.**
3. Os links ficam assim:
   - Participantes: `https://SEU-USUARIO.github.io/recreacao/`
   - Anfitrião: `https://SEU-USUARIO.github.io/recreacao/anfitriao.html`

> Guarde o link do anfitrião só para você: quem abrir esse link consegue conduzir o jogo.

## 3. Como jogar

1. O anfitrião abre `anfitriao.html` e toca em **Abrir sala**.
2. Envia o link dos participantes (botão **WhatsApp** ou **Copiar**). Cada pessoa só digita o nome.
3. **Iniciar jogo**: cada sessão começa com a tela do tema; as perguntas de múltipla escolha têm cronômetro e pontuação (100 pts + até 50 de bônus por rapidez).
4. A cada 4 perguntas entra o **Livro Aberto**: a pergunta aparece para todos, o anfitrião escolhe ou sorteia até 4 pessoas, elas respondem em voz alta e o anfitrião toca em **👏 Salva de palmas**.
5. No fim aparece o **ranking** em todos os celulares.

Temas, cores, perguntas, respostas certas e tempos são editados em **✏️ Temas e perguntas** (salva sozinho; vale a partir da próxima partida).
