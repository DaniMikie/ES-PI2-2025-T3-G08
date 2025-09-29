import os 

comando_base = "gp -u origin feature/"

lista_branches = ["autenticação", "gerenciamento", "cadastro", "criar-componente-nota", "apontar-nota", 
                  "painel-auditoria", "calculo-notas", "colunas-finais-ajustadas", "exportação-notas"]

caminho_arquivo = os.path.expanduser("/home/pedro/ES-PI2-2025-T3-G08/commit_inicial.sh")

with open(caminho_arquivo, "w", encoding="utf-8") as arquivo: 
    arquivo.write("#!/bin/bash\n\n")
    arquivo.write("set -e # Parar se algum comando falhar\n\n")
    
    for branch in lista_branches:
        comando = comando_base + branch 
        
        arquivo.write(f"git checkout feature/{branch}\n")
        arquivo.write(f"git push -u origin feature/{branch}\n")
        arquivo.write(f"g checkout feature/{branch}\n")
    
    arquivo.write("gco main")
    
    os.chmod(caminho_arquivo, 0o755)
    
print(f"Script 'commit_inicial.sh' criado com sucesso! Salvo em: {os.path.abspath(caminho_arquivo)}")


        