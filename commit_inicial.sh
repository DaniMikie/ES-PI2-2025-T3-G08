#!/bin/bash

set -e # Parar se algum comando falhar

gp -u origin feature/autenticação
gco feature/autenticação
gp -u origin feature/gerenciamento
gco feature/gerenciamento
gp -u origin feature/cadastro
gco feature/cadastro
gp -u origin feature/criar-componente-nota
gco feature/criar-componente-nota
gp -u origin feature/apontar-nota
gco feature/apontar-nota
gp -u origin feature/painel-auditoria
gco feature/painel-auditoria
gp -u origin feature/calculo-notas
gco feature/calculo-notas
gp -u origin feature/colunas-finais-ajustadas
gco feature/colunas-finais-ajustadas
gp -u origin feature/exportação-notas
gco feature/exportação-notas
gco main