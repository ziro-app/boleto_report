const { db } = require('../firebase/index')
const arrayObject = require('@ziro/array-object')
const sendFirebase = require('./utils/pending')
const axios = require('axios')
const moment = require('moment')

require('dotenv').config()

const updateComission = async (razao) => {
        const config = {
            method: 'GET',
            url: process.env.SHEET_URL,
            data: {
                apiResource: 'values',
                apiMethod: 'batchGet',
                spreadsheetId: process.env.SHEET_ID_CHARGE,
                ranges: ['BoletoBaixados!A:N']
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
            let arrayFirebase = []
            let arrayPending = []
            let queryPayments = db.collection('boleto-payments').where('fantasia', '==', razao.toUpperCase())
            const snapPayments = await queryPayments.get()
            snapPayments.forEach((doc) => {
                    arrayFirebase.push(doc.data())
                })
            let queryPending = db.collection('pending-commission').where('fantasia', '==', razao.toUpperCase())
            const snapPending = await queryPending.get()
            snapPending.forEach((doc) => {
                if(doc.data().billets){
                    arrayPending.push({billets: doc.data().billets})
                }
            })
            let arrayPagos = []
            arrayPending[0].billets.map(item => {
                arrayPagos.push(...filtrado.filter((sheet) => {
                    return item.boleto === sheet.boleto
                }))
            })
            const clientId = razao.toUpperCase();
            const encodedData = `${Buffer.from(clientId).toString('base64')}${arrayFirebase.length+1}`
            if(arrayPending[0]){
                const updateObj = {
                    'fantasia': razao.toUpperCase(),
                    'status': 'Pagamento Realizado',
                    'date_payment': new Date(),
                    'counter': arrayFirebase.length+1,
                    'transactionZoopId': encodedData,
                    'payment_type': 'transfer',
                    'billets': arrayPagos
                }
                await db.collection('boleto-payments').add(updateObj)
                console.log('\x1b[32m%s\x1b[0m','Atualização', updateObj.billets.length)
                await sendFirebase(razao)
                console.log('\x1b[32m%s\x1b[0m','Fantasia', updateObj.fantasia)
                console.log('\x1b[32m%s\x1b[0m','Data do pagamento', moment(updateObj.date_payment).format('DD/MM/YYYY'))
                console.log('\x1b[32m%s\x1b[0m','Status de pagamento atualizado com sucesso')
                process.exit(0)  
            }else{
                console.log('\x1b[31m%s\x1b[0m','Erro: Fabricante não encontrado ou sem nenhuma pendência')
                process.exit(0)  
            }
            
        } catch (error) {
            console.log(error) 
            process.exit(0)
        }
}

updateComission(process.argv[2])