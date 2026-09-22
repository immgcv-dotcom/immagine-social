# Immagine Social

Painel de planejamento, edição e aprovação de conteúdo da Immagine Comunicação Visual.

## Estrutura gratuita

- GitHub Pages: hospedagem do front-end
- Supabase Free: autenticação, banco de dados e biblioteca de arquivos
- Sem API paga de IA
- Sem publicação automática antes da aprovação explícita

## Funcionalidades

- Dashboard da semana atual
- Calendário de segunda a sexta
- Edição individual de cada publicação
- Alteração da semana toda em uma única janela
- Aprovação e retorno para edição
- Biblioteca de imagens com upload para Supabase Storage
- Histórico e duplicação de semana
- Configurações da marca
- Persistência online no Supabase
- Login por e-mail e senha

## Publicação no GitHub Pages

O workflow em `.github/workflows/deploy.yml` publica automaticamente o site quando houver push na branch `main`.

No GitHub, abra **Settings > Pages** e selecione **GitHub Actions** como fonte de publicação, caso ainda não esteja habilitado.

## Supabase

Projeto: `immagine-social`
Região: `sa-east-1`

O front-end usa somente a chave pública (publishable key). Nenhuma chave secreta é armazenada no repositório.
