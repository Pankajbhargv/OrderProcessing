const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt'); //importing bcrypt package
const chart = require('chart.js');

const hbs = require('hbs');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');
const nodeMailer = require('nodemailer'); 



const limiter = rateLimit({
    windowMs: 60000,
    max : 3,
    message : '<script>alert("Too Many Login Attempts. Kindly try again later!"); window.location.href="/login"</script>'
})


hbs.registerHelper('eq', function (a, b) {
    return a === b;
});



// Register the JSON.stringify helper
hbs.registerHelper('JSON', function(obj) {
    return JSON.stringify(obj);
  });


  const checkLoggedIn = (req, res, next) => {
    if (req.session.loggedIn) {
      next();
    } else {
      res.redirect('/login');
    }
  };

const protectRoute = (req, res, next) => {
    if (req.session.userId) {
        next();
    } else {
        res.redirect('/login');
    }
};

// Middleware to check if the user is authenticated






function requireAdmin(req, res, next) {
  if (req.session && req.session.user && req.session.user.role === 'Admin') {
    return next();
  } else {
    return res.status(401).send('<script>alert("Unauthorized Access"); window.location.href="/home"</script>');
  }
}

function isAdmin(req, res, next) {
  const role = req.session.role;
  if (role !== 'Admin' && req.session.loggedIn) {
    res.status(403).send('<script>alert("Unauthorized Access"); window.location.href="/home"</script>');
    return;
  }

  




  

  

  // add cache control headers
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  // set up a listener for the beforeunload event
  res.locals.beforeUnloadScript = `
    window.addEventListener('beforeunload', function(event) {
      if (${req.session.loggedIn}) {
        event.preventDefault();
        event.returnValue = '';
        if (confirm('You will be logged out of the session if you go back. Are you sure you want to continue?')) {
          window.location.href = '/logout';
        }
      }
    });
  `;

  next();
}




// function requireAdmin(req, res, next) {
//     if (req.session && req.session.user && req.session.role === 'Admin') {
//       return next();
//     } else {
//       return res.status(401).send('Unauthorized');
//     }
//   }

const requireAuth = (req, res, next) => {
  if (req.session && req.session.loggedIn) {
    next(); // User is authenticated, proceed to the next middleware or route handler
  } else {
    res.redirect('/login'); // User is not authenticated, redirect to the login page
  }
};



const app = express(); ///object has been created of express so that we can use the functionality44
const http = require('http').Server(app);
const io = require('socket.io')(http);
const mysql = require('mysql');

const session = require('express-session');

const bodyParser = require('body-parser');
app.use(function(req, res, next) {
    res.header("Cache-Control", "no-cache, no-store, must-revalidate");
    next();
  });
app.use(express.static('images'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'weblesson', //generate random string key which will use to authenticate the session
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }

}));
app.use((req, res, next) => {
  res.locals.loggedIn = req.session.loggedIn; // Make the loggedIn flag available in templates
  next();
});



const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "ecommerce"
});


con.connect((err) => {
    if (err) {
        console.log(err);
    }
    else {
        console.log("Connected to MySQL");
    }
})

//Routing and Middleware





const port =4000;

//Configuration
app.set("view engine", "hbs")
app.set("views", "./backend/view")


app.use(express.static(__dirname + '/public/style.css'))











app.get('/update-product',isAdmin, (req, res) => {
    res.render('update-product-form');

});

// app.post('/update-products/:id', (req, res) => {
//     res.redirect('/update-proucts');

// });

app.post('/update-product/:id', (req, res) => {
    const productId = req.params.id;
    con.query('SELECT * FROM productlist WHERE id = ?', [productId], (error, results) => {
        if (error) throw error;
        if (results.length === 0) {
            // If no results are returned, product id does not exist
            res.render('order');
        } else {
            res.render('update-product', { product: results[0] });
        }
    });
});

app.post('/update-product-save/:id', (req, res) => {
    const productId = req.params.id;
    console.log(productId);
    const { pname, pprice, pdescription, pmaxlimit, pquantity } = req.body;
  
    // Check if pmaxlimit or pquantity is less than zero
    if (pmaxlimit < 0 || pquantity < 0) {
      res.send('<script>alert("pmaxlimit or pquantity cannot be less than zero"); window.location.href = "/update-product";</script>');
    }
    else if (pquantity < 0) {
      res.send('<script>alert("pquantity cannot be less than zero"); window.location.href = "/update-product";</script>');
    }
    
    else {
      con.query('UPDATE productlist p JOIN orders o ON p.pname = o.product_name SET p.pname = ?, p.pprice = ?, p.pdescription = ?, p.pmaxlimit = ?, p.pquantity = ?, o.quantity = ? WHERE p.id = ?', 
  [pname, pprice, pdescription, pmaxlimit, pquantity, pquantity, productId], (error, results) => {
    if (error) throw error;
    res.redirect('/dashboard');
});
    }
  });
  
  




// Define the route for submitting the updated product details
// app.post('/update-product/:id', (req, res) => {
//     const productId = req.params.id;
//     const { pname, pprice, pdescription, pmaxlimit } = req.body;
//     con.query('UPDATE productlist SET pname = ?, pprice = ?, pdescription = ?, pmaxlimit=? WHERE id = ?', [pname, pprice, pdescription,pmaxlimit, productId], (error, results) => {
//         if (error) throw error;
//         res.redirect('/admin');
//     });
// });








app.get('/products',requireAuth , function (req, res) {
  con.query('SELECT *, CASE WHEN pquantity = 0 THEN 1 ELSE 0 END as pquantity_eq_0 FROM productlist', function (err, results, fields) {
      if (err) throw err;
      res.render('user', { products: results, activePage : "home" });
  });
});

//   app.post('/products', function(req, res) {
//     con.query('SELECT * FROM productlist', function(err, results, fields) {
//       if (err) throw err;
//       res.render('user', { products: results });
//     });
//   });



// app.get('/products', (req,res)=>{
//     const sql = 'select * from productlist';

//     con.query(sql, (err, results)=>{
//         if(!req.session.cart){
//             req.session.cart = [];
//         }

//         res.render('user', {products : results, cart : req.session.cart}); 
//         // res.render('user');
//     })
// })

// app.post('/add-to-cart', (req, res) => {
//     const productName = req.body.productName;
//     const productPrice = req.body.productPrice;
//     const productQuantity = req.body.productQuantity;
//     const userId = req.session.userId; // Assuming you are using sessions to store the user ID
//     const cartItem = {
//       product_name: productName,
//       product_price: productPrice,
//       product_quantity: productQuantity,
//       user_id: userId
//     };
//     con.query('INSERT INTO carttable SET ?', cartItem, (err, result) => {
//       if (err) throw err;
//       con.query('SELECT * FROM carttable WHERE user_id = ?', [userId], (err, cartItems) => {
//         if (err) throw err;
//         const total = cartItems.reduce((acc, cur) => acc + cur.product_price * cur.product_quantity, 0);
//         res.render('cart', { cartItems: cartItems, total: total });
//       });
//     });
//   });

app.post('/add-to-cart', function (req, res) {
  const userId = req.session.userId;
  const productName = req.body.productName;
  const productPrice = req.body.productPrice;
  const productQuantity = req.body.productQuantity;
  const totalPrice = productPrice * productQuantity;

  con.query('SELECT quantity FROM orders WHERE product_name = ?', [productName], function (err, result) {
    if (err) throw err;

    if (result.length === 0) {
      res.send({ status: 'error', message: 'This product is currently not available.' });
    } else if (result[0].quantity === 0) {
      res.send({ status: 'error', message: 'This product is currently out of stock.' });
    } else if (productQuantity > result[0].quantity) {
      res.send({ status: 'error', message: 'The quantity you have ordered is more than the stock available.' });
    } else {
      con.query('SELECT * FROM carttable WHERE user_id = ? AND product_name = ?', [userId, productName], function (err, existingCartItem) {
        if (err) throw err;

        if (existingCartItem.length > 0) {
          const newQuantity = existingCartItem[0].product_quantity + parseInt(productQuantity); // Convert to integer before adding

          con.query('UPDATE carttable SET product_quantity = ?, ptotal = ? WHERE user_id = ? AND product_name = ?', [newQuantity, totalPrice, userId, productName], function (err, updateResult) {
            if (err) throw err;

            con.query('SELECT * FROM carttable WHERE user_id = ?', [userId], function (err, cartItems) {
              if (err) throw err;
              const total = cartItems.reduce((acc, cur) => acc + cur.product_price * cur.product_quantity, 0);
              res.render('cart', { cartItems: cartItems, total: total });
            });
          });
        } else {
          const cartItem = {
            product_name: productName,
            product_price: productPrice,
            product_quantity: parseInt(productQuantity), // Convert to integer before storing
            ptotal: totalPrice,
            user_id: userId
          };

          con.query('INSERT INTO carttable SET ?', cartItem, function (err, insertResult) {
            if (err) throw err;

            con.query('SELECT * FROM carttable WHERE user_id = ?', [userId], function (err, cartItems) {
              if (err) throw err;
              const total = cartItems.reduce((acc, cur) => acc + cur.product_price * cur.product_quantity, 0);
              res.render('cart', { cartItems: cartItems, total: total });
            });
          });
        }
      });
    }
  });
});



app.get('/cart', function (req, res) {
    const cartItems = req.session.cart;
    const total = cartItems.reduce((acc, cur) => acc + cur.product_price * cur.product_quantity, 0);
    res.render('cart', { cartItems: cartItems, total: total });
  });

  app.get('/clear-cart', function (req, res) {
    // Get the user ID from the session
    const userId = req.session.userId;
  
    // Delete all cart items from the database for this user
    con.query('DELETE FROM carttable WHERE user_id = ?', [userId], function (err, result) {
      if (err) throw err;
  
      // Clear cart in session
      req.session.cart = [];
  
      // Redirect to the cart page
      res.redirect('/cart');
    });
  });

//   app.get('/cart', function(req, res) {
//     con.query('SELECT * FROM carttable', function(err, rows, fields) {
//       if (err) throw err;
//       let total = 0;
//       for (let i = 0; i < rows.length; i++) {
//         total += rows[i].total_price;
//       }
//       res.render('cart', { cartItems: rows, total: total });
//     });
//   });

//   app.get('/cart', function(req, res) {
//     con.query('SELECT * FROM carttable', function(err, rows, fields) {
//       if (err) throw err;
//       let total = 0;
//       for (let i = 0; i < rows.length; i++) {
//         total += rows[i].total_price;
//       }
//       res.render('cart', { cartItems: rows, total: total });

//     });
//   });

app.post('/cancel-order', (req, res) => {
    // Delete all items from the cart in the database
    con.query('DELETE FROM carttable', (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send('Error canceling order');
      } else {
        res.redirect('/products');
      }
    });
  });
  



app.get("/register", (req, res) => {
    res.render("register")
})

app.get('/adminregister', (req, res)=>{
    res.render("regAdmin");
})

let loginAttempts = 0;

app.post("/login",limiter, (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const role = req.body.role;

    req.session.isAuthenticated = true;
    req.session.loggedIn = true;

    if(loginAttempts>=3){
        res.send('<script>alert("Too many login attempts. Please try again later."); window.location.href= "/login"</script>');
        
    }



    const sql = `select * from register where username = ? and password = ? and role = ?`;
    const values = [username, password, role]

    const errors = {};
    if (!username) {
        errors.username = 'Username is required';
    }

    if (!password) {
        errors.password = 'Password is required';
    }

    else {
        con.query(sql, values, (err, result) => {
            if (err) {
                console.log("Crendentials are wrong! Kindly try again" + err);
            }
            else {

                if (result.length == 1) {
                  
                    req.session.userId = result[0].id;
                    req.session.role = result[0].role;

                    if (req.body.role == "User") {
                        res.redirect("/products");

                    }
                    else if (req.body.role == "Admin") {
                        res.redirect("/adminechart");
                    }
                  

                }
                else{
                    loginAttempts++;
                    res.send('<script>alert("Invalid Credentials! Kindly Enter Correct Username and Password!"); window.location.href="/login"</script>');
                   
                    
                    
                }

                

            }
        })
    }
                      

})

app.get("/dashboard",isAdmin,requireAuth,(req, res) => {
    //fetching the data from the database
    const sql = 'select * from productlist';
    con.query(sql, (err, results) => {
        if (err) {
            console.log("there is some error" + err);
        }

        // res.render('dashboard', { title : 'Product Details', action : 'list', sampleData : results });

        res.render('dashboard', { productlist: results });


    })
})

app.get('/update/:id', (req, res) => {
    const productId = req.params.id;
    const sql = 'SELECT * FROM productlist WHERE pid = ?';
  
    con.query(sql, [productId], (err, results) => {
      if (err) {
        console.log('there is some error' + err);
        return res.redirect('/dashboard');
      }
  
      if (results.length === 0) {
        return res.redirect('/dashboard');
      }
  
      const productlist = results[0];
  
      res.render('update', { productlist });
    });
  });

  app.post("/update/:id", (req, res) => {
    const id = req.params.id;
    const { name, price, description, category } = req.body;
  
    const sql = "UPDATE productlist SET pname = ?, pprice = ?, pdescription = ?, pcategory = ? WHERE id = ?";
    con.query(sql, [name, price, description, category, id], (err, result) => {
      if (err) {
        console.log("there is some error" + err);
      }
  
      res.redirect("/dashboard"); // redirect to the dashboard page after updating the product
    });
  });


  app.post('/delete/:id', function(req, res) {
    const productId = req.params.id;
  
    con.query('DELETE FROM productlist WHERE id = ?', [productId], function(err, deleteProductResult) {
      if (err) throw err;
  
      con.query('DELETE FROM orders WHERE id = ?', [productId], function(err, deleteOrderResult) {
        if (err) throw err;
  
        con.query('SELECT * FROM productlist', function(err, products) {
          if (err) throw err;
          res.render('dashboard', { productlist: products });
        });
      });
    });
  });
  


app.get('/logout', (req, res) => {

    req.session.userId = null;
   
  req.session.loggedIn = false;
    req.session.destroy();
    res.redirect('/login');
})

// Set up the middleware to protect the dashboard route


//place order api
// app.post('/place-order', function(req, res) {
//     const userId = req.session.userId;
//     const order = {
//       user_id: userId
//     };

//     con.query('INSERT INTO ordertable SET ?', order, function(err, result) {
//       if (err) throw err;

//       const orderId = result.insertId;

//       con.query('SELECT * FROM carttable WHERE user_id = ?', [userId], function(err, cartItems) {
//         if (err) throw err;

//         const orderItems = cartItems.map(function(item) {
//             const subtotal = item.product_price * item.product_quantity;
//             return {
//               order_id: orderId,
//               product_name: item.product_name,
//               product_price: item.product_price,
//               product_quantity: item.product_quantity,
//               subtotal: subtotal
//             };
//           });

//           const values = Object.values(orderItems);

//         con.query('INSERT INTO order_items (order_id, product_name, product_price, product_quantity) VALUES ?', values, function(err, result) {
//           if (err) throw err;

//           con.query('DELETE FROM carttable WHERE user_id = ?', [userId], function(err, result) {
//             if (err) throw err;

//             // Get the details of the newly created order and the order items
//             con.query('SELECT * FROM ordertable WHERE order_id = ?', [orderId], function(err, order) {
//               if (err) throw err;

//               con.query('SELECT * FROM order_items WHERE order_id = ?', [orderId], function(err, orderItems) {
//                 if (err) throw err;

//                 // Calculate the total amount of the order
//                 let total = 0;
//                 for (let i = 0; i < orderItems.length; i++) {
//                   total += orderItems[i].product_price * orderItems[i].product_quantity;
//                 }

//                 // Render the order confirmation page with the order details
//                 res.render('orderconfirmation', {
//                   orderId: orderId,
//                   cartItems: orderItems,
//                   total: total.toFixed(2)
//                 });
//               });
//             });
//           });
//         });
//       });
//     });
//   });

// app.post('/place-order', function (req, res) {
//     const userId = req.session.userId;
//     const order = {
//         user_id: userId,
//         order_status: 'ordered',
//         total_price: 0  // initialize the total_price field with 0
//     };

//     con.query('INSERT INTO ordertable SET ?', order, function (err, result) {
//         if (err) throw err;

//         const orderId = result.insertId;

//         con.query('SELECT * FROM carttable WHERE user_id = ?', [userId], function (err, cartItems) {
//             if (err) throw err;

//             // Calculate the total cost of the order
//             const total = cartItems.reduce(function (sum, item) {
//                 return sum + item.product_price * item.product_quantity;
//             }, 0);

//             // Update the order object with the total price
//             order.total_price = total;

//             const orderItems = cartItems.map(function (item) {
//                 return [
//                     orderId,
//                     item.product_name,
//                     item.product_price,
//                     item.product_quantity
//                 ];
//             });

//             con.query('INSERT INTO order_items (order_id, product_name, product_price,product_quantity) VALUES ?', [orderItems], function (err, result) {
//                 if (err) throw err;

//                 con.query('DELETE FROM carttable WHERE user_id = ?', [userId], function (err, result) {
//                     if (err) throw err;

//                     con.query('UPDATE ordertable SET total_price = ? WHERE order_id = ?', [total, orderId], function (err, result) {
//                         if (err) throw err;

//                         res.render('orderconfirmation', {
//                             orderId: orderId,
//                             cartItems: cartItems,
//                             total: total
//                         });
//                     });
//                 });
//             });
//         });
//     });
// });


//placing the order by updating the quantity of product and then showing it on the graph
app.post('/place-order', function (req, res) {
    const userId = req.session.userId;
    const order = {
        user_id: userId,
        order_status: 'ordered',
        total_price: 0  // initialize the total_price field with 0
    };

    con.query('INSERT INTO ordertable SET ?', order, function (err, result) {
        if (err) throw err;

        con.query('UPDATE statusorder SET ordered = ordered + 1', function (err, result) {
            if (err) throw err;
            console.log("Order count updated to ", result.affectedRows);
        });

        const orderId = result.insertId;

        con.query('SELECT * FROM carttable WHERE user_id = ?', [userId], function (err, cartItems) {
            if (err) throw err;

            // Update the quantity of products in the orders table
            cartItems.forEach(function (item) {
              con.query('UPDATE orders SET quantity = quantity - ? WHERE product_name = ? AND (quantity - ?) >= 0', [item.product_quantity, item.product_name, item.product_quantity], function (err, result) {
                  if (err) throw err;
                  
                  con.query('UPDATE productlist SET pquantity = pquantity - ? WHERE pname = ?', [item.product_quantity, item.product_name], function (err, result) {
                      if (err) throw err;
                  });
              });
          });
            // Calculate the remaining quantity of products
            con.query('SELECT product_name, SUM(quantity) AS remaining_quantity FROM orders GROUP BY product_name', function (err, remainingProducts) {
                if (err) throw err;

                // Generate data for the bar graph
                const barChartData = remainingProducts.map(function (item) {
                    return {
                        name: item.product_name,
                        value: item.remaining_quantity
                    };
                });

                // Calculate the total cost of the order
                const total = cartItems.reduce(function (sum, item) {
                    return sum + item.product_price * item.product_quantity;
                }, 0);

                // Update the order object with the total price
                order.total_price = total;

                const orderItems = cartItems.map(function (item) {
                    return [
                        orderId,
                        item.product_name,
                        item.product_price,
                        item.product_quantity
                    ];
                });

                con.query('INSERT INTO order_items (order_id, product_name, product_price,product_quantity) VALUES ?', [orderItems], function (err, result) {
                    if (err) throw err;

                    con.query('DELETE FROM carttable WHERE user_id = ?', [userId], function (err, result) {
                        if (err) throw err;

                        con.query('UPDATE ordertable SET total_price = ? WHERE order_id = ?', [total, orderId], function (err, result) {
                            if (err) throw err;

                            res.render('orderconfirmation', {
                                orderId: orderId,
                                cartItems: cartItems,
                                total: total,
                                barChartData: barChartData
                            });
                        });
                    });
                });
            });
        });
    });
})


// app.post('/place-order', function (req, res) {
//     const userId = req.session.userId;
//     const order = {
//         user_id: userId,
//         order_status: 'ordered' // add order_status field with value "ordered"
//     };

//     con.query('INSERT INTO ordertable SET ?', order, function (err, result) {
//         if (err) throw err;

//         const orderId = result.insertId;

//         // Join carttable and producttable tables to get the product name and price
//         con.query('SELECT carttable.id, orders.product_name, orders.price, carttable.product_quantity FROM carttable INNER JOIN orders ON carttable.id=orders.id WHERE carttable.user_id = ?', [userId], function (err, cartItems) {
//             if (err) throw err;

//             // Calculate the total cost of the order
//             const total = cartItems.reduce(function (sum, item) {
//                 return sum + item.product_price * item.product_quantity;
//             }, 0);

//             const orderItems = cartItems.map(function (item) {
//                 return [
//                     orderId,
//                     item.product_name,
//                     item.product_price,
//                     item.product_quantity
//                 ];
//             });

//             con.query('INSERT INTO order_items (order_id, product_name, product_price, product_quantity) VALUES ?', [orderItems], function (err, result) {
//                 if (err) throw err;

//                 con.query('DELETE FROM carttable WHERE user_id = ?', [userId], function (err, result) {
//                     if (err) throw err;

//                     res.render('orderconfirmation', {
//                         orderId: orderId,
//                         cartItems: cartItems,
//                         total: total
//                     });
//                 });
//             });
//         });
//     });
// });



app.get('/data', (req, res) => {
    // Create a SQL query to fetch data from the orders table
    const sqlQuery = 'SELECT order_date, SUM(price) AS total FROM orders GROUP BY order_date ORDER BY order_date';

    // Execute the SQL query using the connection pool
    con.query(sqlQuery, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal server error');
        } else {
            // Extract the data from the query result
            const dates = result.map(row => row.order_date);
            const totals = result.map(row => row.total);

            // Send the data as a JSON response

            res.json({ dates, totals });
        }
    });
});


app.get('/orders',requireAuth, function (req, res) {
    const userId = req.session.userId;

    con.query('SELECT * FROM ordertable WHERE user_id = ?', [userId], function (err, orders) {
        if (err) throw err;

        const orderIds = orders.map(order => order.order_id);

        if (orderIds.length === 0) {
            res.send('<script>alert("Sorry! You have not placed the order yet. Kindly orders the products!"); window.location.href="/products"</script>');
            return;
        }

        // // Update the order status for orders that are older than 24 hours
        // const now = new Date();
        // const oneDayAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
        // con.query('UPDATE ordertable SET order_status = ? WHERE user_id = ? AND order_status = ? AND order_date < ?', ['processing', userId, 'ordered', oneDayAgo], function (err, result) {
        //     if (err) throw err;
        // Update the order status to "processing" after 24 hours
        orders.forEach(function (order) {
            if (order.order_status === "ordered") {
                setTimeout(function () {
                    con.query('UPDATE ordertable SET order_status = "Processing" WHERE order_id = ?', [order.order_id], function (err, result) {
                        if (err) throw err;


                        // Increment processed or processing count in statusorder table
                        const status =
                        result.affectedRows > 0 ? "processing" : "processed";
                      const updateStatusQuery = `UPDATE statusorder SET ${status} = ${status} + 1, processed = processed + 1 WHERE id = 4`;
                      con.query(updateStatusQuery, function (err, result) {
                        if (err) throw err;
                      });


                        console.log("Order status updated to processing");
                        io.emit('orderStatusUpdated', { orderId: order.order_id, orderStatus: 'processing' });
                    });
                }, 10000); // 10 seconds in milliseconds
            }
        });

        



        con.query('SELECT * FROM order_items WHERE order_id IN (?)', [orderIds], function (err, orderItems) {
            if (err) throw err;

            const ordersWithItems = orders.map(function (order) {
                const items = orderItems.filter(function (item) {
                    return item.order_id === order.order_id;
                });
                return {
                    order_id: order.order_id,
                    items: items,
                    order_status: order.order_status,
                    total_price : order.total_price
                };
            });

            res.render('orders', {
                orders: ordersWithItems,
                activePage : "orders"
            });
        });
    });
});

app.get('/orders/:orderId', (req, res) => {
    const orderId = req.params.orderId;
    const query = `SELECT * FROM ordertable WHERE order_id = ${orderId}`;

    con.query(query, (error, results) => {
        if (error) throw error;

        res.render('orderDetails', { orders: results });
    });
});

// app.post('/orders/:orderId', (req, res) => {
//     const orderId = req.params.orderId;
//     const { orderDate, totalPrice, orderStatus } = req.body;
//     const query = `DELETE FROM ordertable WHERE order_id = ${orderId}`;

//     con.query(query, (error, results) => {
//         if (error) throw error;

//         res.redirect(`/orders`);
//     });
// });

app.post('/orders/:orderId', (req, res) => {
  const orderId = req.params.orderId;

  // Fetch the order items to get the product names and quantities
  const getOrderItemsQuery = `SELECT product_name, product_quantity FROM order_items WHERE order_id = ${orderId}`;
  con.query(getOrderItemsQuery, (error, orderItems) => {
      if (error) throw error;

      // Delete the order items first
      const deleteItemsQuery = `DELETE FROM order_items WHERE order_id = ${orderId}`;
      con.query(deleteItemsQuery, (error, results) => {
          if (error) throw error;

          // Delete the order
          const deleteOrderQuery = `DELETE FROM ordertable WHERE order_id = ${orderId}`;
          con.query(deleteOrderQuery, (error, results) => {
              if (error) throw error;

              // Increment the cancelled value in statusorder table
              const updateStatusQuery = `UPDATE statusorder SET cancelled = cancelled + 1 WHERE id = 4`;
              con.query(updateStatusQuery, (error, results) => {
                  if (error) throw error;

                  // Restore the original quantities
                  orderItems.forEach((item) => {
                      const { product_name, product_quantity } = item;

                      // Update the quantity in the orders table
                      const updateOrderQuantityQuery = `UPDATE orders SET quantity = quantity + ${product_quantity} WHERE product_name = '${product_name}'`;
                      con.query(updateOrderQuantityQuery, (error, results) => {
                          if (error) throw error;
                      });

                      // Update the quantity in the productlist table
                      const updateProductQuantityQuery = `UPDATE productlist SET pquantity = pquantity + ${product_quantity} WHERE pname = '${product_name}'`;
                      con.query(updateProductQuantityQuery, (error, results) => {
                          if (error) throw error;
                      });
                  });

                  res.redirect('/orders');
              });
          });
      });
  });
});




// app.get('/admin', (req, res) => {
//     // Fetch the data from the /data route using AJAX
//     const xhr = new XMLHttpRequest();
//     xhr.open('GET', '/data');
//     xhr.onload = () => {
//     if (xhr.status === 200) {
//         // Parse the JSON response
//         const data = JSON.parse(xhr.responseText);

//         // Create a new Chart.js instance and configure it
//         const ctx = document.getElementById('lineChart').getContext('2d');
//         const chart = new Chart(ctx, {
//         type: 'line',
//         data: {
//             labels: data.dates,
//             datasets: [{
//             label: 'Earnings in $',
//             data: data.totals,
//             backgroundColor: ['rgba(85, 85, 85, 1)'],
//             borderColor: ['rgba(41, 155, 99)'],
//             borderWidth: 1
//             }]
//         },
//         options: {
//             responsive: true,
//             scales: {
//             y: {
//                 beginAtZero: true
//             }
//             }
//         }
//         });

//         // Render the chart as a response
//         res.send(chart.toBase64Image());
//     } else {
//         console.error(xhr.statusText);
//         res.status(500).send('Internal server error');
//     }
//     };
//     xhr.send();
// });


// Define route for displaying the order status chart
app.get('/order', (req, res) => {
    const query = 'SELECT ordered, processing, cancelled, processed FROM statusorder';
    con.query(query, (err, results) => {
        if (err) throw err;
        // Extract label and data arrays from MySQL results
        const labels = Object.keys(results[0]);
        const data = Object.values(results[0]);

        // Generate pie chart using Chart.js
        const chartData = {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: ['#ffcd56', '#ff6384', '#36a2eb', '#fd6b19']
            }]
        };
        const chartOptions = {
            responsive: true
        };
        const chart = {
            data: chartData,
            options: chartOptions
        };

        // Render order status chart using order.hbs template
        res.render('order', { chart: chart });
    });
});


//Admin Code 
app.get('/admin', isAdmin, (req, res) => {
    const adminId = req.session.userId;
    console.log(adminId);
    
    // Query to fetch data from statusorder table
    const statusOrderQuery =
      'SELECT SUM(ordered) AS ordered_total, SUM(processing) AS processing_total, SUM(cancelled) AS cancelled_total, SUM(processed) AS processed_total FROM statusorder';

    // Query to fetch data from orders table
    const ordersQuery =
      'SELECT product_name, SUM(quantity * price) AS revenue FROM orders GROUP BY product_name';

    // Query to fetch user count
    const userCountQuery = 'SELECT COUNT(*) AS userCount FROM register';

    // Query to fetch order count
    const orderCountQuery = 'SELECT COUNT(*) AS orderCount FROM ordertable';

    // Query to fetch total revenue
    const revenueQuery = 'SELECT SUM(total_price) AS totalRevenue FROM ordertable';

    // Query to fetch admin details
    const adminQuery = `SELECT username, email, role FROM register WHERE id = ${adminId}`;

    Promise.all([
      new Promise((resolve, reject) => {
        con.query(statusOrderQuery, (error, results, fields) => {
          if (error) reject(error);
          else resolve(results);
        });
      }),
      new Promise((resolve, reject) => {
        con.query(ordersQuery, (error, results, fields) => {
          if (error) reject(error);
          else resolve(results);
        });
      }),
      new Promise((resolve, reject) => {
        con.query(userCountQuery, (error, results, fields) => {
          if (error) reject(error);
          else resolve(results);
        });
      }),
      new Promise((resolve, reject) => {
        con.query(orderCountQuery, (error, results, fields) => {
          if (error) reject(error);
          else resolve(results);
        });
      }),
      new Promise((resolve, reject) => {
        con.query(revenueQuery, (error, results, fields) => {
          if (error) reject(error);
          else resolve(results);
        });
      }),
      new Promise((resolve, reject) => {
        con.query(adminQuery, (error, results, fields) => {
          if (error) reject(error);
          else resolve(results);
        });
      })
    ])
      .then((results) => {
        const [statusOrderData, ordersData, userCountData, orderCountData, revenueData, adminData] = results;
        const orderedTotal = statusOrderData[0].ordered_total;
        const userCount = userCountData[0].userCount;
        const orderCount = orderCountData[0].orderCount;
        const totalRevenue = revenueData[0].totalRevenue;
        const username = adminData[0].username;
        const email = adminData[0].email;
        const role = adminData[0].role;

        res.render('admin', {
          statusOrderData: encodeURIComponent(JSON.stringify(statusOrderData[0])),
          ordersData: encodeURIComponent(JSON.stringify(ordersData)),
          userCount: userCount,
          orderCount: orderCount,
          totalRevenue: totalRevenue,
          orderedTotal: orderedTotal,
          username: username,
          email: email,
          role: role
        });
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Internal server error');
     

      });
      
  });

  app.get('/adminapex', isAdmin, (req, res) => {
    const adminId = req.session.userId;
    console.log(adminId);
    
    // Query to fetch data from statusorder table
    const statusOrderQuery =
      'SELECT SUM(ordered) AS ordered_total, SUM(processing) AS processing_total, SUM(cancelled) AS cancelled_total, SUM(processed) AS processed_total FROM statusorder';

    // Query to fetch data from orders table
    const ordersQuery =
      'SELECT product_name, SUM(quantity * price) AS revenue FROM orders GROUP BY product_name';

    // Query to fetch user count
    const userCountQuery = 'SELECT COUNT(*) AS userCount FROM register';

    // Query to fetch order count
    const orderCountQuery = 'SELECT COUNT(*) AS orderCount FROM ordertable';

    // Query to fetch total revenue
    const revenueQuery = 'SELECT SUM(total_price) AS totalRevenue FROM ordertable';

    // Query to fetch admin details
    const adminQuery = `SELECT username, email, role FROM register WHERE id = ${adminId}`;

    Promise.all([
      new Promise((resolve, reject) => {
        con.query(statusOrderQuery, (error, results, fields) => {
          if (error) reject(error);
          else resolve(results);
        });
      }),
      new Promise((resolve, reject) => {
        con.query(ordersQuery, (error, results, fields) => {
          if (error) reject(error);
          else resolve(results);
        });
      }),
      new Promise((resolve, reject) => {
        con.query(userCountQuery, (error, results, fields) => {
          if (error) reject(error);
          else resolve(results);
        });
      }),
      new Promise((resolve, reject) => {
        con.query(orderCountQuery, (error, results, fields) => {
          if (error) reject(error);
          else resolve(results);
        });
      }),
      new Promise((resolve, reject) => {
        con.query(revenueQuery, (error, results, fields) => {
          if (error) reject(error);
          else resolve(results);
        });
      }),
      new Promise((resolve, reject) => {
        con.query(adminQuery, (error, results, fields) => {
          if (error) reject(error);
          else resolve(results);
        });
      })
    ])
      .then((results) => {
        const [statusOrderData, ordersData, userCountData, orderCountData, revenueData, adminData] = results;
        
      
        const orderedTotal = statusOrderData[0].ordered_total;
        const userCount = userCountData[0].userCount;
        const orderCount = orderCountData[0].orderCount;
        const totalRevenue = revenueData[0].totalRevenue;
        const username = adminData[0].username;
        const email = adminData[0].email;
        const role = adminData[0].role;

        res.render('adminapexchart', {
            
          statusOrderData: encodeURIComponent(JSON.stringify(statusOrderData[0])),
          ordersData: encodeURIComponent(JSON.stringify(ordersData)),
          
          userCount: userCount,
          orderCount: orderCount,
          totalRevenue: totalRevenue,
          orderedTotal: orderedTotal,
          username: username,
          email: email,
          role: role
          
        });
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Internal server error');
     

      });

      
  });

  app.get('/adminechart', isAdmin,requireAuth, (req, res) => {
    const adminId = req.session.userId;
    console.log(adminId);
  
    // Query to fetch data from statusorder table
    const statusOrderQuery =
      'SELECT SUM(ordered) AS ordered_total, SUM(processing) AS processing_total, SUM(cancelled) AS cancelled_total, SUM(processed) AS processed_total FROM statusorder';
  
    // Query to fetch data from orders table
    const ordersQuery =
    'SELECT product_name, SUM(quantity) AS remaining_quantity FROM orders GROUP BY product_name';
  
    // Query to fetch user count
    const userCountQuery = 'SELECT COUNT(*) AS userCount FROM register';
  
    // Query to fetch order count
    const orderCountQuery = 'SELECT COUNT(*) AS orderCount FROM ordertable';
  
    // Query to fetch total revenue
    const revenueQuery = 'SELECT SUM(total_price) AS totalRevenue FROM ordertable';
  
    // Query to fetch admin details
    const adminQuery = `SELECT username, email, role FROM register WHERE id = ${adminId}`;
  
    Promise.all([
      new Promise((resolve, reject) => {
        con.query(statusOrderQuery, (error, results, fields) => {
          if (error) reject(error);
          else resolve(results);
        });
      }),
      new Promise((resolve, reject) => {
        con.query(ordersQuery, (error, results, fields) => {
          if (error) reject(error);
          else resolve(results);
        });
      }),
      new Promise((resolve, reject) => {
        con.query(userCountQuery, (error, results, fields) => {
          if (error) reject(error);
          else resolve(results);
        });
      }),
      new Promise((resolve, reject) => {
        con.query(orderCountQuery, (error, results, fields) => {
          if (error) reject(error);
          else resolve(results);
        });
      }),
      new Promise((resolve, reject) => {
        con.query(revenueQuery, (error, results, fields) => {
          if (error) reject(error);
          else resolve(results);
        });
      }),
      new Promise((resolve, reject) => {
        con.query(adminQuery, (error, results, fields) => {
          if (error) reject(error);
          else resolve(results);
        });
      })
    ])
      .then((results) => {
        const [statusOrderData, ordersData, userCountData, orderCountData, revenueData, adminData] = results;
  
        const orderedTotal = statusOrderData[0].ordered_total;
        const userCount = userCountData[0].userCount;
        const orderCount = orderCountData[0].orderCount;
        const totalRevenue = revenueData[0].totalRevenue;
        const username = adminData[0].username;
        const email = adminData[0].email;
        const role = adminData[0].role;
  
        const remainingData = ordersData.map((order) => {
          const remainingQuantity = order.remaining_quantity;
          return { product_name: order.product_name, remaining_quantity: remainingQuantity };
        });
        console.log(remainingData);
  
        const labels = remainingData.map(data => data.product_name);
        const dataValues = remainingData.map(data => data.remaining_quantity);
  
        res.render('adminechart', {
          statusOrderData: encodeURIComponent(JSON.stringify(statusOrderData[0])),
          ordersData: encodeURIComponent(JSON.stringify(ordersData)),
          remainingData: encodeURIComponent(JSON.stringify(remainingData)),
          userCount: userCount,
          
          orderCount: orderCount,
          totalRevenue: totalRevenue,
          orderedTotal: orderedTotal,
          username: username,
          email: email,
          role: role
          
        });
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('<script>alert("Internal Server Error"); window.location.href="/login"</script>');
     

      });

      
  });
  
  



// app.get('/admin',isAdmin, (req, res) => {
//     // Query to fetch data from statusorder table
//     const userCountQuery = 'SELECT COUNT(*) AS userCount FROM register';
//     const orderCountQuery = 'SELECT COUNT(*) AS orderCount FROM ordertable';
    
//     const revenueQuery = 'SELECT SUM(quantity * price) AS revenue FROM orders'; 
//     const statusOrderQuery = 'SELECT SUM(ordered) AS ordered_total, SUM(processing) AS processing_total, SUM(cancelled) AS cancelled_total, SUM(processed) AS processed_total FROM statusorder';

//     // Query to fetch data from orders table
//     const ordersQuery = 'SELECT product_name, SUM(quantity * price) AS revenue FROM orders GROUP BY product_name';
//     let statusOrderData = {};
//     let ordersData = {};
    
   
//     // Execute both queries in parallel
//     Promise.all([

//         new Promise((resolve, reject) => {
//             con.query(statusOrderQuery, (error, results, fields) => {
//                 if (error) reject(error);
//                 else resolve(results);
//             });
//         }),
//         new Promise((resolve, reject) => {
//             con.query(ordersQuery, (error, results, fields) => {
//                 if (error) reject(error);
//                 else resolve(results);
//             });
//         }),
        
//     ])

//         .then((results) => {
//             [statusOrderData, ordersData] = results;
//             const d1 = statusOrderData[0].ordered_total;
//             res.render('admin', {
//                 statusOrderData: encodeURIComponent(JSON.stringify(statusOrderData[0])),
//                 ordersData: encodeURIComponent(JSON.stringify(ordersData))
//             });
//         })
//         .catch((error) => {
//             console.error(error);
//             res.status(500).send('Internal server error');
//         });
// });


app.post("/register", (req, res) => {
  const { username, email, password, cPassword, role } = req.body;
  
  // Check if the email already exists
  con.query('SELECT * FROM register WHERE email = ?', [email], (err, result) => {
    if (err) {
      console.log("Error in checking email existence: " + err);
      res.status(500).send("Internal server error");
    } else {
      if (result.length > 0) {
        // Email already registered
        res.status(200).send(`
        <html>
        <head>
          <title>Email Already Registered</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f8f8f8;
            }
            
            .container {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              text-align: center;
            }
            
            .message {
              margin-bottom: 20px;
            }
            
            .message h1 {
              font-size: 28px;
              color: #333;
              margin-bottom: 10px;
            }
            
            .message p {
              font-size: 16px;
              color: #555;
              margin-bottom: 10px;
            }
            
            .message a {
              display: inline-block;
              padding: 10px 20px;
              background-color: #3498db;
              color: #fff;
              text-decoration: none;
              border-radius: 5px;
              transition: background-color 0.3s ease;
            }
            
            .message a:hover {
              background-color: #207ab7;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="message">
              <h1>Email Already Registered</h1>
              <p>This email is already registered. Please try with another email.</p>
              <a href="/register">Go Back to Registration</a>
            </div>
          </div>
        </body>
      </html>
      
        `);
      } else {
        // Email is available, insert the data into the database
        const sql = "INSERT INTO register (username, email, password, role) VALUES (?, ?, ?, 'User')";
        const values = [username, email, password, role];
      
        con.query(sql, values, (err, result) => {
          if (err) {
            console.log("Error in inserting the data into the database: " + err);
            res.status(500).send("Internal server error");
          } else {
            console.log("User Data is inserted into the database: " + result);
            res.status(200).send(`
              <html>
                <head>
                  <title>Redirecting...</title>
                  <script>
                    function redirect() {
                      window.location.href = "/login";
                    }
                  </script>
                </head>
                <body onload="setTimeout(redirect, 3000)">
                  <div class="centered">
                    <div class="text"> 
                      <h1>Registration Processing!</h1>
                      <p>Please wait while you're being redirected to the login page...</p>
                    </div>
                    <div class="loader"></div>
                  </div>
                  <style>
                    .centered {
                      display: flex;
                      flex-direction: column;
                      justify-content: center;
                      align-items: center;
                      height: 100vh;
                      position: absolute;
                      top: 50%;
                      left: 50%;
                      transform: translate(-50%, -50%);
                      text-align: center;
                    }
                    .text {
                      position: relative;
                      z-index: 1;
                    }
                    .loader {
                      border: 16px solid #f3f3f3;
                      border-top: 16px solid #3498db;
                      border-radius: 50%;
                      width: 120px;
                      height: 120px;
                      animation: spin 2s linear infinite;
                      position: absolute;
                      top: 50%;
                      left: 50%;
                      margin-top: -60px;
                      margin-left: -60px;
                    }
                    @keyframes spin {
                      0% { transform: rotate(0deg); }
                      100% { transform: rotate(360deg); }
                    }
                  </style>
                </body>
              </html>
            `);
          }
        });
      }
    }
  });
});

  
  
  

app.post("/adminregister", (req, res) => {
    const { username, email, password, cPassword, role } = req.body;
    //validating the fields



    {
        //inserting the data into the database
        const sql = 'insert into register(username, email, password, role) values (?,?,?,?)';
        const values = [username, email, password, role];

        con.query(sql, values, (err, result) => {
            if (err) {
                console.log("Error in inserting the data into the database" + err);
                res.status(500).send('Internal server error');
            }
            else {
                console.log("User Data is inserted into the database" + result);
                res.status(200).redirect('/login');

            }
        })
    }




})

function isValidEmail(email) {
    // basic email validation using regular expression
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}


    // app.post("/add", (req, res) => {
    //     const { id, pname, pprice, pdesc, pcat, plimit } = req.body;
    //     const sql = 'insert into productlist(id,pname, pprice, pdescription, pcategory, pmaxlimit) values (?,?,?,?,?,?)';
    //     const values = [id, pname, pprice, pdesc, pcat, plimit];

    //     const errors = {};
    //     if (!id) {
    //         errors.id = 'Product ID is required';
    //     }
    //     if (!pname) {
    //         errors.pname = 'Product Name is required';
    //     }
    //     if (!pprice) {
    //         errors.pprice = 'Product Price is required';
    //     }
    //     if (!pdesc) {
    //         errors.pdesc = 'Product Description is required';
    //     }

    //     if (!plimit) {
    //         errors.plimit = 'Product Maximum Limit is required';
    //     }


    //     if (Object.keys(errors).length > 0) {
    //         // if there are errors, send an error response
    //         res.status(400).json({ errors });
    //     }

    //     else {
    //         con.query(sql, values, (err, result) => {
    //             if (err) {
    //                 console.log("The data has not been inserted into the database" + err);
    //             }
    //             else {
    //                 console.log("The data has been inserted into the database" + result);
    //                 res.status(200).redirect('/home');
    //             }
    //         })
    //     }


    // })


    // app.post("/add", (req, res) => {
    //     const { id, pname, pprice, pdesc, pcat, plimit, pquantity } = req.body;
    //     const sql = 'SELECT * FROM productlist WHERE id = ?'; // SQL query to check if product ID already exists
    //     const checkValues = [id];
    //     const insertSql = 'INSERT INTO productlist(id, pname, pprice, pdescription, pcategory, pmaxlimit, pquantity) VALUES (?, ?, ?, ?, ?, ?,?)'; // SQL query to insert product
    //     const insertValues = [id, pname, pprice, pdesc, pcat, plimit, pquantity];
        
    //     con.query(sql, checkValues, (err, result) => {
    //         if (err) {
    //             console.log("Error checking for existing product ID: " + err);
    //             res.status(500).send("Error checking for existing product ID");
    //         } else if (result.length > 0) {
    //             console.log("Product ID already exists");
    //             res.status(400).render('exist');
    //         } else {
    //             con.query(insertSql, insertValues, (err, result) => {
    //                 if (err) {
    //                     console.log("Error inserting product: " + err);
    //                     res.status(500).send('<script>alert("Error Inserting Products"); window.location.href="/dashboard"</script>');
    //                 } else {
    //                     console.log("Product inserted with ID: " + id);
    //                     const orderSql = 'INSERT INTO orders(id, product_name, price, quantity) VALUES (?, ?, ?, ?)'; // SQL query to insert order
    //                     const orderValues = [id, pname, pprice, pquantity]; // values to insert into order table
    //                     con.query(orderSql, orderValues, (err, result) => {
    //                         if (err) {
    //                             console.log("Error inserting order: " + err);
    //                             res.status(500).send('<script>alert("Error Inserting Orders"); window.location.href="/dashboard"</script>');
    //                         } else {
    //                             console.log("Order inserted for product: " + pname);
    //                             res.status(200).redirect('/dashboard');
    //                         }
    //                     })
    //                 }
    //             })
    //         }
    //     })
    // })

    //other category handle code
    app.post("/add", (req, res) => {
      const { id, pname, pprice, pdesc, pcat, plimit, pquantity, pothercat } = req.body;
    
      const sql = 'SELECT * FROM productlist WHERE id = ?';
      const checkValues = [id];
      
      const insertSql = 'INSERT INTO productlist(id, pname, pprice, pdescription, pcategory, pmaxlimit, pquantity) VALUES (?, ?, ?, ?, ?, ?, ?)';
      
      let pcategory = pcat; // By default, use the selected category
    
      if (pcat === 'Other' && pothercat) {
        pcategory = pothercat; // Use the other category if provided
      }
    
      const insertValues = [id, pname, pprice, pdesc, pcategory, plimit, pquantity];
    
      con.query(sql, checkValues, (err, result) => {
        if (err) {
          console.log("Error checking for existing product ID: " + err);
          res.status(500).send("Error checking for existing product ID");
        } else if (result.length > 0) {
          console.log("Product ID already exists");
          res.status(400).render('exist');
        } else {
          con.query(insertSql, insertValues, (err, result) => {
            if (err) {
              console.log("Error inserting product: " + err);
              res.status(500).send('<script>alert("Error Inserting Products"); window.location.href="/dashboard"</script>');
            } else {
              console.log("Product inserted with ID: " + id);
              const orderSql = 'INSERT INTO orders(id, product_name, price, quantity) VALUES (?, ?, ?, ?)';
              const orderValues = [id, pname, pprice, pquantity];
              con.query(orderSql, orderValues, (err, result) => {
                if (err) {
                  console.log("Error inserting order: " + err);
                  res.status(500).send('<script>alert("Error Inserting Orders"); window.location.href="/dashboard"</script>');
                } else {
                  console.log("Order inserted for product: " + pname);
                  res.status(200).redirect('/dashboard');
                }
              })
            }
          })
        }
      })
    })
    
    

app.get('/forgot-password', function(req, res) {
    res.render('forgot-password-form');
  });

app.post('/forgot-password', function(req, res) {
    const email = req.body.email;
  
    // Generate a random token
    const token = crypto.randomBytes(20).toString('hex');
  
    // Store the token in the database for this user
    const sql = 'UPDATE register SET reset_token = ? WHERE email = ?';
    con.query(sql, [token, email], function(err, result) {
      if (err) throw err;
  
      // Send an email to the user with the password reset link
      let transporter = nodeMailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: 'pankajbhargava590@gmail.com',
            pass: 'Pankaj@123'
        }
      });
      let mailOptions = {
        from: 'pankajbhargava590@gmail.com',
        to: email,
        subject: 'Password reset link',
        html: `<p>Please click on the following link to reset your password:</p><a href="http://localhost:3000/reset-password/${token}">Reset password</a>`
      };
      transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
          console.log(error);
          res.send('Error: unable to send password reset email');
        } else {
          console.log('Email sent: ' + info.response);
          res.send('An email has been sent to your account with instructions on how to reset your password.');
        }
      });
    });
  });


app.get("/login", (req, res) => {
    res.render("login")
})

app.get("/home", (req, res) => {
    res.render("home")
})

app.get("/add",isAdmin,requireAuth,(req, res) => {
    res.render("add")
})

app.get("/search", protectRoute, (req, res) => {


    res.render("search")
})

app.get("/update", (req, res) => {
    res.render("update")
})

app.get("/first", (req, res) => {
    res.render("first")
})

app.get("/view", protectRoute, (req, res) => {
    res.render("view")
})

//Create Server
app.listen(port, (err) => {
    if (err) {
        console.log(err);

    }
    else {
        console.log("Server is running on port " + port)

    }
}
);







// console.log(orderData[0].revenue);
//             const doughnutChart = document.getElementById('barChart').getContext('2d');
//             new Chart(doughnutChart, {
//                 type: 'doughnut',
//                 data: {
//                     labels: [orderData[0].product_name, orderData[1].product_name,orderData[2].product_name],
//                     datasets: [{
//                         label: 'Earnings in $',
//                         data: [
//                             orderData[0].revenue, orderData[1].revenue,orderData[2].revenue
//                         ],
//                         backgroundColor: [
//                             'rgba(41, 155, 99, 1)',
//                             'rgba(54, 162, 235, 1)',
//                             'rgba(120, 46, 139, 1)',
//                         ],
//                         borderWidth: 1
//                     }]
//                 },
//                 options: {
//                     responsive: true
//                 }
//             });