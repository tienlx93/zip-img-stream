
module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps: [
    // First application
    {
      name: 'API node',
      script: 'index.js',
      cwd: 'bin',
      instances:  "max",
      instance_var: "INSTANCE_ID",
      exec_mode: 'cluster'
    },
  ],
};
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps: [
    // First application
    {
      name: 'API node',
      script: 'bin/www',
      // cwd: 'bin',
      instances:  "max",
      instance_var: "INSTANCE_ID",
      exec_mode: 'cluster'
    },
  ],
};