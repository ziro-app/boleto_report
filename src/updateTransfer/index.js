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
            let queryPayments = db.collection('comission-payments').where('fantasia', '==', razao.toUpperCase())
            const snapPayments = await queryPayments.get()
            snapPayments.forEach((doc) => {
                    arrayFirebase.push(doc.data())
                })
            let queryPending = db.collection('pending-commission').where('fantasia', '==', razao.toUpperCase())
            const snapPending = await queryPending.get()
            snapPending.forEach( async (doc) => {
                // Condicional se tem 1 polo só ou não
                const unicoPolo = doc.data().billets ? true : false
                if(unicoPolo){
                    const { billets } = doc.data()
                    let arrayPagos = []
                    billets.map(item => {
                        arrayPagos.push(...filtrado.filter((sheet) => {
                            return item.boleto === sheet.boleto
                        }))
                    })
                    const clientId = razao.toUpperCase();
                    const encodedData = `${Buffer.from(clientId).toString('base64')}${arrayFirebase.length+1}`
                    if(billets[0]){
                        const updateObj = {
                            'fantasia': razao.toUpperCase(),
                            'status': 'Pagamento Realizado',
                            'date_payment': new Date(),
                            'counter': arrayFirebase.length+1,
                            'transactionZoopId': encodedData,
                            'payment_type': 'transfer',
                            'billets': arrayPagos
                        }
                        console.log(updateObj)
                        await db.collection('comission-payments').add(updateObj)
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
                }else{
                    let counter = -1
                    doc.data().pending_polos.map( async (polo) => {
                        let baixados = polo.billets.map(boleto => {
                            return filtrado.filter((sheetRow) => {
                                return boleto.boleto === sheetRow.boleto
                            })
                        })
                        const arrayBaixados = baixados.map(item => {
                            return item[0]
                        }).filter(item => {
                            return item
                        })
                        if(arrayBaixados[0]){
                            counter++
                            const clientId = razao.toUpperCase();
                            const encodedData = `${Buffer.from(clientId).toString('base64')}${arrayFirebase.length+counter}`
                            const updateObj = {
                                'fantasia': razao.toUpperCase(),
                                'status': 'Pagamento Realizado',
                                'date_payment': new Date(),
                                'counter': arrayFirebase.length+1+counter,
                                'transactionZoopId': encodedData,
                                'payment_type': 'transfer',
                                'billets': arrayBaixados
                            }
                            try {
                                await db.collection('comission-payments').add(updateObj)
                                console.log('\x1b[32m%s\x1b[0m',`O pagamento do polo: ${polo.polo} da ${updateObj.fantasia} foi relatado com sucesso!`)
                                console.log('\x1b[32m%s\x1b[0m','Data do pagamento', moment(updateObj.date_payment).format('DD/MM/YYYY'))
                                console.log('\x1b[32m%s\x1b[0m','Status de pagamento atualizado com sucesso')
                                await sendFirebase(razao)
                                console.log(`Relatório de pendências do polo: ${polo.polo} foi atualizada com sucesso!`)
                            } catch (error) {
                                console.log(`Erro ao tentar atualizar o pagamento do ${polo.polo}`)
                            }
                        }else{
                            console.log(`O polo: ${polo.polo} não teve nenhum pagamento realizado`)
                        }
                    })
                    process.exit(0)
                }
            })
        } catch (error) {
            console.log(error) 
            process.exit(0)
        }
}

updateComission(process.argv[2])