const axios = require('axios')
const arrayObject = require('@ziro/array-object')
const { db } = require('./firebase/index')

require('dotenv').config()

const sendFirebase = async (razao) => {
    if(razao){
        const config = {
            method: 'GET',
            url: process.env.SHEET_URL,
            data: {
                apiResource: 'values',
                apiMethod: 'batchGet',
                spreadsheetId: process.env.SHEET_ID_CHARGE,
                ranges: ['Boletos!A:L']
            },  
            headers: {
                'Authorization': process.env.SHEET_TOKEN,
                'Content-Type': 'application/json',
                'Origin': 'https://ziro.app'
            }
        }
        try {
            const result = await axios(config)
            const filtrado = arrayObject(result.data.valueRanges[0]).filter(item => item.fornecedor === razao)
            if(filtrado[0]){
                const arrayReceitas = filtrado.map((item) => {
                    if(typeof item.receita === 'number'){
                        return item.receita
                    }else{
                        return Number(item.receita.replace('.','').replace(',','.'))
                    }
                })
                const totalReceitas = arrayReceitas.reduce((a,b) => a+b)
                const obj = {
                    status: 'Comissões em Aberto',
                    fantasia: razao.toUpperCase(),
                    billets:filtrado
                }
                await db.collection('pending-commission').doc(razao).set(obj)
                console.log('Boletos', filtrado)
                console.log('\x1b[32m%s\x1b[0m',`Dados do fabricante ${razao} enviados com sucesso`)
                console.log('\x1b[32m%s\x1b[0m','N° de boletos', filtrado.length)
                console.log('\x1b[32m%s\x1b[0m','Total à receber',totalReceitas)
                process.exit(0)
            }else{
                console.log('\x1b[31m%s\x1b[0m','Erro: Fabricante não encontrado ou sem nenhuma pendência')
                process.exit(0)
            }
    
        } catch (error) {
            console.log(error)
            process.exit(0)
        }
    }else{
        console.log('\x1b[31m%s\x1b[0m','Erro: Fornecedor não informado no terminal, favor digitar qual fornecedor deseja adicionar')
    }

}

sendFirebase(process.argv[2])