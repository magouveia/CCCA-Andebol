@echo off
echo ==============================================
echo  A atualizar a aplicacao CCCA Andebol...
echo ==============================================
echo.

echo 1. A remover o contentor antigo (se existir)...
docker rm -f ccca-app
echo.

echo 2. A compilar a nova imagem Docker...
docker build -t ccca-andebol .
echo.

echo 3. A arrancar o novo contentor na porta 3005...
docker run -d --name ccca-app --env-file .env -p 3005:3000 ccca-andebol
echo.

echo ==============================================
echo  Feito! A app esta a correr na porta 3005.
echo ==============================================
pause
