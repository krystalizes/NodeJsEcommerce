const Product = require('../models/Products');
const Category = require('../models/Categories');
const { mongooseToOject } = require('../../utils/mongoose');
const { multipleMongooseToObject } = require('../../utils/mongoose');
const cloudinary = require('../../config/cloudinary/config');
class ProductsController {
    // // GET /courses/:slug
    // show(req, res, next) {
    //     Course.findOne({ slug: req.params.slug })
    //         .then((courses) => {
    //             res.render('courses/show', {
    //                 courses: mongooseToOject(courses),
    //             });
    //         })
    //         .catch(next);
    // }
    // GET /products/stored
    stored(req, res, next) {
        let productsFindAll = Product.find({});
        if (req.query.hasOwnProperty('_sort')) {
            productsFindAll = productsFindAll.sort({
                [req.query.column]: req.query.type,
            });
        }
        Promise.all([
            productsFindAll,
            Product.countDocuments(),
            Product.countDocumentsWithDeleted(),
        ])
            .then(([products, notDeletedCount, allCount]) => {
                const deletedCount = allCount - notDeletedCount;
                res.render('admin/stored-products', {
                    deletedCount: deletedCount,
                    products: multipleMongooseToObject(products),
                });
            })
            .catch(next);
    }
    // GET /products/trashed
    trashed(req, res, next) {
        Product.findDeleted({})
            .then((products) => {
                const deletedProducts = products.filter(
                    (product) => product.deleted,
                );
                res.render('admin/trashed-products', {
                    products: multipleMongooseToObject(deletedProducts),
                });
            })
            .catch(next);
    }
    // GET /products/create
    create(req, res, next) {
        Category.find({})
            .then((categories) => {
                res.render('admin/create', {
                    categories: multipleMongooseToObject(categories),
                });
            })
            .catch(next);
    }
    // POST /products/store
    async store(req, res, next) {
        const { name, description, price, amount, category } = req.body;
        try {
            const uploadedImages = [];
            for (const file of req.files) {
                const dataURI = `data:${file.mimetype};base64,${Buffer.from(file.buffer).toString('base64')}`;
                const results = await cloudinary.uploader.upload(dataURI, {
                    folder: 'products',
                    resource_type: 'auto',
                });
                uploadedImages.push({
                    url: results.secure_url,
                    public_id: results.public_id,
                });
            }
            const product = new Product({
                name,
                description,
                image: uploadedImages,
                price,
                amount,
                category,
            });
            await product.save();
            console.log('Product added successfully');
            // req.flash('success','Sản phẩm đã được thêm mới thành công!');
            res.redirect('/');
        } catch (error) {
            console.error(error);
            res.status(500).send(error);
        }
    }
    // // GET /courses/:id/edit
    // edit(req, res, next) {
    //     Course.findById(req.params.id)
    //         .then((course) => {
    //             res.render('courses/edit', {
    //                 course: mongooseToOject(course),
    //             });
    //         })
    //         .catch(next);
    // }
    // // PUT /courses/:id
    // update(req, res, next) {
    //     Course.updateOne({ _id: req.params.id }, req.body)
    //         .then(() => res.redirect('/me/stored-courses'))
    //         .catch(next);
    // }
    // DELETE /products/:id
    delete(req, res, next) {
        Product.delete({ _id: req.params.id })
            .then(() => res.redirect('back'))
            .catch(next);
    }
    // DELETE /products/:id/force
    forceDelete(req, res, next) {
        Product.deleteOne({ _id: req.params.id })
            .then(() => res.redirect('back'))
            .catch(next);
    }
    // PATCH /products/:id/restore
    restore(req, res, next) {
        Product.restore({ _id: req.params.id })
            .then(() => res.redirect('back'))
            .catch(next);
    }
    // POST /products/handle-form-action
    formAction(req, res, next) {
        switch (req.body.action) {
            case 'delete':
                Product.delete({ _id: { $in: req.body.productIds } })
                    .then(() => res.redirect('back'))
                    .catch(next);
                break;
            case 'restore':
                Product.restore({ _id: { $in: req.body.productIds } })
                    .then(() => res.redirect('back'))
                    .catch(next);
                break;
            case 'forceDelete':
                Product.deleteOne({ _id: { $in: req.body.productIds } })
                    .then(() => res.redirect('back'))
                    .catch(next);
                break;
            default:
                res.json({ message: 'Action invalid' });
        }
    }
}
module.exports = new ProductsController();
