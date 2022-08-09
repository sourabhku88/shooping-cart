const cartModel = require('../models/cartModel');
const { default: mongoose } = require('mongoose');
const productModel = require('../models/productModel');
const userModel = require('../models/userModel')
const cartCreation = async function (req, res) {
  try {
    let userId = req.params.userId;
    let cartId = req.body.cartId;
    let productId = req.body.productId;

    
    if (!productId) return res.status(400).send({ status: false, message: " Please Enter productId" });

    if (!mongoose.isValidObjectId(userId)) return res.status(400).send({ status: false, message: " Invalid userId format" });

    if (!mongoose.isValidObjectId(productId)) return res.status(400).send({ status: false, message: " Invalid productId format" })

    let quantity = 1;

    const userCheck = await userModel.findOne({ userId });

    if (!userCheck) { return res.status(404).send({ status: false, message: "No such user exists" }) }

    const productCheck = await productModel.findOne({ _id: productId, isDeleted: false })

    if (!productCheck) { return res.status(404).send({ status: false, message: "the product doesn't exist or is deleted" }) }

    const cartCheck = await cartModel.findOne({ userId:userId });

    if (!cartCheck) {
      let cartItems = {}
      cartItems.userId = userId
      cartItems.items = { productId, quantity }
      cartItems.totalPrice = productCheck.price * quantity;
      cartItems.totalItems = 1
      let newCart = await (await cartModel.create(cartItems))
      
      return res.status(201).send({ status: true, data: newCart })
    } else {
      if (!cartId) return res.status(400).send({ status: false, message: "Enter your respective cart ID " })

      if (!mongoose.isValidObjectId(cartId)) return res.status(400).send({ status: false, message: " Invalid cartId format" })

      const getCart = await cartModel.findOne({ _id: cartId, userId });

      if (!getCart) return res.status(404).send({ status: false, message: "UserId and CartId don't match." })

      let isAvilableProduct = getCart.items.some(ele => ele.productId == productId);

      if (isAvilableProduct) {
        const oldCart = await cartModel.findOneAndUpdate({ _id: cartId, "items.productId": productId }, { $inc: { totalPrice: +productCheck.price, "items.$.quantity": +1, } }, { new: true })

        return res.status(201).send({ status: true, message:"item added to cart successfully", data: oldCart })
      } else {
        const oldCart = await cartModel.findOneAndUpdate({ _id: cartId }, { $push: { items: { productId, quantity } }, totalPrice: cartCheck.totalPrice + productCheck.price * quantity, totalItems: cartCheck.items.length + 1 }, { new: true })

        return res.status(201).send({ status: true, message:"item added to cart successfully", data: oldCart })
      }
    }
  } catch (err) { return res.status(500).send({ status: false, message: err.message }) }
}

const updateCart = async function (req, res) {
  try {
    const userId = req.params.userId;
    const { cartId, productId, removeProduct } = req.body;

      if(!cartId) return res.status(400).send({ status: false, message: "Enter cartId for updation.!!" });

      if (!mongoose.isValidObjectId(userId)) return res.status(400).send({ status: false, message: "userId not valid" });
    
      if (!Object.keys(req.body).length===0) return res.status(400).send({ status: false, message: "no data found to update" });
      
      if (!mongoose.isValidObjectId(cartId)) return res.status(400).send({ status: false, message: "cartId not valid" });
      
      if (!mongoose.isValidObjectId(productId)) return res.status(400).send({ status: false, message: "productId not valid" });
      
      if (!/^(1|0)$/.test(removeProduct)) return res.status(400).send({status:false, message:"removeProduct value should be 0 or 1"})
      
      const checkUser = await userModel.findById(userId );
      if (!checkUser) return res.status(404).send({status: false,message: "user with given userId does not exist",});
      
      const checkCart = await cartModel.findOne({ _id: cartId, userId:userId });
      if (!checkCart) return res.status(400).send({status: false,message: "CartId does not belong to user",});
      
      const checkProduct = await productModel.findOne({_id: productId,isDeleted: false,});
      if (!checkProduct) return res.status(404).send({status: false,message: "product with given productId is deleted",});
      
    const checkCartProduct = await cartModel.findOne({ _id: cartId, "items.productId": productId })
    if (!checkCartProduct) return res.status(404).send({status:false, message:"entered productId does not exist in cart"})
    
    
    let cartArray = checkCart.items;
    if (checkCart.items.length === 0) return res.status(400).send({status:false, message:"cart is already empty."})
    
    for (let i = 0; i < cartArray.length; i++) {
      if (cartArray[i].productId == productId) { 
        let Price = cartArray[i].quantity * checkProduct.price; 
        if (removeProduct == 0) {
          const data = await cartModel.findByIdAndUpdate(cartId ,{$pull: { items: { productId } }, totalPrice: checkCart.totalPrice - Price, totalItems: checkCart.totalItems - 1, },{ new: true });
          return res.status(200).send({status: true,message: "removed product",data });
        }
        if (removeProduct == 1) {
          if (cartArray[i].quantity == 1 && removeProduct == 1) { 
            const data = await cartModel.findByIdAndUpdate(cartId ,{$pull: { items: {  productId } },totalPrice: checkCart.totalPrice - Price,totalItems: checkCart.totalItems - 1,},{ new: true });
            return res.status(200).send({status: true,message: "removed product",data});
          }
          cartArray[i].quantity = cartArray[i].quantity - 1;  
          const data = await cartModel.findByIdAndUpdate(cartId ,{items: cartArray,totalPrice: checkCart.totalPrice - checkProduct.price, },{ new: true });
          return res.status(200).send({status: true,message: "decreased quantity",data});
        }
      }
    }

  } catch (err) {return res.status(500).send({ status: false, message: err.message })}
}
const getCart = async function (req, res) {
  try {
    let userId = req.params.userId;
    if (!mongoose.isValidObjectId(userId)) return res.status(400).send({ status: false, message: " Invalid userId format" });

    const userCheck = await userModel.find({ userId });
    if (!userCheck) return res.status(404).send({ status: false, message: "User not found" });
    
    const cartCheck = await cartModel.findOne({ userId }).populate("items.productId");
    if (!cartCheck) return res.status(404).send({ status: false, message: "No cart found for this user" });

    return res.status(200).send({ status: true,message:"cart details", data: cartCheck });
  } catch (err) {return res.status(500).send({ status: false, message: err.message });}
};
const deleteCart = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!mongoose.isValidObjectId(userId)) return res.status(400).send({ status: false, message: "userId not valid" });

    const checkUser = await userModel.findById(userId)
    if (!checkUser) return res.status(404).send({ status: false, message: "user with given userId does not exist" })
    
    const checkCart = await cartModel.findOne({ userId: userId })
    if (!checkCart) return res.status(404).send({ status: false, message: "Cart with given userId does not exist" })

    if (checkCart.items.length === 0 ) return res.status(400).send({status:false, message:"cart is already deleted."})
    
    const deleteCart = await cartModel.findOneAndUpdate({ userId: userId }, { items: [], totalPrice: 0, totalItems: 0 }, { new: true });
    return res.status(200).send({ status: false, message: "cart is deleted", data:deleteCart })

  } catch (err) {return res.status(500).send({ status: false, message: err.message })}
}

module.exports = { cartCreation, getCart, updateCart, deleteCart }