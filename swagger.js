// // swagger.js
// const swaggerJsDoc = require('swagger-jsdoc');
// const swaggerUi = require('swagger-ui-express');

// const swaggerOptions = {
//   swaggerDefinition: {
//     openapi: '3.0.0',
//     info: {
//       title: 'PixaCart application end points',
//       version: '1.0.0',
//       description: 'Your API Description',
//     },
//     servers: [
//       {
//         url: 'http://localhost:3000', 
//       },
//     ],
//     components: {
//       securitySchemes: {
//         bearerAuth: {
//           type: 'http',
//           scheme: 'bearer',
//           bearerFormat: 'JWT',
//         },
//       },
//     },
//     security: [
//       {
//         bearerAuth: [],
//       },
//     ],
//   },
//   apis: [path.join(Mainfile, 'config', 'route.js')],
// };

// const swaggerDocs = swaggerJsDoc(swaggerOptions);

// module.exports = {
//   swaggerUi,
//   swaggerDocs,
// };


const swaggerAutogen = require('swagger-autogen')();

const outputFile = './swagger-output.json'; // Output JSON file where Swagger spec will be written
const endpointsFiles = ['./server.js', './config/*.js']; // Path to the main application file and route files

const swaggerConfig = {
  info: {
    title: 'Express API Swagger Documentation',
    description: 'API documentation generated automatically by swagger-autogen',
    version: '1.0.0',
  },
  host: 'localhost:3000',
  basePath: '/',
  schemes: ['http'],
  consumes: ['application/json'],
  produces: ['application/json'],
  tags: [
    {
      name: 'Users',
      description: 'Endpoints related to user management',
    },
  ],
};

// Generate swagger-output.json
swaggerAutogen(outputFile, endpointsFiles, swaggerConfig);
