var config = {
  port: process.env.PORT || '3000',
  env: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || 'postgres://localhost/qimg',
  adminToken: process.env.QIMG_ADMIN_TOKEN || 'admin',
  imageQuota: process.env.QIMG_IMAGE_QUOTA || 10
};

config.appUrl = process.env.QIMG_URL || 'http://localhost:' + config.port;

module.exports = config;
