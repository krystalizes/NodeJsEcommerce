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
            res.redirect('/products/stored');
        } catch (error) {
            console.error(error);
            res.status(500).send(error);
        }
    }
    // GET /products/:id/edit
    async edit(req, res, next) {
        try {
            const categories = await Category.find({});
            const product = await Product.findById(req.params.id);
            res.render('admin/edit', {
                categories: multipleMongooseToObject(categories),
                product: mongooseToOject(product),
            });
        } catch (error) {
            next(error);
        }
    }
    // PUT /products/:id
    async update(req, res, next) {
        const {
            name,
            description,
            price,
            amount,
            category,
            delImageUrl,
            saveImageUrl,
        } = req.body;
        try {
            const urlDelImgs = delImageUrl.split(',');
            const urlSaveImgs = saveImageUrl.split(',');
            const uploadedImages = [];
            urlSaveImgs.forEach((url) => {
                const parts = url.split('/');
                const productPart =
                    parts[parts.length - 2] +
                    '/' +
                    parts[parts.length - 1].split('.')[0];
                uploadedImages.push({
                    url: url,
                    public_id: productPart,
                });
            });
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
            await Product.updateOne(
                { _id: req.params.id },
                {
                    name,
                    description,
                    image: uploadedImages,
                    price,
                    amount,
                    category,
                },
            );
            for (const url of urlDelImgs) {
                const parts = url.split('/');
                const productPart =
                    parts[parts.length - 2] +
                    '/' +
                    parts[parts.length - 1].split('.')[0];
                await cloudinary.uploader.destroy(productPart);
            }
            console.log('Product edited successfully');
            res.redirect('/products/stored');
        } catch (error) {
            console.error(error);
            res.status(500).send(error);
        }
    }
    // DELETE /products/:id
    delete(req, res, next) {
        Product.delete({ _id: req.params.id })
            .then(() => res.redirect('back'))
            .catch(next);
    }
    // DELETE /products/:id/force
    forceDelete(req, res, next) {
        Product.findOneWithDeleted({ _id: req.params.id })
            .then((product) => {
                const publicIds = product.image.map((img) => img.public_id);
                const deletePromises = publicIds.map((publicId) =>
                    cloudinary.uploader.destroy(publicId),
                );
                return Promise.all(deletePromises);
            })
            .then(() => Product.deleteOne({ _id: req.params.id }))
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
                Product.findWithDeleted({ _id: { $in: req.body.productIds } })
                    .then((products) => {
                        const deletePromises = products.map((product) => {
                            const publicIds = product.image.map(
                                (img) => img.public_id,
                            );
                            const deleteImagePromises = publicIds.map(
                                (publicId) =>
                                    cloudinary.uploader.destroy(publicId),
                            );
                            return Promise.all(deleteImagePromises);
                        });
                        return Promise.all(deletePromises);
                    })
                    .then(() =>
                        Product.deleteMany({
                            _id: { $in: req.body.productIds },
                        }),
                    )
                    .then(() => res.redirect('back'))
                    .catch(next);
                break;
            default:
                res.json({ message: 'Action invalid' });
        }
    }
}
module.exports = new ProductsController();
