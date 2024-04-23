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
    // GET /courses/create
    create(req, res, next) {
        Category.find({})
            .then((categories) => {
                res.render('products/create', {
                    categories: multipleMongooseToObject(categories),
                });
            })
            .catch(next);
    }
    // POST /courses/store
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
    // // DELETE /courses/:id
    // delete(req, res, next) {
    //     Course.delete({ _id: req.params.id })
    //         .then(() => res.redirect('back'))
    //         .catch(next);
    // }
    // // DELETE /courses/:id/force
    // forceDelete(req, res, next) {
    //     Course.deleteOne({ _id: req.params.id })
    //         .then(() => res.redirect('back'))
    //         .catch(next);
    // }
    // // PATCH /courses/:id/restore
    // restore(req, res, next) {
    //     Course.restore({ _id: req.params.id })
    //         .then(() => res.redirect('back'))
    //         .catch(next);
    // }
    // // POST /courses/handle-form-action
    // formAction(req, res, next) {
    //     switch (req.body.action) {
    //         case 'delete':
    //             Course.delete({ _id: { $in: req.body.courseIds } })
    //                 .then(() => res.redirect('back'))
    //                 .catch(next);
    //             break;
    //         case 'restore':
    //             Course.restore({ _id: { $in: req.body.courseIds } })
    //                 .then(() => res.redirect('back'))
    //                 .catch(next);
    //             break;
    //         case 'forceDelete':
    //             Course.deleteOne({ _id: { $in: req.body.courseIds } })
    //                 .then(() => res.redirect('back'))
    //                 .catch(next);
    //             break;
    //         default:
    //             res.json({ message: 'Action invalid' });
    //     }
    // }
}
module.exports = new ProductsController();
