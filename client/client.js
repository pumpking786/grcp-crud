const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Load the proto file
const PROTO_PATH = '../customers.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {});
const proto = grpc.loadPackageDefinition(packageDefinition).CustomerService;

// Create a gRPC client
const client = new proto('127.0.0.1:50051', grpc.credentials.createInsecure());

// Call getAll
client.getAll({}, (error, response) => {
  if (!error) {
    console.log('Customer List:', response.customers);
  } else {
    console.error('Error:', error);
  }
});

// Call get with a specific id
client.get({ id: '1' }, (error, response) => {
  if (!error) {
    console.log('Customer:', response);
  } else {
    console.error('Error:', error);
  }
});

// Call insert to add a new customer
const newCustomer = {
  name: 'Mike Jordan',
  age: 35,
  address: '7890 Pine St'
};

client.insert(newCustomer, (error, response) => {
  if (!error) {
    console.log('Inserted Customer:', response);
  } else {
    console.error('Error:', error);
  }
});
