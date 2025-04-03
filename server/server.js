const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const { v4: uuidv4 } = require('uuid');

// Load the proto file
const PROTO_PATH = '../customers.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {});
const proto = grpc.loadPackageDefinition(packageDefinition).CustomerService;

// In-memory "database" for storing customers
let customers = [
  { id: '1', name: 'John Doe', age: 30, address: '1234 Elm St' },
  { id: '2', name: 'Jane Smith', age: 25, address: '5678 Oak St' }
];

// Service methods
const server = new grpc.Server();

// getAll method
function getAll(call, callback) {
  callback(null, { customers });
}

// get method
function get(call, callback) {
  const customer = customers.find(c => c.id === call.request.id);
  if (customer) {
    callback(null, customer);
  } else {
    callback({
      code: grpc.status.NOT_FOUND,
      details: 'Customer not found'
    });
  }
}

// insert method
function insert(call, callback) {
  const newCustomer = { ...call.request, id: uuidv4() };
  customers.push(newCustomer);
  callback(null, newCustomer);
}

// update method
function update(call, callback) {
  const index = customers.findIndex(c => c.id === call.request.id);
  if (index !== -1) {
    customers[index] = call.request;
    callback(null, customers[index]);
  } else {
    callback({
      code: grpc.status.NOT_FOUND,
      details: 'Customer not found'
    });
  }
}

// remove method
function remove(call, callback) {
  const index = customers.findIndex(c => c.id === call.request.id);
  if (index !== -1) {
    customers.splice(index, 1);
    callback(null, {});
  } else {
    callback({
      code: grpc.status.NOT_FOUND,
      details: 'Customer not found'
    });
  }
}

// Add service to server
server.addService(proto.service, {
  getAll,
  get,
  insert,
  update,
  remove
});

// Start the server
server.bindAsync('127.0.0.1:50051', grpc.ServerCredentials.createInsecure(), () => {
  console.log('Server running at http://127.0.0.1:50051');
  server.start();
});
