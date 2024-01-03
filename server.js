const dotenv = require('dotenv');
const mongoose = require('mongoose');

//--------------Tạo biến môi trường trước app
dotenv.config({ path: './.env' });

const app = require('./app');

const DB = process.env.DATABASE.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD
);

mongoose
    // .connect(process.env.DATABASE_LOCAL, {
    .connect(DB, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
    })
    .then(() => {
        console.log('DB was connected !!');
    });

const port = process.env.PORT || 3030;
app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});
