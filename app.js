const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');
const sequelize = require('./util/database');

const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

// db.execute('SELECT * FROM products').then(data => console.log(data[0]));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  User.findByPk(1)
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

User.hasMany(Product); // user if FK will be on product table
Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' }); // inverse of the relations

User.hasOne(Cart);
Cart.belongsTo(User); // Inverse of the relation and it is optional

Cart.belongsToMany(Product, { through: CartItem }); // Cart Item is the bridging entity
Product.belongsToMany(Cart, { through: CartItem });

sequelize
  .sync()
  // .sync({ force: true })
  .then(result => {
    return User.findByPk(1);
    // console.log(result);
  })
  .then(user => {
    if (!user) {
      return User.create({
        name: 'Max',
        email: 'test@test.com',
      });
    }
    return user;
  })
  .then(user => {
    console.log(user);
    user.createCart();
  })
  .then(cart => {
    app.listen(3000);
  })
  .catch(err => {
    console.log(err);
  });
