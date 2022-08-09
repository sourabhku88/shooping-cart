const cartModel = require('../models/cartModel');
const { default: mongoose } = require('mongoose');
const userModel=require('../models/userModel')
const orderModel=require('../models/orderModel');
const {statusRegex} = require('../validators/validator')

const placeOrder=async function(req,res){
   try {
      let userId = req.params.userId;
      if (!mongoose.isValidObjectId(userId)) return res.status(400).send({ status: false, message: "userId not valid" })
      
       
      const userCheck = await userModel.find({ userId });
      if (!userCheck)  return res.status(404).send({ status: false, message: "No such user exists" }) 

      let cartId = req.body.cartId;
      if (!mongoose.isValidObjectId(cartId)) return res.status(400).send({ status: false, message: "cartId not valid" })
      
      const cartCheck = await cartModel.findOne({_id:cartId, userId:userId})

       if(!cartCheck) return res.status(400).send({status:false,message:"cart does not belong to user"})

       if(cartCheck.items.length == 0) return res.status(400).send({status:false, message:"you can't order anything from empty cart."})
       
       let total =0 
        cartCheck.items.forEach(ele => total += ele.quantity)
       let CreateOder = {};
       CreateOder.userId = userId;
       CreateOder.totalItems = cartCheck.totalItems;
       CreateOder.totalPrice =  cartCheck.totalPrice;
       CreateOder.items = cartCheck.items
       CreateOder.totalQuantity = total
       CreateOder.status = "pending"

       const orderData=await orderModel.create(CreateOder)
       return res.status(201).send({status:true,message:"order placed successfully" , data: orderData})

    }catch(err){res.status(500).send({status:false,message:err.message})}
}

const updateOrder=async function(req,res){
    try{
       let userId=req.params.userId; 
       let { orderId, status } = req.body;

       if (!mongoose.isValidObjectId(userId)) return res.status(400).send({status:false, message:"userId not valid"})
      
       const userCheck=await userModel.findById(userId);
       
       if(!userCheck) return res.status(404).send({status:false,message:"No such user exists"})

      if (!mongoose.isValidObjectId(orderId)) return res.status(400).send({status:false, message:"orderId not valid"})
      
       const checkOder=await orderModel.findOne({_id:orderId,userId:userId})

       if(!checkOder){return  res.status(404).send({status:false,message:"Order does not belong to user or order doesn't exist"})}

       if(checkOder.cancellable == false && status == "cancelled" ) {return res.status(400).send({status:false, message:"this oder can't be cancled"})}

       if (!statusRegex.test(status)) return res.status(400).send({ status: false, message: "status should have 'pending', 'completed' or 'cancelled' as its value" })
            
       const orderData=await orderModel.findOneAndUpdate({_id:orderId},{ status:status},{new:true})
       return res.status(201).send({status:true,message:"order updated successfully" , data: orderData})

    }catch(err){res.status(500).send({status:false,message:err.message})}
}
module.exports={placeOrder,updateOrder}
