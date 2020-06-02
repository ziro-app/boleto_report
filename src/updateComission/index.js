const { db } = require('../firebase/index')
const sendFirebase = require('./utils/pading')
const moment = require('moment')

require('dotenv').config()

const updateComission = async (razao) => {
        try {
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
            const clientId = razao.toUpperCase();
            const encodedData = `${Buffer.from(clientId).toString('base64')}${arrayFirebase.length+1}`;
            console.log(encodedData)
            if(arrayPending[0]){
                const objeto = {
                    'fantasia': razao.toUpperCase(),
                    'status': 'Pagamento Realizado',
                    'date_payment': new Date(),
                    'counter': arrayFirebase.length+1,
                    'billets': arrayPending[0].billets,
                    'transactionZoopId': encodedData
                }
                await db.collection('boleto-payments').add(objeto)
                console.log('\x1b[32m%s\x1b[0m','Atualização', objeto.billets)
                await sendFirebase(razao)
                console.log('\x1b[32m%s\x1b[0m','Fantasia', objeto.fantasia)
                console.log('\x1b[32m%s\x1b[0m','Data do pagamento', moment(objeto.date_payment).format('DD/MM/YYYY'))
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