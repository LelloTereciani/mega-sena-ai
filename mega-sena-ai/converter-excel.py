import pandas as pd
import json
import sys

def ler_excel(caminho_arquivo):
    print(f"📊 Lendo Excel: {caminho_arquivo}")
    
    try:
        # Lê o Excel
        df = pd.read_excel(caminho_arquivo, sheet_name=0)
        
        print(f"✅ Total de linhas: {len(df)}")
        print(f"✅ Colunas encontradas: {list(df.columns)}")
        print(f"\n📋 Primeiras 5 linhas:")
        print(df.head())
        
        # Pega apenas as 8 primeiras colunas
        colunas = df.columns[:8]
        df_limpo = df[colunas]
        
        print(f"\n📋 Usando colunas: {list(colunas)}")
        print(f"\n📋 Dados das 5 primeiras linhas:")
        print(df_limpo.head())
        
        # Converte para JSON
        dados = []
        for index, row in df_limpo.iterrows():
            try:
                concurso = int(row.iloc[0])
                data = str(row.iloc[1]) if pd.notna(row.iloc[1]) else "Sem data"
                
                bolas = [
                    int(row.iloc[2]),
                    int(row.iloc[3]),
                    int(row.iloc[4]),
                    int(row.iloc[5]),
                    int(row.iloc[6]),
                    int(row.iloc[7])
                ]
                
                dados.append({
                    "contestNumber": concurso,
                    "date": data,
                    "numbers": sorted(bolas)
                })
                
                if index < 5:
                    print(f"\n🔸 Concurso {concurso}: Data={data}, Números={bolas}")
                    
            except Exception as e:
                print(f"⚠️ Erro na linha {index}: {e}")
                continue
        
        print(f"\n✅ Total de concursos processados: {len(dados)}")
        
        # Salva como JSON
        with open('mega-sena-dados.json', 'w', encoding='utf-8') as f:
            json.dump(dados, f, ensure_ascii=False, indent=2)
        
        print(f"✅ Arquivo JSON criado: mega-sena-dados.json")
        
        # Salva como CSV
        df_export = pd.DataFrame(dados)
        df_export.to_csv('mega-sena-dados.csv', index=False, sep='\t')
        print(f"✅ Arquivo CSV criado: mega-sena-dados.csv")
        
        # Salva como TXT
        with open('mega-sena-dados.txt', 'w', encoding='utf-8') as f:
            f.write("Concurso\tData\tBola1\tBola2\tBola3\tBola4\tBola5\tBola6\n")
            for d in dados:
                f.write(f"{d['contestNumber']}\t{d['date']}\t")
                f.write("\t".join(map(str, d['numbers'])))
                f.write("\n")
        
        print(f"✅ Arquivo TXT criado: mega-sena-dados.txt")
        
        return dados
        
    except Exception as e:
        print(f"❌ Erro ao ler Excel: {e}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    if len(sys.argv) > 1:
        caminho = sys.argv[1]
    else:
        # Procura o arquivo na pasta atual
        import os
        arquivos_xlsx = [f for f in os.listdir('.') if f.endswith('.xlsx')]
        
        if arquivos_xlsx:
            caminho = arquivos_xlsx[0]
            print(f"📂 Arquivo encontrado: {caminho}")
        else:
            print("❌ Nenhum arquivo .xlsx encontrado!")
            print("💡 Use: python3 converter-excel.py caminho/para/arquivo.xlsx")
            sys.exit(1)
    
    ler_excel(caminho)
