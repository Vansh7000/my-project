const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

// CRUD
router.post("/", productController.createProduct);
router.get("/", productController.getAllProducts);
router.get("/category/:category", productController.getProductsByCategory);
router.get("/by-color/:color", productController.getProductsByColor);
router.put("/:id", productController.updateProduct);
router.delete("/:id", productController.deleteProduct);

module.exports = router;
