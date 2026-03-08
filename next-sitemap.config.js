/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl: 'https://sifa.id',
  generateRobotsTxt: false,
  exclude: ['/import', '/settings', '/admin/*'],
};

module.exports = config;
