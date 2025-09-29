#!/bin/bash

set -e # Parar se algum comando falhar

git checkout feature/autenticação
git push -u origin feature/autenticação
g checkout feature/autenticação
git checkout feature/gerenciamento
git push -u origin feature/gerenciamento
g checkout feature/gerenciamento
git checkout feature/cadastro
git push -u origin feature/cadastro
g checkout feature/cadastro
git checkout feature/criar-componente-nota
git push -u origin feature/criar-componente-nota
g checkout feature/criar-componente-nota
git checkout feature/apontar-nota
git push -u origin feature/apontar-nota
g checkout feature/apontar-nota
git checkout feature/painel-auditoria
git push -u origin feature/painel-auditoria
g checkout feature/painel-auditoria
git checkout feature/calculo-notas
git push -u origin feature/calculo-notas
g checkout feature/calculo-notas
git checkout feature/colunas-finais-ajustadas
git push -u origin feature/colunas-finais-ajustadas
g checkout feature/colunas-finais-ajustadas
git checkout feature/exportação-notas
git push -u origin feature/exportação-notas
g checkout feature/exportação-notas
gco main