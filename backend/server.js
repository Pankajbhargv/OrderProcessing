const app = require('./app');

const dotenv = require('dotenv');


//Configuration
dotenv.config({path:"backend/config/config.env"});

app.listen(process.env.PORT, ()=>{
    console.log('Listening on port ' + process.env.PORT);
})


