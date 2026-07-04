module.exports = {
  apps: [
    {
      name: 'lab-stock',
      script: 'node_modules/.bin/next',
      args: 'start',
      env: { PORT: 3031 },
    },
  ],
};
