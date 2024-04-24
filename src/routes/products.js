const express = require('express');
const router = express.Router();
const productsController = require('../app/controllers/ProductsController');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
router.get('/create', productsController.create);
router.post('/store', upload.array('image'), productsController.store);
router.get('/stored', productsController.stored);
router.get('/trashed', productsController.trashed);
// router.get('/:id/edit', productsController.edit);
router.post('/handle-form-action', productsController.formAction);
// router.put('/:id', productsController.update);
router.patch('/:id/restore', productsController.restore);
router.delete('/:id', productsController.delete);
router.delete('/:id/force', productsController.forceDelete);
// router.get('/:slug', productsController.show);

module.exports = router;
