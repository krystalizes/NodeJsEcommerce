// const Course = require('../models/Courses');
const { multipleMongooseToObject } = require('../../utils/mongoose');
class SitesController {
    index(req, res, next) {
        res.render('home');
    }
    //GET /home
    // async index(req, res, next) {
    //     try {
    //         await Course.find({})
    //             .then((courses) => {
    //                 res.render('home', {
    //                     courses: multipleMongooseToObject(courses),
    //                 });
    //             })
    //             .catch(next);
    //     } catch (e) {
    //         console.log('error');
    //     }
    // }
    // //GET /search/:slug
    // search(req, res) {
    //     res.render('search');
    // }
}
module.exports = new SitesController();
