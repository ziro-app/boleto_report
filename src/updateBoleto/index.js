const { db } = require('../firebase/index')
const arrayObject = require('@ziro/array-object')
const sendFirebase = require('./utils/pending')
const axios = require('axios')
const moment = require('moment')

require('dotenv').config()

const updateBoleto = async (razao) => {
        const config = {
            method: 'GET',
            url: process.env.SHEET_URL,
            data: {
                apiResource: 'values',
                apiMethod: 'batchGet',
                spreadsheetId: process.env.SHEET_ID_CHARGE,
                ranges: ['BoletoBaixados!O:AB']
            },  
            headers: {
                'Authorization': process.env.SHEET_TOKEN,
                'Content-Type': 'application/json',
                'Origin': 'https://ziro.app'
            }
        }
        try {
            if(razao){
            // Requisição googlesheets
            const baseBoletosBaixados = await axios(config)
            const boletosBaixados = arrayObject(baseBoletosBaixados.data.valueRanges[0]).filter(item => item.fornecedor.toUpperCase() === razao.toUpperCase())
            // Consultar o banco de dados pending-boletos com payment_type === boleto e comparar com googleSheets
            let arrayDocId = []
            const queryPayments = db.collection('comission-payments').where('fantasia', '==', razao.toUpperCase())
            const snapPayments = await queryPayments.get()
            snapPayments.forEach((doc) => {
                if(doc.data().status === 'Aguardando Pagamento' && doc.data().payment_type === 'boleto'){
                    const {billets} = doc.data()
                    billets.map(billet => {
                        let boletoPago = boletosBaixados.filter(item => {
                            return billet.boletId === item.boleto
                        })
                        if(doc.id && boletoPago[0]){
                            arrayDocId.push(doc.id)
                        }
                    })
                }
            })
            const updateObj = {
                'status': 'Pagamento Realizado',
                'date_payment': new Date()
            }
            // Trocar o status dele para pagamento realizado
            if(arrayDocId[0]){
                arrayDocId.map(async item => {
                    console.log(item, updateObj)
                    await db.collection('comission-payments').doc(item).update(updateObj)
                })
                await sendFirebase(razao)
                process.exit(0)
            }else{
                console.log('\x1b[32m%s\x1b[0m','Fabricante não ou nenhuma nova atualização de pagamento')
                process.exit(0)
            }
            }else{
                console.log('\x1b[32m%s\x1b[0m','Fabricante não ou nenhuma nova atualização de pagamento')
                process.exit(0)
            }
            // Rodar o pendingComission de novo
        } catch (error) {
            console.log(error) 
            process.exit(0)
        }
}

updateBoleto(process.argv[2])