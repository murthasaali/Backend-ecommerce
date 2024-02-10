const express = require('express');
const adminController = require('../Controllers/adminController');
const verifyToken=require("../middleware/userAuth")
const router = express.Router();
router.post("/login",adminController.login)
router.get('/get', adminController.getAllProducts);
router.use(verifyToken)
router.post('/add', adminController.addProduct);
router.put('/update/:id', adminController.updateProduct);
router.get('/getaproduct/:id', adminController.getProductById);
router.delete('/removeproduct/:id', adminController.deleteAproduct);
router.get("/getallusers", adminController.getAllUsers);
module.exports = router;

