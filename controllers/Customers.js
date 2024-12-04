const mongoose   = require('mongoose');
const UserModel  = mongoose.model('users');
const helper          = require('../helpers/my_helper');
const { orderProducts } = require('../models/DatabaseModel');
const CUSTOMER ={};

CUSTOMER.customers = async (req, res) => {
    res.render('backend/customers_list', {
            viewTitle : 'Customers',
            pageTitle : 'Customers List'
    });
};

CUSTOMER.customersList = async (req, res) => {
    try {
        var query = {};
        query['role'] = 3;

        // Define pagination
        var start = parseInt(req.query.start) || 0;
        var dataLimit = parseInt(req.query.length) || 10;

        // Global search
        if (req.query.search && req.query.search.value) {
            var text = req.query.search.value;
            query['$or'] = [
                { fullname: { $regex: text, $options: 'i' } },
                { email: { $regex: text, $options: 'i' } },
                { mobile: { $regex: text, $options: 'i' } }
            ];
        }

        // Fetch data
        const result = await UserModel.find(query)
            .skip(start)
            .limit(dataLimit)
            .sort({ _id: -1 });

        // Prepare response
        let users = [];
        for (const element of result) {
            let totalOrder = await orderProducts.countDocuments({ order_uid: element._id });

            users.push({
                _id: element._id,
                fullname: element.fullname,
                role: element.role,
                email: element.email,
                mobile: element.mobile,
                password: element.password,
                profile_image: element.profile_image,
                address: element.address,
                city: element.city,
                postal_code: element.postal_code,
                country: element.country,
                state: element.state,
                gst_no: element.gst_no,
                status: element.status,
                verify_otp: element.verify_otp,
                resetPasswordToken: element.resetPasswordToken,
                firebase_token: element.firebase_token,
                createdAt: element.createdAt,
                updatedAt: element.updatedAt,
                totalOrder: totalOrder
            });
        }

        res.status(200).json(users); 
    } catch (err) {
        res.status(500).json({ status: 0, message: 'Error: ' + err.message });
    }
};


  CUSTOMER.deleteCustomer = async (req, res) => {
    if (!req.body.id) {
        res.json({
            status:0,
            message: 'Customer id is missing.',
            data: ''
        });
        return;
    }
    let cust_id = req.body.id;

        UserModel.findOneAndDelete({'_id':cust_id}, (err, cust) => {
            if(err) {
                res.send({ status:0,'message':err,'data':''})
            } else {
               // console.log(cust)
                res.send({ status: 1,'message':'Customer Deleted Successfully','data':''})
            }
        })
    };




    module.exports = CUSTOMER;