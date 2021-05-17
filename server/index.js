const mongoose = require('mongoose')
const express = require('express')
const path = require('path')
const app = express()

app.use(express.urlencoded({ extended: true }));


var auth = false
const url = `mongodb+srv://glebClusterUser:glebClusterUserPassword@cluster0.fvfru.mongodb.net/products?retryWrites=true&w=majority`;

var options = {
    root: path.join(__dirname, 'views'),
}

const connectionParams={
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true 
}

mongoose.connect(url,connectionParams)
    .then( () => {
        console.log('Connected to database ')
    })
    .catch( (err) => {
        console.error(`Error connecting to the database. \n${err}`);
    })

const ProductSchema = new mongoose.Schema({
    name: String,
    price: Number   
});

const ProductModel = mongoose.model('ProductModel', ProductSchema);

const UsersSchema = new mongoose.Schema({
    email: String,
    password: String,
    name: String,
    age: Number,
    moneys:{
        type: Number,
        default: 0
    },
    productsInBucket:[mongoose.Schema.Types.Map]
},
{ collection : 'myusers' });

const OrderSchema = new mongoose.Schema({
    ownername: String,
    price: Number   
});

const OrderModel = mongoose.model('OrderModel', OrderSchema);

const UsersModel = mongoose.model('UsersModel', UsersSchema, 'myusers');
    
app.get('/', (req, res)=>{
    //получение всех записей
    let query = ProductModel.find({}).select(['name', 'price']);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, X-Access-Token, X-Socket-ID, Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    query.exec( (err, allProducts) => {
        if (err){
            return
        }
        if(Array(req.query.useremail)[0] === undefined){
            return res.json(allProducts)
        }
        let mailOfUser = req.query.useremail
        return res.json(allProducts.toString())
    });
    
})

app.get('/admin/orders', (req, res)=>{
    //получение всех заказов
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, X-Access-Token, X-Socket-ID, Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    
    let query = OrderModel.find({}).select(['ownername', 'price']);
    query.exec((err, allOrders) => {
        if (err){
            return
        }
        let mailOfUser = req.query.useremail
        res.json(allOrders)
    });
    
})
app.get('/admin/products/add', async (req, res)=>{
    if(Array(req.query.productname)[0] === undefined){
        res.send(`product not found`)
        return
    } else if(Array(req.query.productname)[0] !== undefined) {
        await new ProductModel({ name: req.query.productname, price: Number(req.query.productprice) }).save(function (err) {
            if(err){
                res.send(`product not found`)
                return
            } else {
                res.redirect('/')
            }
        })
    }
})

app.get('/admin/products/delete', async (req, res)=>{
    if(Array(req.query.productname)[0] === undefined){
        res.send(`product not found`)
        return
    } else if(Array(req.query.productname)[0] !== undefined) {
        await ProductModel.deleteMany({ name: req.query.productname  })
        res.redirect('/')
        
    }
})

app.get('/product/:productID',(req, res)=>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, X-Access-Token, X-Socket-ID, Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    let query = ProductModel.findById(req.params.productID);
        query.exec((err, product) => {
        if (err){
            return
        }
        return res.json(product)
    });
    
})

app.get('/users/register',(req, res)=>{
    
})
app.get('/users/logout',(req, res)=>{
    auth = false
})

app.get('/users/bucket/delete', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, X-Access-Token, X-Socket-ID, Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    
    mongoose.connection.collection("myusers").updateOne(
            { email: req.query.useremail },
            { $pull: { 'productsInBucket': { name: req.query.productname } } }
    );
})

app.get('/users/bucket/buy',async (req, res)=>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, X-Access-Token, X-Socket-ID, Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
   
    let query = await UsersModel.findOne({'email': req.query.useremail }, async function(err, user){
        if (err){
            return
        } else {
            if(user != null && user != undefined){
                let commonPrice = 0
                user.productsInBucket.forEach(function (product){
                    if(new Map(product).get('price') == null){
                        commonPrice += 0
                    } else {
                        commonPrice += new Map(product).get('price')
                    }
                })
                if(user.moneys >= commonPrice){
                    const order = await new OrderModel({ ownername: req.query.useremail, price: commonPrice });
                    order.save(function (err) {
                        if(err){
                            return
                        } else {
                            //заказ создан
                        }
                    });
                    
                    await UsersModel.updateOne({ email: req.query.useremail }, 
                    { 
                        "$inc": { "moneys": -commonPrice }
                    })
                } else if(user.moneys < commonPrice){
                    //нехватает денег
                }
            } 
        }
    })
    

})

app.get('/users/amount',async (req, res)=>{
    let query = await UsersModel.findOne({'email': req.query.useremail }, async function(err, user){
        if (err || Array(req.query.useremail)[0] === undefined){
            return
        } else {
            if(user != null && user != undefined){
                let incerementAmountBy = req.query.amount
                await UsersModel.updateOne({ email: req.query.useremail }, 
                { 
                    "$inc": { "moneys": incerementAmountBy }
                })
                return
            } else {
                return
            }
        }
    })
    

})

app.get('/users/login',(req, res)=>{

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, X-Access-Token, X-Socket-ID, Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
   
})
app.get('/users/check', (req,res)=>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, X-Access-Token, X-Socket-ID, Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
   
    let query =  UsersModel.findOne({'email': req.query.useremail}, function(err, user){
        if (err || user == undefined || user == null){
            return res.send(`user not found`)    
            
        } else {
            if(req.query.useremail == user.email && req.query.userpassword == user.password){
                auth = true
                res.json(user)
            } else {
                return res.send(`user not found`)    
            }
            
        }
    })
})
app.get('/users/usercreatesuccess',async (req, res)=>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, X-Access-Token, X-Socket-ID, Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
   
    let query = UsersModel.find({}).select(['email']);
    query.exec(async (err, allUsers) => {
        if (err){
            return res.send('rollback')
        }
        let userExists = false
        allUsers.forEach(user => {
            if(user.email.includes(req.query.useremail)){
                userExists = true
            }
        });
        if(userExists){
            return res.send('rollback')
        } else {
            const user = await new UsersModel({ email: req.query.useremail, password:req.query.userpassword, name:req.query.username, age:req.query.userage });
            user.save(function (err) {
                if(err){
                    return res.send('rollback')
                } else {
                    auth = true
                    return res.send('created')
                }
            });
        }
    });
})

app.get('/users/bucket/add',async (req, res)=>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, X-Access-Token, X-Socket-ID, Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    
    if(Array(req.query)[0] === undefined){
        return
    } else {
        await UsersModel.updateOne({ email: req.query.useremail }, 
            { $push: 
                { 
                    productsInBucket: [
                        {
                            name: req.query.productname,
                            price: Number(req.query.productprice)
                        }
                    ]
                    
                }
            }
        )
    }
})

app.get(`/users/bucket`, (req, res)=>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, X-Access-Token, X-Socket-ID, Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    
    var myProductsInBucket = []
    let queryOfProductsInBucket = UsersModel.findOne({'email': req.query.useremail});
    let queryOfProducts = ProductModel.find({}).select(['name' ,'price']);
    queryOfProducts.exec( (err, allProducts) => {
        if (err){
            return
        }
        queryOfProductsInBucket.exec( (err, allProductsInBucketOfThisUser) => {
            if(err){
                return
            }
            allProductsInBucketOfThisUser.productsInBucket.forEach(function(productInBucket){                        
                myProductsInBucket.push(productInBucket)
            })
            res.json(allProductsInBucketOfThisUser.productsInBucket)
        })
    });
})

app.listen(4000)