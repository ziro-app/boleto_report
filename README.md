# Relatório Duplicatas

## Objetivo
Este código tem como principal objetivo atualizar e cadastrar novas comissões no banco do firebase, o que é refletido diretamente para o [aplicativo dos fabricantes](http://fabricantes.ziro.app/).

## Processo
O processo consiste em algumas etapas e uma delas depende das informações abaixo, para compreender melhor entre no link do [fluxograma](https://drive.google.com/file/d/18s7p8RTNk_iKvBg9BJM5K-2gxTmSsdcb/view).

## Como Usar
### Configurações Iniciais
Obs: Os passos abaixos são para o rodar em sistema windows.
1. Git bash
    * Entrar no [site do gitbash](https://git-scm.com/downloads).
    * Selecionar embaixo de Dowloads o seu sistema utilizado.
2. Node.js
    * Entrar no [site do node](https://nodejs.org/en/)
    * De preferência baixa a versão mais estável, estara do lado esquerdo escrito que é a mais recomendada.
3. Yarn
    * Entre no [site do yarn](https://classic.yarnpkg.com/en/docs/install/#windows-stable)
    * Clique em Dowload Installer e instale o yarn
4. VsCode
    * Entrar no [site do vsCode](https://code.visualstudio.com/)
    * Baixar e instalar apertando no botão Dowload for Windows
5. Configurando o Projeto
    * Abra o gitbash e digite os comandos a baixo na mesma ordem (escreva cada um deles na linha de comando e aperte enter após escrever):
    ```
    $ cd Desktop
    $ mkdir Ziro
    $ git clone "https://github.com/ziro-app/boleto_report"
    $ cd boleto_report
    $ yarn install
    $ code .
    ```
    * Após esse último comando o vsCode sera aberto no arquivo do projeto.
6. Adicionando .env
    * Na linha escrito DUPLICATE_REPORT va com o mouse até achar um simbulo de um arquivo com um mais no canto esquerdo superior, clique nele
    * Após isso um arquivo será criado na aba abaixo, de o nome de *.env* para este arquivo.
    * Aperte enter e depois entre nesse arquivo clicando duas vezes com o botão esquerdo o copie as credênciais que serão mandadas para você.

### Rodando o Projeto
#### Novo fabricante
* Sempre verifique se esta na pasta certa do arquivo, para fazer isso digite pwd no gitbash e verifique o caminho que ele escreve abaixo do comando.
* Se estiver só utilize o comando:
    ```
    $ yarn pading 'nome fantasia'
    ```
* Se não estiver na pasta correta, tente navegar pelas pastas utilizando o comando cd, se tiver acabado de abrir o gitbash utilize os comandos a baixo:
    ```
    $ cd Desktop
    $ cd Ziro
    $ cd boleto_report
    ```
* Qualquer problema ou dúvida ou incerteza não tenha vergonha de entrar em contato comigo, Ahmad.

* Sempre confira a quantidade de boletos atualizadas e o valor, essas informações vão aparecer na tela, qualquer tipo de erro também aparecera na tela.

#### Atualizando Status
* Sempre lembre de verificar em que pasta seu terminal está operando, se tiver dúvida entre em contato.
* Se estiver na pasta correta basta digitar o comando:
    ```
    $ yarn update 'nome fantasia'
    ```
* Sempre confira a quantidade de boletos atualizadas e o valor, essas informações vão aparecer na tela, qualquer tipo de erro também aparecera na tela.


Dica: Não tenha medo de errar e perguntar, estamos aqui pra aprender juntos.