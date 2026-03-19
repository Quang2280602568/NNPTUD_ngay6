var express = require('express');
var router = express.Router();
let inventoryModel = require('../schemas/inventories')

/* GET all inventories */
router.get('/', async function (req, res, next) {
    try {
        let data = await inventoryModel.find().populate({
            path: 'product',
            select: 'title price description category images'
        });
        res.send(data);
    } catch (error) {
        res.status(500).send({
            message: error.message
        })
    }
});

/* GET inventory by ID */
router.get('/:id', async function (req, res, next) {
    try {
        let id = req.params.id;
        let result = await inventoryModel.findById(id).populate({
            path: 'product',
            select: 'title price description category images'
        });
        if (result) {
            res.send(result)
        } else {
            res.status(404).send({
                message: "INVENTORY NOT FOUND"
            })
        }
    } catch (error) {
        res.status(404).send({
            message: error.message
        })
    }
});

/* ADD STOCK - Increase stock by quantity */
router.post('/add_stock', async function (req, res, next) {
    try {
        let productId = req.body.product;
        let quantity = req.body.quantity;
        
        if (!productId || quantity === undefined) {
            return res.status(400).send({
                message: "product and quantity are required"
            })
        }
        
        if (quantity < 0) {
            return res.status(400).send({
                message: "quantity must be greater than or equal to 0"
            })
        }
        
        let result = await inventoryModel.findOneAndUpdate(
            { product: productId },
            { $inc: { stock: quantity } },
            { new: true }
        ).populate({
            path: 'product',
            select: 'title price description category images'
        });
        
        if (result) {
            res.send(result)
        } else {
            res.status(404).send({
                message: "INVENTORY NOT FOUND"
            })
        }
    } catch (error) {
        res.status(500).send({
            message: error.message
        })
    }
});

/* REMOVE STOCK - Decrease stock by quantity */
router.post('/remove_stock', async function (req, res, next) {
    try {
        let productId = req.body.product;
        let quantity = req.body.quantity;
        
        if (!productId || quantity === undefined) {
            return res.status(400).send({
                message: "product and quantity are required"
            })
        }
        
        if (quantity < 0) {
            return res.status(400).send({
                message: "quantity must be greater than or equal to 0"
            })
        }
        
        // Check current stock before reducing
        let inventory = await inventoryModel.findOne({ product: productId });
        
        if (!inventory) {
            return res.status(404).send({
                message: "INVENTORY NOT FOUND"
            })
        }
        
        if (inventory.stock < quantity) {
            return res.status(400).send({
                message: `Insufficient stock. Available: ${inventory.stock}, Requested: ${quantity}`
            })
        }
        
        let result = await inventoryModel.findOneAndUpdate(
            { product: productId },
            { $inc: { stock: -quantity } },
            { new: true }
        ).populate({
            path: 'product',
            select: 'title price description category images'
        });
        
        res.send(result)
    } catch (error) {
        res.status(500).send({
            message: error.message
        })
    }
});

/* RESERVATION - Decrease stock and increase reserved by quantity */
router.post('/reservation', async function (req, res, next) {
    try {
        let productId = req.body.product;
        let quantity = req.body.quantity;
        
        if (!productId || quantity === undefined) {
            return res.status(400).send({
                message: "product and quantity are required"
            })
        }
        
        if (quantity < 0) {
            return res.status(400).send({
                message: "quantity must be greater than or equal to 0"
            })
        }
        
        // Check current stock before reserving
        let inventory = await inventoryModel.findOne({ product: productId });
        
        if (!inventory) {
            return res.status(404).send({
                message: "INVENTORY NOT FOUND"
            })
        }
        
        if (inventory.stock < quantity) {
            return res.status(400).send({
                message: `Insufficient stock. Available: ${inventory.stock}, Requested: ${quantity}`
            })
        }
        
        let result = await inventoryModel.findOneAndUpdate(
            { product: productId },
            { 
                $inc: { 
                    stock: -quantity,
                    reserved: quantity
                } 
            },
            { new: true }
        ).populate({
            path: 'product',
            select: 'title price description category images'
        });
        
        res.send(result)
    } catch (error) {
        res.status(500).send({
            message: error.message
        })
    }
});

/* SOLD - Decrease reserved and increase soldCount by quantity */
router.post('/sold', async function (req, res, next) {
    try {
        let productId = req.body.product;
        let quantity = req.body.quantity;
        
        if (!productId || quantity === undefined) {
            return res.status(400).send({
                message: "product and quantity are required"
            })
        }
        
        if (quantity < 0) {
            return res.status(400).send({
                message: "quantity must be greater than or equal to 0"
            })
        }
        
        // Check current reserved before decreasing
        let inventory = await inventoryModel.findOne({ product: productId });
        
        if (!inventory) {
            return res.status(404).send({
                message: "INVENTORY NOT FOUND"
            })
        }
        
        if (inventory.reserved < quantity) {
            return res.status(400).send({
                message: `Insufficient reserved. Available: ${inventory.reserved}, Requested: ${quantity}`
            })
        }
        
        let result = await inventoryModel.findOneAndUpdate(
            { product: productId },
            { 
                $inc: { 
                    reserved: -quantity,
                    soldCount: quantity
                } 
            },
            { new: true }
        ).populate({
            path: 'product',
            select: 'title price description category images'
        });
        
        res.send(result)
    } catch (error) {
        res.status(500).send({
            message: error.message
        })
    }
});

module.exports = router;
