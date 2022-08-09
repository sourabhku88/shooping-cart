const isValidBody = (value) => {
    return Object.keys(value).length > 0;
}

const isValid =  (value)=> {
  if (typeof value === "undefined" || value === null) return false;
  if (typeof value === "string" && value.trim().length === 0) return false;
  if (typeof value === "number") return false;
  return true;
};

const isValidPassword = (password) => {
    if (password.length > 7 && password.length < 16)
        return true;
}

const isValidFiles = (files) => {
  if (files && files.length > 0) {
    return true;
  }
}

let shippingRegex = /^(true|false)$/;
let priceRegex = /^[1-9]\d{0,7}(?:\.\d{1,2})?$/;
let insRegex = /^[0-9]*[1-9]+$|^[1-9]+[0-9]*$/;
let nameRegex = /^[a-zA-Z ]{2,20}$/;
let emailRegex = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;
let phoneRegex = /^[6-9]\d{9}$/;
let streetRegex = /^([a-zA-Z0-9.\-_ ]{5,20})*$/;
let cityRegex = /^[a-zA-z]+([\s][a-zA-Z]+)*$/;
let pinRegex = /^[1-9]\d{5}$/; 
let statusRegex = /^(pending|completed|cancelled)$/;

module.exports = { isValidBody, isValid, isValidPassword, isValidFiles,pinRegex,cityRegex,streetRegex,phoneRegex ,emailRegex,nameRegex,shippingRegex,priceRegex,insRegex,statusRegex};
