const { Router } = require('express');
const express    = require('express');
const router     = express.Router();
const mongoose   = require('mongoose');
const moment            = require('moment'); 
const UserModel  = mongoose.model('users');
const categoryModel  = mongoose.model('category');
const subCategoryModel  = mongoose.model('sub_category');
const brandModel = mongoose.model('brands');
const productsModel  = mongoose.model('products');
const ordersModel  = mongoose.model('orders');
const courierServicesModel  = mongoose.model('courier_services');
const {validationResult} = require('express-validator');
const notificationsModel  = mongoose.model('notifications');
const ordersInvoiceModel     = mongoose.model('orders_invoice');
const outstandingsModel  = mongoose.model('outstandings');
const currenciesModel   = mongoose.model('currencies');
//const API        = require('../controllers/Api');
const helper          = require('../helpers/my_helper');
const config     = require('../config/config');
const API = require('./Api');
const { orderProducts, outstandings } = require('../models/DatabaseModel');
const payModeArr = helper.paymentMode;
const ORDERS = {};

ORDERS.orders = async (req, res) => {
    let targetVisible = 9;
    if(await helper.isAdmin(req)){
        targetVisible = '';
    }
    let courierServices = await courierServicesModel.find({status : 1}).exec();
    res.render('backend/orders_list', {
            viewTitle : 'Orders',
            pageTitle : 'Orders',
            courierServices : courierServices,
            targetVisible : targetVisible,
    });
};

ORDERS.orderTransactions = async (req, res) => {
    let seller_id = '';
    if(req.params.seller_id){
        seller_id = req.params.seller_id;
    }
    res.render('backend/order_transaction', {
            viewTitle : 'Orders Transactions',
            pageTitle : 'Orders Transactions',
            seller_id : seller_id
    });
};



ORDERS.sellerOrdersList = async (req, res) => {
    try {
        let orderStatus = req.params.status;
        let query =  {seller_id : await helper.uid(req)};;
        if(await helper.isAdmin(req)){
            query = {};
        }

        query.order_status = orderStatus;

        // array of columns that you want to show in table
        columns = ['fullname'];
        var start = req.query.start;
        var dataLimit = req.query.length;
        // check if global search is enabled and it's value is defined
        if (typeof req.query.search !== 'undefined' && req.query.search.value != '') {

            // get global search value
            var text = req.query.search.value;

            for (var i=0; i<columns.length; i++) { //req.query.columns
                requestColumn = req.query.columns[i];
                
                column = columns[requestColumn.data];

                // if search is enabled for that particular field then create query
                if (requestColumn.searchable == 'true') {
                     query[column] = {
                        $regex: '.*'+ text +'.*', $options:'i',
                    };
                }
            }
        }
        await orderProducts.find(query).populate('seller_id','fullname').populate('order_id','order_uniqueid payment_status payment_mode').populate('order_vid','pro_subtitle pro_sku').populate({ path: "order_uid", match: query  , select: "fullname" }).sort({"group.nome": "asc"}).skip(start).limit(dataLimit).sort({ _id : 'desc' }).then(async (result)=>{
          
            var mytable = {
                draw:req.query.draw,
                recordsTotal:0,
                recordsFiltered:0,
                data:[],
            }

            mytable.recordsTotal    = await orderProducts.countDocuments(query);
            mytable.recordsFiltered = await orderProducts.countDocuments(query);

           if(result.length > 0){
              //  console.log(result);
                let currency_symbol = "$";
                let currencies = await currenciesModel.findOne({status : 1});
                if(currencies){
                    currency_symbol = currencies.currency_symbol;
                }
                result.forEach(function(element,key) {
                    //if(element.order_uid){
                        let lable = '';
                        let track = '';
                        let returnBtn = '';
                        let refundBtn = '';
                        if(element.order_status == 8){
                            returnBtn = `<a href="javascript:;" title="Accept Return" class="AcceptReturn" action="6"  url="orders/returnRequestAccept" data-order-id="${element._id}"><i class="fas fa-map-marker"></i></a>`;
                        }

                        if(element.order_status == 7){
                            refundBtn = `<a  href="javascript:;" title="Generete Refund" class="generateRefund" action="6"  url="orders/generateRefund" data-order-id="${element._id}"><i class="fas fa-map-marker"></i></a>`;
                        }

                        let invoice = `<a href="javascript:;" title="View Invoice" class="viewInvoice" url="orders/view-invoice" data-invoice-id="${element.invoice_id}"><i class="fas fa-file-invoice"></i></a>`;

                        let checkBox = `<input class="checkedOrder" value="${element._id}" id="${element._id}" type="checkbox"> `;
                        if(element.order_status ==4){
                            lable = `<a href="javascript:;" title="Generate Lable" class="generateLable" url="orders/generateLabel" data-order-id="${element._id}"><i class="fas fa fa-tag"></i></a>`;
                            track = `<a href="javascript:;" title="Add Tracking Id" class="AddTrackingDetail" action="5"  url="orders/updateOrderStatus" data-order-id="${element._id}"><i class="fas fa-map-marker"></i></a>`;
                            checkBox ='';
                        }
                        const inArr = [1, 6, 7, 8];
                        if(inArr.includes(element.order_status)){
                            checkBox ='';
                        }
                        let payStatus = 'Unpaid';
                        if(element.order_id && element.order_id.payment_status==1){

                            payStatus = 'Paid';
                        }


                        mytable.data[key] = [checkBox+''+ ++start,
                                          (element.order_id) ? element.order_id.order_uniqueid :'',
                                          (element.order_vid) ? element.order_vid.pro_subtitle : '',
                                          (element.order_vid) ? element.order_vid.pro_sku : '',
                                          element.prod_quantity,
                                          currency_symbol+''+element.prod_price,
                                          currency_symbol+''+element.prod_subtotal,
                                          (element.order_uid) ? element.order_uid.fullname : '',
                                          moment(element.createdAt).format('DD-MMM-YYYY HH:MM'),
                                          (element.seller_id) ? element.seller_id.fullname : '',
                                          `<label class="mb-0 badge badge-${helper.lableClass[element.order_status]}" title="" data-original-title="Pending">${helper.orderStatusLable[element.order_status]}</label>` ,
                                          payStatus,
                                          (element.order_id) ? element.order_id.payment_mode : '',
                                          invoice + ' ' + lable + ' '+ track +' '+ returnBtn +' '+ refundBtn
                                        ];
                    //}
                }); 

                res.status(200).json(mytable);
                  
            } else {
                res.status(200).json(mytable);
            }
        });
      } catch (err) {
        res.status(401).json({ status : 0, message : 'error '+ err });
      }
  };


  ORDERS.ordersList = async (req, res) => {
    try {
        
        var query = {},

        // array of columns that you want to show in table
        columns = ['customer_name'];
        var start = req.query.start;
        var dataLimit = req.query.length;
        // check if global search is enabled and it's value is defined
        if (typeof req.query.search !== 'undefined' && req.query.search.value != '') {

            // get global search value
            var text = req.query.search.value;

            
            for (var i=0; i<req.query.columns.length; i++) {
                requestColumn = req.query.columns[i];
                column = columns[requestColumn.data];

                // if search is enabled for that particular field then create query
                if (requestColumn.searchable == 'true') {
                    query[column] = {
                        $regex: text,
                    };
                }
            }
        }
        await ordersModel.find(query).skip(start).limit(dataLimit).sort({ _id : 'desc' }).then(async (result)=>{
            var mytable = {
                draw:req.query.draw,
                recordsTotal:0,
                recordsFiltered:0,
                data:[],
            }

            mytable.recordsTotal    = await ordersModel.countDocuments();
            mytable.recordsFiltered = await ordersModel.countDocuments(query);

           if(result.length > 0){
                result.forEach(function(element,key) {
            
                    mytable.data[key] = [ ++start,
                                          element._id,
                                          element.order_date,
                                          element.customer_name,
                                          element.order_amount,
                                          element.paymet_status,
                                          element.order_status,
                                          `<a href="/orders/edit-order/${element._id}" title="Edit" class="editOrder"><i class="fas fa-edit"></i></a>`
                                        ];
                }); 

                res.status(200).json(mytable);
                  
            } else {
                res.status(200).json(mytable);
            }
        });
      } catch (err) {
        res.status(401).json({ status : 0, message : 'error '+ err });
      }
  };
  

  ORDERS.updateOrderStatus = async (req, res) => {
      try{
    if(!req.body.order_ids){
        res.json({
            status:0,
            message: 'Order id is missing.',
        });
        return;
    }else if(!req.body.status){
        res.json({
            status:0,
            message: 'status value is missing.',
        });
        return;
    }

    let ids = req.body.order_ids;
    const idsArr = ids.split(',');
    let orderStatus = req.body.status;
    let updateData = {};
    updateData.order_status = orderStatus;
    updateData.cancel_reason = null; // 6 = cancel

    if(req.body.tracking_id){
        updateData.order_tracking_id = req.body.tracking_id;
    }

    if(req.body.courier_service){
        updateData.courier_service =  req.body.courier_service;
    }
    let cancelingCharge = 0; // in percent
    let cancelCharge = await helper.getWebSetting('cancellation_charges');
    if(cancelCharge){
        cancelingCharge = cancelCharge;
    }


    let salesCommision = 0;
    let saleCommi = await helper.getWebSetting('sales_commission');
    if(saleCommi){
        salesCommision = saleCommi;
    }


    for(const id of idsArr){
        let orderDetails =  await orderProducts.findOne({_id : id}).populate('order_id', 'payment_mode').populate('order_vid', 'pro_subtitle');
        if(orderDetails){
            updateData.trackingDetails =  orderDetails.trackingDetails;

            if(orderStatus ==1){    //orderStatus = 1 for delivered

                updateData.trackingDetails.delivered = new Date();
                console.log(orderDetails.order_id.payment_mode);
                if(orderDetails.order_id.payment_mode == 'COD'){

                    let totalAmt = orderDetails.prod_subtotal
                    let debitCommission = ( parseFloat(totalAmt) * parseFloat(salesCommision) / 100 ).toFixed(2);

                    let commission = {maine_orderid : orderDetails.order_id._id,
                        invoice_id     : orderDetails.invoice_id, 
                        sub_orderid    : orderDetails._id, 
                        seller_id      : orderDetails.seller_id,
                        debit          : debitCommission, 
                        credit         : 0,
                        entry_againts  : 4 ,   // 4 = Sales Commision
                        remark         : "Sales Commision",
                        status         : 1
                        };
                    await helper.insertOutstanding(commission);

                    let subTotalAmt  = parseFloat(totalAmt) - parseFloat(debitCommission);

                    let outstanding = {maine_orderid : orderDetails.order_id._id,
                        invoice_id     : orderDetails.invoice_id, 
                        sub_orderid    : orderDetails._id, 
                        seller_id      : orderDetails.seller_id,
                        debit          : 0, 
                        credit         : subTotalAmt,
                        entry_againts  : 1 ,   // 1 = new order
                        remark         : "New Order",
                        status         : 1
                    };
                    await helper.insertOutstanding(outstanding); 
                    updateData.payment_status = 1;
                }  
               

            }else if(orderStatus ==3){  //orderStatus = 3 for confirmed

                updateData.trackingDetails.confirmed = new Date();

            }else  if(orderStatus == 4){  //orderStatus = 4 for RTD

                updateData.trackingDetails.readytoDispatch = new Date();

            }else  if(orderStatus == 5){  //orderStatus = 5 for dispatched

                updateData.trackingDetails.dispatched = new Date();
                
            }else  if(orderStatus == 6 && orderDetails.order_id.payment_mode == 'COD'){   //payment_mode = 1 for COD & orderStatus = 6 for canceled

                updateData.trackingDetails.canceled = new Date();
                updateData.cancel_reason = 'Canceled By Seller';

                await helper.deductInventory(orderDetails.order_vid, orderDetails.prod_quantity);

                let totalAmt = orderDetails.prod_subtotal
                let debitCharge = ( parseFloat(totalAmt) * parseFloat(cancelingCharge) / 100 ).toFixed(2);

                let outstanding = {maine_orderid : orderDetails.order_id._id,
                    invoice_id     : orderDetails.invoice_id, 
                    sub_orderid    : orderDetails._id, 
                    seller_id      : orderDetails.seller_id,
                    debit          : debitCharge, 
                    credit         : 0,
                    entry_againts  : 3 ,   // 3 = Cancellation Charges
                    remark         : "Canceling Charge",
                    status         : 1
                  };
                await helper.insertOutstanding(outstanding);


            }else  if(orderStatus == 6 && payModeArr.includes(orderDetails.order_id.payment_mode)){    //payment_mode = 2 for RAZORPAY & orderStatus = 6 for canceled
                
                updateData.trackingDetails.refund_requested = new Date();
                updateData.order_status = 7;
                updateData.cancel_reason = 'Canceled By Seller';

                await helper.deductInventory(orderDetails.order_vid, orderDetails.prod_quantity);

                let totalAmt = orderDetails.prod_subtotal
                let debitCharge = ( parseFloat(totalAmt) * parseFloat(cancelingCharge) / 100 ).toFixed(2);

                let outstanding = {maine_orderid : orderDetails.order_id._id,
                    invoice_id     : orderDetails.invoice_id, 
                    sub_orderid    : orderDetails._id, 
                    seller_id      : orderDetails.seller_id,
                    debit          : debitCharge, 
                    credit         : 0,
                    entry_againts  : 3 ,   // 3 = Cancellation Charges
                    remark         : "Canceling Charge",
                    status         : 1
                  };
                await helper.insertOutstanding(outstanding);

                
            }    
            try{
                await orderProducts.updateOne({ "_id": id },updateData, {new: true}).then( async (result) =>{
                    let insertNoti = new notificationsModel({   noti_status : orderStatus,
                                                                noti_type: 1,
                                                                from_user: orderDetails.seller_id,
                                                                to_user: orderDetails.order_uid,
                                                                reference_id: orderDetails._id,
                                                            });
                                                        
                    insertNoti.save();
                    let token =  await helper.getUserDetails(orderDetails.order_uid, 'firebase_token');

                    let notiMsg = { title : orderDetails.order_vid.pro_subtitle,  //'Order '+ helper.orderStatusLable[orderStatus],
                                    image : await helper.getVariantSingleImage(orderDetails.order_vid),
                                    body : await helper.getNotiMsg(orderStatus, type = 1) // type 1 for order
                                };
                    await helper.sendNotification(notiMsg, token);
                    
                }).catch(err=>{
                    res.json({ status: 0 , message: 'Something went wrong. '+ err.message, data: [] });
                }); 
            } catch (err) {
                res.json({ status : 0, message : 'error '+ err.message });
            }  
        }
    }
    res.send({ status: 1,'message':'Order status updated Successfully.','data':[]});
} catch (err) {
    res.json({ status : 0, message : 'error '+ err.message });
}
    
};



ORDERS.returnRequestAccept = async (req, res) => {
    try{
        if(!req.body.order_ids){
            res.json({
                status:0,
                message: 'Order id is missing.',
            });
            return;
        }else if(!req.body.status){
            res.json({
                status:0,
                message: 'status value is missing.',
            });
            return;
        }

        let ids = req.body.order_ids;
        const idsArr = ids.split(',');
        let orderStatus = req.body.status;
        let updateData = {};
        updateData.order_status = orderStatus;
        let returnDetails = {};
        if(req.body.tracking_id){
                returnDetails.return_tracking_id = req.body.tracking_id;
        }

        if(req.body.courier_service){
                returnDetails.courier_service =  req.body.courier_service;
        }

        updateData.returnDetails = returnDetails;
        
        for(const id of idsArr){
            let orderDetails =  await orderProducts.findOne({_id : id}).populate('order_id', 'payment_mode payment_status').populate('order_vid', 'pro_subtitle');
            if(orderDetails){
                updateData.trackingDetails =  orderDetails.trackingDetails;

                if(orderStatus == 6 && orderDetails.order_id.payment_mode == 'COD' && orderDetails.order_id.payment_status == 2 ){  //payment_mode = 1 for COD and payment_status = 2 unpaid 
                    updateData.trackingDetails.canceled = new Date();

                }else  if(orderStatus == 6 && orderDetails.order_id.payment_mode == 'COD' && orderDetails.order_id.payment_status == 1){    //payment_mode = 1 for COD and payment_status = 1 paid 
                    updateData.trackingDetails.refund_requested = new Date();
                    updateData.order_status = 7;
                }else  if(orderStatus == 6 && payModeArr.includes(orderDetails.order_id.payment_mode)){    //payment_mode = 2 for RAZORPAY
                    updateData.trackingDetails.refund_requested = new Date();
                    updateData.order_status = 7;
                }  

                await helper.deductInventory(orderDetails.order_vid, orderDetails.prod_quantity);
                
                await orderProducts.findOneAndUpdate({ "_id": id },updateData, {new: true}).then(async (result) =>{
                    let insertNoti = new notificationsModel({   noti_status : orderStatus,
                                                                noti_type: 1,
                                                                from_user: orderDetails.seller_id,
                                                                to_user: orderDetails.order_uid,
                                                                reference_id: orderDetails._id,
                                                            });
                                                        
                    insertNoti.save();
                    let token =  await helper.getUserDetails(orderDetails.order_uid, 'firebase_token');                                       
                    let notiMsg = { title :  orderDetails.order_vid.pro_subtitle, //'Order '+ helper.orderStatusLable[orderStatus],
                                    image : await helper.getVariantSingleImage(orderDetails.order_vid),
                                    body : await helper.getNotiMsg(orderStatus, type = 1) // type 1 for order
                                };
        
        
                    await helper.sendNotification(notiMsg, token);
                    
                }).catch(err=>{
                    res.json({ status: 0 , message: 'Something went wrong order cancel requested. '+ err.message, data: [] });
                });   
            }
        }
        res.send({ status: 1,'message':'Order status updated Successfully.','data':[]});
} catch (err) {
  res.status(401).json({ status : 0, message : 'error '+ err.message });
}
  
};


ORDERS.generateRefund = async (req, res) => {
    try{
        if(!req.body.order_ids){
            res.json({
                status:0,
                message: 'Order id is missing.',
            });
            return;
        }else if(!req.body.status){
            res.json({
                status:0,
                message: 'status value is missing.',
            });
            return;
        }

        let ids = req.body.order_ids;
        const idsArr = ids.split(',');
        let orderStatus = req.body.status;
        let updateData = {};
        updateData.order_status = orderStatus;
        for(const id of idsArr){
            let orderDetails =  await orderProducts.findOne({_id : id}).populate('order_id', 'payment_mode payment_status').populate('order_vid', 'pro_subtitle');
            if(orderDetails){
                updateData.trackingDetails =  orderDetails.trackingDetails;
                if(orderStatus == 6){  //orderStatus = 6 for refund success
                    updateData.trackingDetails.canceled = new Date();
                    updateData.trackingDetails.refund_success = new Date();

                    let outstanding = {maine_orderid : orderDetails.order_id._id,
                        invoice_id     : orderDetails.invoice_id, 
                        sub_orderid    : orderDetails._id, 
                        seller_id      : orderDetails.seller_id,
                        debit          : orderDetails.prod_subtotal, 
                        credit         : 0,
                        entry_againts  : 2 ,   // 2 = refund
                        remark         : orderDetails.cancel_reason,
                        status         : 1
                      };
                    await helper.insertOutstanding(outstanding);
                }  
                
                await orderProducts.findOneAndUpdate({ "_id": id },updateData, {new: true}).then(async (result)=>{
                    let insertNoti = new notificationsModel({   noti_status : orderStatus,
                                                                noti_type: 1,
                                                                from_user: orderDetails.seller_id,
                                                                to_user: orderDetails.order_uid,
                                                                reference_id: orderDetails._id,
                                                            });
                                                        
                    insertNoti.save();
                    let token =  await helper.getUserDetails(orderDetails.order_uid, 'firebase_token'); 
                    let notiMsg = { title :  orderDetails.order_vid.pro_subtitle, //'Order '+ helper.orderStatusLable[orderStatus],
                                    image : await helper.getVariantSingleImage(orderDetails.order_vid),
                                    body : await helper.getNotiMsg(orderStatus, type = 1) // type 1 for order
                                };
        
        
                    await helper.sendNotification(notiMsg, token);
                    
                }).catch(err=>{
                    res.json({ status: 0 , message: 'Something went wrong order cancel requested. '+ err.message, data: [] });
                });   
            }
        }
        res.send({ status: 1,'message':'Order status updated Successfully.','data':[]});
} catch (err) {
  res.status(401).json({ status : 0, message : 'error '+ err.message });
}
  
};



ORDERS.generateLabel = async (req, res) => {

    if(!req.body.order_ids){
        res.json({
            status:0,
            message: 'Order id is missing.',
        });
        return;
    }
    let ids = req.body.order_ids;
    const idsArr = ids.split(',');
    let label = '';
    let webImages = await helper.getWebSetting('web_images');
    let label_logo = config.DEFAULT_LOGO;
    if(webImages && webImages.logo){ 
        label_logo = `/uploads/webimages/${webImages.logo}`;
    }

    let currency_symbol = "$";
    let currencies = await currenciesModel.findOne({status : 1});
    if(currencies){
        currency_symbol = currencies.currency_symbol;
    }

    for(const id of idsArr){
        
        await orderProducts.findOne({_id : id}).populate('seller_id', 'fullname address city country postal_code gst_no').populate('order_uid', 'fullname address city country state postal_code').populate('order_id', 'order_uniqueid shipping_address billing_address').populate('order_vid', 'pro_subtitle').then(async (result)=>{
            if(result){
                
                let country = result.order_uid.country ? result.order_uid.country : '';
                let state = result.order_uid.state ? result.order_uid.state : '';
                let city = result.order_uid.city ? result.order_uid.city : '';
                let postal_code = result.order_uid.postal_code ? result.order_uid.postal_code : '';

               label += `<div class="ecom_lp_wrap">
                    <div class="ecom_lp_inner">
                        <div class="ecom_lp_logoW">
                            <div class="text-center">
                                <img src="${label_logo}" alt="logo">
                            </div>                            
                        </div>
                        <div class="ecom_lp_addresWrap">
                            <div class="ecom_lp_addresL">
                                <div class="ecom_lp_addresHW">
                                    <div class="ecom_lp_addresHWL">
                                        <h2 class="ecom_lp_heading primary-color">Seller Address:</h2>
                                    </div>                                    
                                    <div class="ecom_lp_addresHWR">
                                        <h2 class="ecom_lp_ttl">${result.seller_id.fullname}</h2>
                                        <p class="ecom_lp_p">${result.seller_id.address}</p>
                                        <p class="ecom_lp_p">${result.seller_id.postal_code}, ${result.seller_id.city}, ${result.seller_id.country}</p>
                                    </div>
                                </div>
                            </div>
                            <div class="ecom_lp_addresR">
                                <div class="ecom_lp_addresHW">
                                    <div class="ecom_lp_addresHWL">
                                        <h2 class="ecom_lp_heading primary-color">Buyer Address:</h2>
                                    </div>                                    
                                    <div class="ecom_lp_addresHWR">
                                        <h2 class="ecom_lp_ttl">${result.order_uid.fullname}</h2>
                                        <p class="ecom_lp_p">${result.order_id.shipping_address}</p>
                                        <p>${country} ${state} ${city} ${postal_code}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="ecom_lp_orderWrap">                            
                            <div class="ecom_lp_addresHW">
                                <div class="ecom_lp_addresHWL">
                                    <h2 class="ecom_lp_heading primary-color">Order Number:</h2>
                                </div>                                    
                                <div class="ecom_lp_addresHWR">
                                    <p class="ecom_lp_p">${result.order_id.order_uniqueid}</p>
                                </div>
                            </div>
                            <div class="ecom_lp_addresHW">
                                <div class="ecom_lp_addresHWL">
                                    <h2 class="ecom_lp_heading primary-color">Invoice Number:</h2>
                                </div>                                    
                                <div class="ecom_lp_addresHWR">
                                    <p class="ecom_lp_p">${result.prod_unique_id}</p>
                                </div>
                            </div>`;
                            if(result.seller_id.gst_no){
                                label += `<div class="ecom_lp_addresHW">
                                            <div class="ecom_lp_addresHWL">
                                                <h2 class="ecom_lp_heading primary-color">GST Number:</h2>
                                            </div>                                    
                                            <div class="ecom_lp_addresHWR">
                                                <p class="ecom_lp_p">${result.seller_id.gst_no}</p>
                                            </div>
                                        </div>`;
                            }
                label +=`</div>
                        <div class="ecom_lp_tbleWrap">                            
                            <table class="table" cellspacing="0" cellpadding="10">
                                <tbody>
                                <tr>
                                  <th class="first">Products</th>
                                  <th class="first">Quantity</th>
                                  <th class="first">Price</th>
                                </tr>
                                <tr>
                                  <td>${result.order_vid.pro_subtitle}</td>
                                  <td>${result.prod_quantity}</td>
                                  <td>${currency_symbol}${result.prod_price}</td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="ecom_lp_bottmWrap">                            
                            <div class="text-right">
                                <p class="ecom_lp_p">Ordered Through</p>
                                <img src="${label_logo}" alt="logo" width="100px">
                            </div> 
                        </div>
                    </div>              
                </div>`;
                      
            }
        });
    }
    res.send({ status: 1,'message':'Label generated Successfully. Please print label.','data':label});
};

ORDERS.getInvoice = async (req, res) => {

    if(!req.body.invoice_id){
        res.json({
            status:0,
            message: 'Invoice id is missing.',
        });
        return;
    }
    let html = '';
    await ordersInvoiceModel.findOne({_id : req.body.invoice_id}).populate('seller_id', 'fullname address city country postal_code gst_no').populate('order_uid', 'fullname address city country state postal_code').populate('main_order_id', 'order_uniqueid shipping_address billing_address payment_mode').then(async (invoice)=>{
        if(invoice){
           await orderProducts.find({invoice_id : invoice._id}).populate('order_vid', 'pro_subtitle').then(async (result)=>{
                if(result){

                    let currency_symbol = "$";
                    let currencies = await currenciesModel.findOne({status : 1});
                    if(currencies){
                        currency_symbol = currencies.currency_symbol;
                    }
                    let payMode = invoice.main_order_id.payment_mode;
                    
                    let country = invoice.order_uid.country ? invoice.order_uid.country : '';
                    let state = invoice.order_uid.state ? invoice.order_uid.state : '';
                    let city = invoice.order_uid.city ? invoice.order_uid.city : '';
                    let postal_code = invoice.order_uid.postal_code ? invoice.order_uid.postal_code : '';

                    html = ` <div class="row">
                                <div class="col-lg-12">
                                    <div class="card">
                                        <div class="card-body">
                                            <div class="ad-invoice-title">
                                                <h4>Order ID - ${invoice.main_order_id.order_uniqueid}</h4>
                                            </div>
                                            <hr>
                                            <div class="row">
                                                <div class="col-sm-6 col-lg-6">
                                                    <h5 class="mb-2">Billed To:</h5>
                                                    <p>${invoice.order_uid.fullname}</p>
                                                    <p>${invoice.main_order_id.billing_address}</p>
                                                    <p>${country} ${state} ${city} ${postal_code}</p>
                                                </div>
                                                <div class="col-sm-6 col-lg-6 text-sm-end">
                                                    <h5 class="mb-2">Shipped To:</h5>
                                                    <p>${invoice.order_uid.fullname}</p>
                                                    <p>${invoice.main_order_id.shipping_address}</p>
                                                    <p>${country} ${state} ${city} ${postal_code}</p>
                                                </div>
                                            </div>
                                            <div class="row">
                                                <div class="col-sm-6 mt-3">
                                                    <h5 class="mb-2">Payment Method:</h5>
                                                    <p>${payMode}</p>
                                                </div>
                                                <div class="col-sm-6 mt-3 text-sm-end">
                                                    <h5 class="mb-2">Order Date:</h5>
                                                    <p>${moment(invoice.createdAt).format('DD-MMM-YYYY HH:MM')}</p>
                                                </div>
                                            </div>
                                            <div class="py-2 mt-3 mb-2">
                                                <h4 class="font-size-15">Order Summary</h4>
                                            </div>
                                            <div class="table-responsive">
                                                <table class="table table-styled mb-0">
                                                    <thead>
                                                        <tr>
                                                            <th style="width: 70px;">No.</th>
                                                            <th>Item</th>
                                                            <th class="text-end">Price</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>`;
                                    let i=1;
                                    let subTotal = 0;
                                    for(const prod of result){
                                        subTotal += parseFloat(prod.prod_price);
                                        html +=`<tr>
                                                    <td>${i++}</td>
                                                    <td>${prod.order_vid.pro_subtitle}</td>
                                                    <td class="text-end">${currency_symbol}${prod.prod_price}</td>
                                                </tr>`;
                                    }
                                    subTotal = subTotal.toFixed(2);
                                    html +=`<tr>
                                                <td colspan="2" class="text-end">Sub Total</td>
                                                <td class="text-end">${currency_symbol}${subTotal}</td>
                                            </tr>
                                            <!--tr>
                                                <td colspan="2" class="text-end">
                                                    <strong>Shipping</strong></td>
                                                <td class=" text-end">$14.00</td>
                                            </tr-->
                                            <tr>
                                                <td colspan="2" class="text-end">
                                                    <strong>Total</strong></td>
                                                <td class=" text-end"><h4 class="m-0">${currency_symbol}${subTotal}</h4></td>
                                            </tr>
                                            </tbody>
                                            </table>
                                            </div>
                                            <!--div class="d-print-none mt-2">
                                                <div class="float-end">
                                                    <a href="javascript:window.print()" class="btn btn-success waves-effect waves-light me-1"><i class="fa fa-print"></i></a>
                                                    <a href="javascript:;" class="btn btn-primary w-md waves-effect waves-light">Send</a>
                                                </div>
                                            </div-->
                                        </div>
                                    </div>
                                </div>
                        </div> `;
                }
            });
        }
    });
    
    res.send({ status: 1,'message':'Invoice generated Successfully.','data': html});
};

ORDERS.transactionsList = async (req, res) => {
    try {

        let seller_id = await helper.uid(req);
        if(req.query.seller_id && req.query.seller_id){
            seller_id = req.query.seller_id;
        }
        var query = {seller_id : seller_id};
        
        query.entry_againts = { $in : [1, 2, 3, 4]};
        // array of columns that you want to show in table
        columns = ['remark'];
        var start = req.query.start;
        var dataLimit = req.query.length;
        // check if global search is enabled and it's value is defined
        if (typeof req.query.search !== 'undefined' && req.query.search.value != '') {

            // get global search value
            var text = req.query.search.value;

            
            for (var i=0; i<req.query.columns.length; i++) {
                requestColumn = req.query.columns[i];
                column = columns[requestColumn.data];

                // if search is enabled for that particular field then create query
                if (requestColumn.searchable == 'true') {
                    query[column] = {
                        $regex: text,
                    };
                }
            }
        }
        await outstandingsModel.find(query).populate('sub_orderid','prod_unique_id order_uid').skip(start).limit(dataLimit).sort({ _id : 'asc' }).then(async (result)=>{
            var mytable = {
                draw:req.query.draw,
                recordsTotal:0,
                recordsFiltered:0,
                data:[],
            }

            mytable.recordsTotal    = await outstandingsModel.countDocuments(query);
            mytable.recordsFiltered = await outstandingsModel.countDocuments(query);
            
           if(result.length > 0){
                for(const [key ,element] of Object.entries(result)){
                     if( element.sub_orderid){
                        let customerName = await helper.getUserDetails(element.sub_orderid.order_uid, 'fullname');
                        mytable.data[key] = [ ++start,
                                            element.sub_orderid.prod_unique_id,
                                            customerName,
                                            element.debit,
                                            element.credit,
                                            element.balance,
                                            helper.entryAgaints[element.entry_againts],
                                            element.remark,
                                            moment(element.createdAt).format('DD-MMM-YYYY HH:MM'),
                                            ];
                                        }
                    
                }; 

                res.status(200).json(mytable);
                  
            } else {
                res.status(200).json(mytable);
            }
        });
      } catch (err) {
        res.status(401).json({ status : 0, message : 'error '+ err });
      }
};


module.exports = ORDERS;