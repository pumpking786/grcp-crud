const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const { response } = require('express');

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
  name: 'Pramit Amatya',
  age: 23,
  address: 'Dallu Kathmandu'
};

const updatedCustomer={
  id: 3,
  name: 'PumpKing',
  age: 23,
  address: 'Swayambhu'
}

client.insert(newCustomer, (error, response) => {
  if (!error) {
    console.log('Inserted Customer:', response);
  } else {
    console.error('Error:', error);
  }
});

//update
client.update(updatedCustomer, (error, response) => {
  if (!error) {
    // Success: log the updated customer
    console.log('Updated Customer:', response);
  } else {
    if (error.code === grpc.status.NOT_FOUND) {
      // Customer not found
      console.log(`Customer with ID ${updatedCustomer.id} not found`);
    } else {
      // General error
      console.error('Error:', error.details);
    }
  }
});

// Call remove to delete a customer
client.remove({ id: '2' }, (error, response) => {
  if (!error) {
    console.log('Response from server:', response); 
    // Success: log the deleted customer's ID
    console.log(`${response.id} Deleted`); // Log the ID from the server's response
  } else {
    if (error.code === grpc.status.NOT_FOUND) {
      // Customer not found
      console.log(`Customer with ID 1 not found`);
    } else {
      // General error
      console.error('Error:', error.details);
    }
  }
});
