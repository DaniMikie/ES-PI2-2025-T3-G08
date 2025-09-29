#!/bin/bash

set -e # Parar se algum comando falhar

echo 'Criando branch: feature/autenticação...
git checkout -b feature/autenticação
git commit --allow-empty -m 'Commit inicial'
git push -u origin feature/autenticação

echo 'Criando branch: feature/gerenciamento...
git checkout -b feature/gerenciamento
git commit --allow-empty -m 'Commit inicial'
git push -u origin feature/gerenciamento

echo 'Criando branch: feature/cadastro...
git checkout -b feature/cadastro
git commit --allow-empty -m 'Commit inicial'
git push -u origin feature/cadastro

echo 'Criando branch: feature/criar-componente-nota...
git checkout -b feature/criar-componente-nota
git commit --allow-empty -m 'Commit inicial'
git push -u origin feature/criar-componente-nota

echo 'Criando branch: feature/apontar-nota...
git checkout -b feature/apontar-nota
git commit --allow-empty -m 'Commit inicial'
git push -u origin feature/apontar-nota

echo 'Criando branch: feature/painel-auditoria...
git checkout -b feature/painel-auditoria
git commit --allow-empty -m 'Commit inicial'
git push -u origin feature/painel-auditoria

echo 'Criando branch: feature/calculo-notas...
git checkout -b feature/calculo-notas
git commit --allow-empty -m 'Commit inicial'
git push -u origin feature/calculo-notas

echo 'Criando branch: feature/colunas-finais-ajustadas...
git checkout -b feature/colunas-finais-ajustadas
git commit --allow-empty -m 'Commit inicial'
git push -u origin feature/colunas-finais-ajustadas

echo 'Criando branch: feature/exportação-notas...
git checkout -b feature/exportação-notas
git commit --allow-empty -m 'Commit inicial'
git push -u origin feature/exportação-notas

git checkout main
