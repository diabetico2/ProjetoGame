# Backend do Jogo

API backend desenvolvida em Node.js com TypeScript, Express e Prisma ORM para gerenciamento de usuários, partidas e rankings.

## Configuração Inicial

1. Instale as dependências:
```bash
npm install
```

2. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

O servidor iniciará na porta 3000.

## Socket.IO - Eventos em Tempo Real

O jogo utiliza Socket.IO para comunicação em tempo real entre o cliente e o servidor.

### Eventos Disponíveis

#### 1. Posição do Player
- **Evento**: `player:position`
- **Dados**:
```typescript
{
  x: number,  // Posição X do player
  y: number   // Posição Y do player
}
```
- **Resposta** (broadcast): `player:position:update`
```typescript
{
  id: string,        // ID do socket do player
  position: {
    x: number,
    y: number
  }
}
```

#### 2. Posição do Inimigo
- **Evento**: `enemy:position`
- **Dados**:
```typescript
{
  enemyId: string,   // ID do inimigo
  position: {
    x: number,
    y: number
  }
}
```
- **Resposta** (broadcast): `enemy:position:update`
```typescript
{
  id: string,        // ID do inimigo
  position: {
    x: number,
    y: number
  }
}
```

#### 3. Detecção de Colisão
- **Evento**: `collision:detect`
- **Dados**:
```typescript
{
  playerId: string,          // ID do socket do player
  enemyId: string,           // ID do inimigo
  playerPosition: {
    x: number,
    y: number
  },
  enemyPosition: {
    x: number,
    y: number
  },
  timestamp: number          // Timestamp da colisão
}
```
- **Respostas**:
  1. `collision:validate` (para o emissor)
  ```typescript
  {
    collisionId: string,     // ID único da colisão
    isValid: boolean        // true se a colisão for válida
  }
  ```
  2. `collision:confirmed` (broadcast, apenas para colisões válidas)
  ```typescript
  {
    // Dados completos da colisão
  }
  ```

### Validação de Colisões

O servidor valida as colisões considerando:
- Distância entre os objetos (limite padrão: 50 pixels)
- Tolerância de posição para latência (5 pixels)
- Existência dos objetos no estado do jogo

### Exemplo de Uso (Cliente)

```javascript
// Conectar ao servidor
const socket = io('http://localhost:3000');

// Enviar posição do player
socket.emit('player:position', { x: 100, y: 200 });

// Enviar posição do inimigo
socket.emit('enemy:position', {
  enemyId: 'enemy-1',
  position: { x: 150, y: 250 }
});

// Reportar colisão
socket.emit('collision:detect', {
  playerId: socket.id,
  enemyId: 'enemy-1',
  playerPosition: { x: 100, y: 200 },
  enemyPosition: { x: 150, y: 250 },
  timestamp: Date.now()
});

// Receber atualizações
socket.on('player:position:update', (data) => {
  // Atualizar posição de outros players
});

socket.on('enemy:position:update', (data) => {
  // Atualizar posição dos inimigos
});

socket.on('collision:validate', (result) => {
  if (result.isValid) {
    // Tratar colisão válida
  }
});

socket.on('collision:confirmed', (collision) => {
  // Tratar colisão confirmada
});
```

## Endpoints Disponíveis

### Usuários

#### 1. Criar Usuário
- **Método**: POST
- **URL**: `http://localhost:3000/api/users`
- **Headers**: 
  - Content-Type: application/json
- **Body** (raw JSON):
```json
{
    "name": "João"
}
```
- **Resposta**:
```json
{
    "user": {
        "id": 1,
        "name": "João",
        "createdAt": "2024-03-21T...",
        "updatedAt": "2024-03-21T..."
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### 2. Obter Informações do Usuário
- **Método**: GET
- **URL**: `http://localhost:3000/api/users/me`
- **Headers**: 
  - Authorization: Bearer {token}
- **Resposta**:
```json
{
    "user": {
        "id": 1,
        "name": "João",
        "createdAt": "2024-03-21T...",
        "updatedAt": "2024-03-21T..."
    }
}
```

### Partidas e Rankings

#### 1. Criar Nova Partida
- **Método**: POST
- **URL**: `http://localhost:3000/api/matches`
- **Headers**: 
  - Content-Type: application/json
  - Authorization: Bearer {token}
- **Body** (raw JSON):
```json
{
    "score": 1000
}
```
- **Resposta**:
```json
{
    "id": 1,
    "score": 1000,
    "playedAt": "2024-03-21T...",
    "userId": 1,
    "createdAt": "2024-03-21T...",
    "updatedAt": "2024-03-21T..."
}
```

#### 2. Ranking Diário
- **Método**: GET
- **URL**: `http://localhost:3000/api/matches/ranking/daily`
- **Query Parameters** (opcional):
  - date: DD/MM/YYYY (se não fornecido, usa a data atual)
- **Resposta**:
```json
{
    "data": "21/03/2024",
    "ranking": [
        {
            "posicao": 1,
            "nomeJogador": "João",
            "pontuacao": 1000,
            "horario": "14:30:00"
        }
    ]
}
```

#### 3. Ranking Geral
- **Método**: GET
- **URL**: `http://localhost:3000/api/matches/ranking/overall`
- **Resposta**:
```json
[
    {
        "posicao": 1,
        "idJogador": 1,
        "nome": "João",
        "melhorPontuacao": 1000,
        "dataPartida": "21/03/2024"
    }
]
```

#### 4. Histórico de Partidas do Jogador
- **Método**: GET
- **URL**: `http://localhost:3000/api/matches/history/{userId}`
- **Resposta**:
```json
[
    {
        "id": 1,
        "pontuacao": 1000,
        "dataHora": "21/03/2024 14:30:00",
        "idJogador": 1
    }
]
```

#### 5. Top 10 Partidas do Jogador
- **Método**: GET
- **URL**: `http://localhost:3000/api/matches/top/{userId}`
- **Resposta**:
```json
[
    {
        "posicao": 1,
        "id": 1,
        "pontuacao": 1000,
        "dataHora": "21/03/2024 14:30:00",
        "idJogador": 1
    }
]
```

## Cenários de Teste

1. **Criar Novo Usuário**
   - Envie uma requisição POST com um nome
   - Você receberá os dados do usuário e um token JWT

2. **Criar Usuário Existente**
   - Envie uma requisição POST com um nome que já existe
   - Você receberá os dados do usuário existente e um novo token

3. **Acessar Rota Protegida sem Token**
   - Tente acessar `/api/users/me` sem o header Authorization
   - Você receberá um erro 401 (Não autorizado)

4. **Acessar Rota Protegida com Token Inválido**
   - Tente acessar `/api/users/me` com um token inválido
   - Você receberá um erro 403 (Proibido)

5. **Criar Usuário sem Nome**
   - Envie uma requisição POST sem o campo name
   - Você receberá um erro 400 (Requisição inválida)

## Códigos de Erro

- 200: Sucesso
- 201: Criado com sucesso
- 400: Requisição inválida (ex: dados obrigatórios faltando)
- 401: Não autorizado (token não fornecido)
- 403: Proibido (token inválido)
- 404: Não encontrado
- 500: Erro interno do servidor
