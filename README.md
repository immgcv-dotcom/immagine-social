# Immagine Social

Painel de planejamento, edição e aprovação de conteúdo da Immagine Comunicação Visual.

## Estrutura gratuita

- GitHub Pages: hospedagem do front-end
- Supabase Free: autenticação, banco de dados e biblioteca de arquivos
- Sem API paga de IA
- Sem Lovable em produção
- Aprovação separada de publicação/agendamento

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


## Regra operacional

A semana de revisão ativa é 28/09/2026 a 02/10/2026. A semana 21–25/09 permanece como histórico. O sistema não inventa uma nova identidade visual quando a matriz aprovada não estiver disponível: os slots ficam pendentes até a arte oficial ser cadastrada.

A aprovação registra a decisão no Supabase, mas não dispara Buffer, IA paga ou qualquer serviço externo. A edição do calendário, textos, imagens e aprovações funciona com o próprio front-end e Supabase.
