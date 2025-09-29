#!/bin/bash

set -e # Parar se algum comando falhar

echo 'Criando branch: feature/autenticação...
gcb feature/autenticação
git commit --allow-empty -m 'Commit inicial'
git push -u origin feature/autenticação

echo 'Criando branch: feature/gerenciamento...
gcb feature/gerenciamento
git commit --allow-empty -m 'Commit inicial'
git push -u origin feature/gerenciamento

echo 'Criando branch: feature/cadastro...
gcb feature/cadastro
git commit --allow-empty -m 'Commit inicial'
git push -u origin feature/cadastro

echo 'Criando branch: feature/criar-componente-nota...
gcb feature/criar-componente-nota
git commit --allow-empty -m 'Commit inicial'
git push -u origin feature/criar-componente-nota

echo 'Criando branch: feature/apontar-nota...
gcb feature/apontar-nota
git commit --allow-empty -m 'Commit inicial'
git push -u origin feature/apontar-nota

echo 'Criando branch: feature/painel-auditoria...
gcb feature/painel-auditoria
git commit --allow-empty -m 'Commit inicial'
git push -u origin feature/painel-auditoria

echo 'Criando branch: feature/calculo-notas...
gcb feature/calculo-notas
git commit --allow-empty -m 'Commit inicial'
git push -u origin feature/calculo-notas

echo 'Criando branch: feature/colunas-finais-ajustadas...
gcb feature/colunas-finais-ajustadas
git commit --allow-empty -m 'Commit inicial'
git push -u origin feature/colunas-finais-ajustadas

echo 'Criando branch: feature/exportação-notas...
gcb feature/exportação-notas
git commit --allow-empty -m 'Commit inicial'
git push -u origin feature/exportação-notas

git checkout main
