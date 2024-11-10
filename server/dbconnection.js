const mysql = require('mysql2');

const dbconnection = {
    user: 'root',
    host: 'localhost',
    password: 'tp1928',
    database: 'eys_db',
    authPlugins: {
      mysql_clear_password: () => () => Buffer.from(password + '\0')
    }
}