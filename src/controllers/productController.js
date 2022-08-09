const productModel = require('../models/productModel');
const { default: mongoose, } = require('mongoose');
const { isValidBody, isValid,  isValidFiles ,shippingRegex,priceRegex,insRegex } = require('../validators/validator');
const {uploadFile} = require('../aws/upload');


const newProduct= async function(req,res){
    try{
    let {title,description,price,currencyId,currencyFormat,style,availableSizes,installments} = req.body;

    let file = req.files;
        
    if (!isValidBody(req.body)) return res.status(400).send({ status: false, message: "User Data not entered." });
    
    if (!isValid(title)) return res.status(400).send({ status: false, message: "title is required" });
    
    let checkTitle = await productModel.findOne({title})

    if(checkTitle) return res.status(400).send({ status: false, message: "title already exists, should be unique" });

    if (!isValid(description)) return res.status(400).send({ status: false, message: "description is required" });
        
    if (!isValid(price)) return res.status(400).send({ status: false, message: "price is required" });
        
    if(typeof Number(price)==NaN) return res.status(400).send({status:false,message:"price should only be in digits"})
    if(!typeof(price)===Number) return res.status(400).send({status:false,message:"price should only be in digits"})
        if (currencyId) {
            if (!isValid(currencyId))  return res.status(400).send({ status: false, message: "currencyId is required" }); 
            if (currencyId !== "INR" && currencyId !== "USD")  return res.status(400).send({ status: false, message: "currencyId should only be INR or USD" }) 
            req.body.currencyId = currencyId;
        }
        if (currencyFormat) {
            if (!isValid(currencyFormat))  return res.status(400).send({ status: false, message: "currency Format is required" }); 
            if (currencyFormat !== "₹" && currencyFormat !== "$")  return res.status(400).send({ status: false, message: "only ₹ or $ currency format is acceptable" }); 
            req.body.currencyFormat = currencyFormat;
        }
        
        if (style) {
            if (!isValid(style))  return res.status(400).send({ status: false, message: "style is required" }); 
            if (!typeof (style) == String)  return res.status(400).send({ status: false, message: "style should only be string Type" }); 
            req.body.currencyFormat = currencyFormat;

        }
        
    if(!availableSizes) return res.status(400).send({ status: false, message: "available Sizes is required" });

    if(availableSizes){
        availableSizes = availableSizes.split(",");
        let enumValue = ["S", "XS", "M", "X", "L", "XXL", "XL"]
        const isVAlue = availableSizes.every(ele => enumValue.includes(ele));
        if (!isVAlue) return res.status(400).send({status:false,message:"sizes can only be accepted in S, XS, M,X,L,XXL,XL"})
    }

    if(installments){
        installments = (parseInt(installments))
        if(typeof( installments )!=="number") return res.status(400).send({status:false,message:"installments should only be in digits"})
    }
    if (!isValidFiles(file)) return res.status(400).send({status:false, message:"product image required"})

    const productImage = await uploadFile(file[0]);
    req.body.productImage = productImage;
    req.body.availableSizes = availableSizes;
    req.body.installments = installments;

    const productData = await productModel.create(req.body);
    return res.status(201).send({status:true,message:"Success",data:productData});
    }catch(err){return res.status(500).send({ status: false, message: err.message });}
}



const getAllProduct = async (req,res)=>{
try{
    const {size,name,priceGreaterThan,priceLessThan,priceSort,...rest} = req.query
   
    if(Object.keys(rest).length !== 0)  return res.status(400).send({status:false,message:`You can't filter for this key`})

    if(!/^(-1|1)$/.test(priceSort)) return res.status(400).send({status:false,message:`you can priceSort only this value 1 ,-1.`})

    const priceSorter = (data,priceSort)=> {
    if(priceSort == -1) data.sort((a,b)=> a.price - b.price); // dec
    if(priceSort == 1)  data.sort((a,b)=> b.price - a.price); //
    return data;
    }

    if((Object.keys(req.query).includes("priceSort") && (Object.keys(req.query).length ==1 )) ||( Object.keys(req.query).length == 0 ) ){

    let data = await productModel.find({isDeleted:false});
    if(data.length == 0) return res.status(404).send({status:false,message:" Produts not found"})
    data = priceSorter(data , priceSort);
    return res.status(200).send({status:true,message:"all Produts",data})
    }else{
        let filter ={};
        if(name)  filter.title = {"$regex":name,"$options":'i'}; 
        if(size) filter.availableSizes = {"$in":size};
        if(priceGreaterThan) filter.price = {"$gte":priceGreaterThan};
        if(priceLessThan) filter.price = {"$lte":priceLessThan};
        if(priceLessThan && priceGreaterThan) filter.price = {"$gte":priceGreaterThan,"$lte":priceLessThan};
        filter.isDeleted = false;

    let data = await productModel.find(filter);

    if(data.length == 0) return res.status(404).send({status:false,message:" Produts not found",});
    if(priceSort) data = priceSorter(data , priceSort);
    return res.status(200).send({status:true,message:"all Produts",data});
    }

}catch(err){return res.status(500).send({ status: false, message: err.message }); }
}



const getSingleProduct = async (req,res)=>{
    try{
    const productId = req.params.productId;

    if(!mongoose.isValidObjectId(productId)) return res.status(400).send({status:false, message: " Invalid productId format"})

    const data = await productModel.findById(productId);
    if(!data || data.isDeleted === true) return res.status(404).send({status:false, message: "product not found"})

    return res.status(200).send({status:false, message: "product detail's ",data})

}catch(err){return res.status(500).send({ status: false, message: err.message });}
}

const updateProduct = async (req, res) => {
    try {
        let productId = req.params.productId;
        let { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments } = req.body;;
        let files = req.files;
     
        if (!mongoose.isValidObjectId(productId)) return res.status(400).send({ status: false, message: "productId not valid" });
        
        let checkId = await productModel.findOne({ _id: productId, isDeleted: false });
        if (!checkId) return res.status(404).send({ status: false, message: "productId does not exist or product is deleted." })
        
        if (!isValidBody(req.body)) return res.status(400).send({ status: false, message: "No data found to update." });
        
        let updateProduct = {};
        if (title||typeof title=='string') {
            if (!isValid(title)) return res.status(400).send({ status: false, message: "title is required" });
            
          const checkTitle = await productModel.findOne({ title: title })
         if (checkTitle) return res.status(400).send({ status: false, message: "title already exists. Please try another." })
            
            updateProduct.title = title;
        }
        if (description || typeof description == "string") {
          if (!isValid(description)) return res.status(400).send({ status: false, message: "description is required" });
            
            updateProduct.description = description;
        }
        if (price || typeof price == 'string') {
            if (!isValid(price)) return res.status(400).send({ status: false, message: "price is required" });
            
            if (!priceRegex.test(price)) return res.status(400).send({status:false, message:"price should be a number and greater than 0."})
            
            updateProduct.price = price
        }
        if (currencyId || typeof currencyId == 'string') {
            if (!isValid(currencyId)) return res.status(400).send({ status: false, message: "currencyId is required" });
            
            if (currencyId !== "INR") return res.status(400).send({ status: false, message: "currencyId should only be INR" })
            
            updateProduct.currencyId = currencyId
        }
        if (currencyId || typeof currencyId == 'string') {
            if (!isValid(currencyId)) return res.status(400).send({ status: false, message: "currencyId is required" });
            
            if (currencyId !== "INR") return res.status(400).send({ status: false, message: "currencyId should only be INR" })
            
            updateProduct.currencyId = currencyId
        }
        if (currencyFormat || typeof currencyFormat == "string") {
          if (!isValid(currencyFormat)) return res.status(400).send({ status: false, message: "currencyFormat is required" });
          
          if (currencyFormat !== "₹") return res.status(400).send({ status: false,message: "currencyFormat should only be ₹" });
          
          updateProduct.currencyFormat = currencyFormat;
        }
        if (isFreeShipping || typeof isFreeShipping == 'string') {
            if (!isValid(isFreeShipping)) return res.status(400).send({status:false, message:"isFreeShipping value required"})
            
            if (!shippingRegex.test(isFreeShipping)) return res.status(400).send({status:false, message:"isFreeShipping value should be either 'true' or 'false'"})
                
            updateProduct.isFreeShipping = isFreeShipping;
        }
         if (style || typeof style == 'string') {
            if (!isValid(style)) return res.status(400).send({status:false, message:"style value required"})
            
            updateProduct.style = style;
        }
        if (availableSizes || typeof availableSizes == 'string') {
            if (!isValid(availableSizes)) return res.status(400).send({status:false, message:"availableSizes value required"})
            
            availableSizes = availableSizes.split(",")
            let arr = ["S", "XS", "M", "X", "L", "XXL", "XL"];
            let checkSize = availableSizes.every(ele => arr.indexOf(ele) != -1)
            if (!checkSize) return res.status(400).send({ status: false, message: "size should be from 'S', 'XS', 'M', 'X', 'L', 'XXL' and 'XL' only." })
            
            updateProduct.$addToSet =  {availableSizes };
        }
        if (installments || typeof installments == 'string') {
            if (!isValid(installments)) return res.status(400).send({status:false, message:"installments value required"})
            
            if (!insRegex.test(installments)) return res.status(400).send({status:false, message:"installment value should be a number greater than 0"})
            
            updateProduct.installments = installments
        }

        const updatedProduct = await productModel.findOneAndUpdate({ _id: checkId._id }, updateProduct, { new: true })
         return res.status(200).send({ status: true, message: "updated successfully", data: updatedProduct })

    } catch (err) {
        return res.status(500).send({status:false, message:err.message})
    }}

const deleteProduct = async function(req,res){
    try{
    let productId = req.params.productId
    if(!mongoose.isValidObjectId(productId)) return res.status(400).send({status:false, message: `Opps! ${productId} is not a valid productId` })
    
    let checkProduct = await productModel.findOne({_id:productId, isDeleted:false})
    if(!checkProduct) return res.status(404).send({status:false, message:"Sorry ProductId not found"})
    
    await productModel.findOneAndUpdate({_id:productId},{isDeleted:true, deletedAt:new Date()},)
    return res.status(200).send({status:true, message:"Congrats ! Product has been deleted successfully"})

}catch(err){return res.status(500).send({status:false, message:err.message})}
}





module.exports = { newProduct, getAllProduct, getSingleProduct, updateProduct,deleteProduct };

