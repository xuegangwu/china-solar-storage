const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '光储投资地图 API',
      version: '2.0.0',
      description: '光伏储能投资分析平台 - 提供省份数据、用户认证、AI 分析等功能',
      contact: {
        name: 'Terry Wu',
        email: 'wuxuegang@gmail.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001/api',
        description: '开发服务器'
      },
      {
        url: 'https://api.solar-storage-map.com/api',
        description: '生产服务器'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
