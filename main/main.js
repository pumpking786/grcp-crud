const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const express = require('express');

const packageDefinitionRec = protoLoader.loadSync('./proto/customers.proto',{});
const packageDefinitionProc = protoLoader.loadSync('./proto/process.proto');
const customerProto = grpc.loadPackageDefinition(packageDefinitionRec);
const processingProto = grpc.loadPackageDefinition(packageDefinitionProc);


const customerStub = new customerProto.CustomerService('0.0.0.0:50051',
                        grpc.credentials.createInsecure());
const processingStub = new processingProto.Processing('0.0.0.0:50052',
                        grpc.credentials.createInsecure());

const app = express();
app.use(express.json());
                        
const port = 3000;
let orders = {};

function processAsync(order) {
    customerStub.get({ id: order.customerId }, (err, customer) => {
        if(err) return;

        orders[order.id].customer = customer;
        const call = processingStub.process({
            orderId: order.id,
            customerId: customer.id
        });
        call.on('data', (statusUpdate) => {
            let statusValue;
            switch (statusUpdate.status) {
                case 0:
                    statusValue = "NEW"
                    break;
                    case 1:
                        statusValue = "QUEUED"
                    break;
                    case 2:
                        statusValue = "PROCESSING"
                    break;
                    case 3:
                        statusValue = "DONE"
                    break;
                default:
                    statusValue = "DEFAULT"
                    break;
            }
            orders[order.id].status = statusValue;
        });
    });
}

app.post('/studentOnboard', (req, res) => {
    if(!req.body.customerId) {
        res.status(400).send('Product identifier is not set');
        return;
    }
    let orderId = Object.keys(orders).length + 1;
    let order = {
        id: orderId,
        status: "NEW",
        customerId: req.body.customerId,
        personalDetails: {
            name: req.body.name,
            DOB : req.body.DOB,
            education : req.body.education,
            fatherName : req.body.father
        },
        createdAt : new Date().toLocaleString()
    };
    orders[order.id] = order;
    processAsync(order);
    res.send(order);
});

app.get('/onboardingStatus/:id', (req, res) => {
    if(!req.params.id || !orders[req.params.id]) {
        res.status(400).send('OnBoarding form  not found');
        return;
    }
    res.send(orders[req.params.id]);
});

app.listen(port, () => {
  console.log(`API is listening on port ${port}`)
});
