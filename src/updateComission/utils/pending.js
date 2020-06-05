const axios = require('axios')
const arrayObject = require('@ziro/array-object')
const removeDuplicate = require('@ziro/remove-duplicates')
const { db } = require('../../firebase/index')

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
                ranges: ['Boletos!A:M']
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
            const arrayReceitas = filtrado.map((item) => {
                if(typeof item.receita === 'number'){
                    return item.receita
                }else{
                    return Number(item.receita.replace('.','').replace(',','.'))
                }
            })
            const totalReceitas = Math.round(arrayReceitas.reduce((a,b) => a+b))
            const createObj = (filtrado, total_receitas) => {
            const polos = removeDuplicate(filtrado.map(item =>  `${item.polo} - ${item.rua}`))
                if(polos.length >= 2){
                    let obj = []
                    let counter = 0
                    for(polo of polos){
                        counter++
                        const filtradoPolo = filtrado.filter(item => `${item.polo} - ${item.rua}` === polo)
                        obj.push({
                            polo,
                            transactionZoopId: `relatorio_futuro${counter}`,
                            status: 'Comissões em Aberto',
                            fantasia: razao.toUpperCase(),
                            billets:filtradoPolo
                        })
                    }
                    return {
                        total_receitas,
                        numero_boletos: filtrado.length,
                        fantasia: razao.toUpperCase(),
                        pending_polos: obj,
                    }
                }else{
                    return {
                        status: 'Comissões em Aberto',
                        fantasia: razao.toUpperCase(),
                        billets:filtrado
                    }
                }
            }
            if(filtrado[0]){
                    await db.collection('pending-commission').doc(razao.toUpperCase()).set(createObj(filtrado,totalReceitas))
                    console.log('Boletos', filtrado)
                    console.log('\x1b[32m%s\x1b[0m',`Dados pendentes do ${razao} atualizados com sucesso`)
                    console.log('\x1b[32m%s\x1b[0m','N° de boletos pendentes', filtrado.length)
                    console.log('\x1b[32m%s\x1b[0m','Total à receber pendentes',totalReceitas)
            }else{
                console.log('\x1b[32m%s\x1b[0m','Fabricante não encontrado ou sem nenhuma pendência')
            }
        } catch (error) {
            console.log(error)
            return error
        }
    }else{
        console.log('\x1b[31m%s\x1b[0m','Erro: Fornecedor não informado no terminal, favor digitar qual fornecedor deseja adicionar')
    }
}

module.exports = sendFirebase