const express = require("express");
const router = express.Router();

const { authentication, authorisation } = require("../Auth/userAuth");
const { registerUser, login, getProfile, updateUser } = require('../controllers/userController')
const { newProduct, getAllProduct, getSingleProduct, updateProduct, deleteProduct } = require("../controllers/productController")
const { cartCreation, getCart, updateCart, deleteCart } = require('../controllers/cartController')
const { placeOrder, updateOrder } = require('../controllers/orderController')


/* USER API's */
router.post("/register", registerUser);
router.post("/login", login);
router.get("/user/:userId/profile", authentication, getProfile);
router.put("/user/:userId/profile", authentication, authorisation, updateUser);

/* PRODUCT API's */
router.post("/products", newProduct);
router.get("/products", getAllProduct);
router.get("/products/:productId", getSingleProduct);
router.put("/products/:productId", updateProduct);
router.delete("/products/:productId", deleteProduct);

/* CART APIs */
router.post("/users/:userId/cart", authentication, authorisation, cartCreation);
router.get("/users/:userId/cart", authentication, authorisation, getCart);
router.put("/users/:userId/cart", authentication, authorisation, updateCart);
router.delete("/users/:userId/cart", authentication, authorisation, deleteCart);

/*ORDER APIs */
router.post("/users/:userId/orders",authentication, authorisation, placeOrder)
router.put("/users/:userId/orders",authentication, authorisation, updateOrder)

/*BAD URL */
router.all("*", function (req, res) {
  return res.status(404).send({ status: false, message: "invalid URL" });
});

module.exports = router;
