
const CourierService = require('../models/DatabaseModel').courierServices;
const CourierBoys = require('../models/DatabaseModel').courierBoys;

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

const createOrUpdateCourierBoy = async (req, res) => {
    // Extract the courier service ID from the session
    const courierServiceId = req.session.user && req.session.user.user_id;
 
    if (!courierServiceId) {
        return res.status(403).json({ status: 0, message: 'Unauthorized access.' });
    }
 
    const {service_name, email, password, phone_number, address, city, postal_code, country, state, id } = req.body;
console.log('requestbody is',req.body);
    // Prepare the data for creating or updating a courier boy
    const postData = {
        service_name,
        email,
        password,
        phone_number,
        address,
        city,
        postal_code,
        country,
        state,
        courierService: courierServiceId  // Assign the logged-in courier service ID
    };
 
    try {
        if (id && id !== '0') {
            // Check for duplicate courier boys with the same email, excluding the current ID
            const checkServiceExist = await CourierBoys.findOne({ email, _id: { $ne: id } });
            if (checkServiceExist) {
                return res.status(401).json({ status: 0, message: 'Courier Boy already exists.', data: '' });
            }
 
            postData.updatedAt = Date.now();
            // Update the existing courier boy
            const updatedService = await CourierBoys.findOneAndUpdate({ _id: id }, postData, { new: true });
            res.status(200).json({ status: 1, message: 'Courier Boy Updated Successfully!', data: updatedService });
        } else {
            // Check if a courier boy with the same email already exists
            const checkServiceExist = await CourierBoys.findOne({ email });
            if (checkServiceExist) {
                return res.status(401).json({ status: 0, message: 'Courier Boy already exists.', data: checkServiceExist });
            }
 
            // Create a new courier boy
            const newService = await CourierBoys.create(postData);
            res.status(200).json({ status: 1, message: 'Courier Boy Added Successfully!', data: newService });
        }
    } catch (err) {
        res.status(500).json({ status: 0, message: 'Something went wrong.', data: err.message });
    }
};
const getAllCourierBoys = async (req, res) => {
    try {
        // Get the logged-in courier service ID from the session or request object
        const courierServiceId = req.session.user.user_id; // Assuming you store user_id in the session
 
        // Find courier boys associated with the logged-in courier service
        const courierBoys = await CourierBoys.find({ courierService: courierServiceId });
 
        res.render('backend/courier_boys', {
            viewTitle: 'Courier Boys',
            pageTitle: 'Courier Boys List',
            courierServices: courierBoys
        });
    } catch (err) {
        res.status(500).json({ status: 0, message: 'Failed to retrieve courier boys.', data: err.message });
    }
};




module.exports = {
    createOrUpdateCourierService,
    createOrUpdateCourierBoy,
    getAllCourierServices,
    getAllCourierBoys
};
