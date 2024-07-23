
const CourierService = require('../models/DatabaseModel').courierServices;


const createOrUpdateCourierService = async (req, res) => {
    let postData = {
        service_name: req.body.service_name,
        email: req.body.email,
        password: req.body.password,
        phone_number: req.body.phone_number,
    };

    if (req.body.id && req.body.id !== '0') {
        try {
            const checkServiceExist = await CourierService.findOne({ service_name: req.body.service_name, _id: { $ne: req.body.id } });
            if (checkServiceExist) {
                return res.status(401).json({ status: 0, message: 'Courier Service already exists.', data: '' });
            }
            postData.updatedAt = Date.now();
            const updatedService = await CourierService.findOneAndUpdate({ _id: req.body.id }, postData, { new: true });
            res.status(200).json({ status: 1, message: 'Courier Service Updated Successfully!', data: updatedService });
        } catch (err) {
            res.status(500).json({ status: 0, message: 'Something went wrong in update courier service.', data: err.message });
        }
    } else {
        try {
            const checkServiceExist = await CourierService.findOne({ service_name: req.body.service_name });
            if (checkServiceExist) {
                return res.status(401).json({ status: 0, message: 'Courier Service already exists.', data: checkServiceExist });
            }
            const newService = await CourierService.create(postData);
            res.status(200).json({ status: 1, message: 'Courier Service Added Successfully!', data: newService });
        } catch (err) {
            res.status(500).json({ status: 0, message: 'Something went wrong in insert courier service.', data: err.message });
        }
    }
};


const getAllCourierServices = async (req, res) => {
    try {
        const courierServices = await CourierService.find({});
        res.render('backend/courier_services', {
            viewTitle: 'Courier Services',
            pageTitle: 'Courier Services List',
            courierServices: courierServices
        });
    } catch (err) {
        res.status(500).json({ status: 0, message: 'Failed to retrieve courier services.', data: err.message });
    }
};




module.exports = {
    createOrUpdateCourierService,
    getAllCourierServices
};
