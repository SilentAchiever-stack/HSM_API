require('dotenv').config()
const cors = require('cors');
const express = require('express');
const path = require('path');

const connectDB = require('./Database/database');

const authRoute          = require('./Route/authRoute');
const guestRoute         = require('./Route/guestRoute');
const receptionistRoute  = require('./Route/receptionistRoute');
const adminRoute         = require('./Route/adminRoute');
const publicRoute = require('./Route/publicRoute');
const landingPage = require('./landingpage')

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use(cors({origin:true,
  credentials:true,
  methods:["GET","PUT","PATCH","POST","DELETE"],
  allowedHeaders:['content-type']
}))

app.get('/', (req, res) => {
  res.send(landingPage);
});

app.use(express.json());
/* app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); */

app.use('/api/users',        authRoute);
app.use('/api/guest',        guestRoute);
app.use('/api/receptionist', receptionistRoute);
app.use('/api/admin',        adminRoute);
app.use('/api/public', publicRoute);

app.listen(PORT, () => {
    console.log(`Server is now listening on port ${PORT}`);
});
