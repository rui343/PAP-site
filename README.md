# MAIA

Website estático para gestão e monitorização de apiários. O ficheiro de entrada é `index.html`; pode ser publicado no GitHub Pages. A autenticação carrega o SDK Firebase a partir da Internet.

## Utilização

1. Publica `index.html`, `styles.css` e `app.js` no GitHub Pages.
2. Configura o Firebase seguindo a secção abaixo e abre o URL publicado. A autenticação através de módulos JavaScript não funciona ao abrir o HTML diretamente por `file://`.
3. Entra no painel e regista as colmeias com os identificadores que serão usados pela fonte de medições.
4. Em **Definições**, escolhe o tema, configura o endereço da API e o endereço do stream da ESP32-CAM.
5. Regista visitas e tarefas. As fotografias adicionadas na página da câmara ficam associadas à colmeia e guardadas localmente.

Os registos de gestão e as medições recebidas ficam no armazenamento local do navegador. Não existe sincronização entre navegadores ou dispositivos nesta versão. Exporta cópias de segurança em **Definições**.

## Ativar contas de utilizador

1. Cria um projeto Firebase e regista uma aplicação **Web**.
2. Em **Authentication → Sign-in method**, ativa **Email/Password**.
3. Em **Authentication → Settings → Authorized domains**, adiciona `rui343.github.io`.
4. Copia `apiKey`, `authDomain`, `projectId` e `appId` da configuração da aplicação Web para o objeto `firebaseConfig` no início de `app.js`.
5. Carrega a versão atualizada de `app.js` e `index.html` para o repositório. Os utilizadores podem então criar conta, confirmar o email, entrar e recuperar a palavra-passe.

A configuração Web do Firebase é própria para código público. Nunca coloques uma chave de conta de serviço ou outra credencial privada neste repositório.

As contas são geridas pelo Firebase Auth. Os dados de colmeias, visitas, tarefas, medições e fotografias continuam guardados localmente, separados por utilizador neste navegador; não são sincronizados entre dispositivos.

## Contrato da API de medições

A MAIA consulta o endereço configurado no intervalo escolhido pelo apicultor. A resposta tem de ser JSON e a API tem de permitir pedidos do domínio do site através de CORS. Cada `hiveId` deve corresponder ao identificador registado na MAIA.

```json
{
  "measurements": [
    {
      "hiveId": "COL-01",
      "measuredAt": "2026-11-05T12:30:00Z",
      "dht11": [
        { "temperature": null, "humidity": null },
        { "temperature": null, "humidity": null }
      ],
      "dht22": { "temperature": null, "humidity": null },
      "weightKg": null
    }
  ]
}
```

Substitui `null` por números lidos pelos sensores. Na ficha de cada colmeia, a temperatura exterior é a média dos dois DHT11 e a temperatura interior do DHT22 aparece separadamente. A humidade média usa as leituras de humidade disponíveis. O `measuredAt` deve indicar a data/hora da leitura para impedir que cada consulta repetida seja guardada como uma medição nova.

## ESP32-CAM

Configura um URL que devolva um stream compatível com `<img>`, normalmente MJPEG, ou uma imagem JPEG. O caminho e a porta dependem do firmware e do modelo da placa; a aplicação não assume que a câmara já esteja ligada. A galeria de fotografias guarda imagens escolhidas pelo utilizador neste navegador.

## Arquitetura e limites atuais

- O Arduino Uno não publica dados na rede por si só. É necessário um gateway ou firmware que envie as leituras para a API configurada.
- O stream da câmara depende do firmware da ESP32-CAM e da acessibilidade do URL pelo navegador.
- O GitHub Pages serve HTML, CSS e JavaScript estáticos; não é uma base de dados nem um servidor de API. Para sincronizar dispositivos, acrescenta um backend/base de dados online e aponta a MAIA para a respetiva API.
- Um site GitHub Pages usa HTTPS. Para aceder a uma ESP32 que só disponibilize HTTP na rede local, pode ser necessário servir a interface também na rede local ou usar um gateway/proxy HTTPS compatível.
- A deteção de vespas e traças e a instalação PWA ainda não estão implementadas. A aplicação está organizada em ficheiros separados para permitir essa evolução.

## Publicação no GitHub Pages

Publica o conteúdo desta pasta como a raiz do site (ou copia os três ficheiros da aplicação para a raiz do repositório) e ativa o GitHub Pages na branch/pasta escolhida. Não são necessárias chaves nem serviços de terceiros para a interface local.
