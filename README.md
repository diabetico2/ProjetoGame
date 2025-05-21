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
