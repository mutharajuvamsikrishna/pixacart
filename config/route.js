const router    = require('express').Router();
const multer    = require('multer');
const path      = require('path');
const controllers = {
    auth        : require('../controllers/Auth'),
    admin       : require('../controllers/Admin'),
    middleware  : require('../controllers/Middleware'),
    dashboard   : require('../controllers/Dashboard'),
    products    : require('../controllers/Products'),
    orders      : require('../controllers/Orders'),
    customer    : require('../controllers/Customers'),
    seller    : require('../controllers/Seller'),
    api         : require('../controllers/Api'),
    settings    : require('../controllers/Settings'),
    support     : require('../controllers/Support'),
}
const validationRules   =  require('./ValidationRules');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let folder   = (file.fieldname).split('_');
        cb(null, './public/uploads/'+ folder[0]);
    },
    filename:(req,file,cb)=>{
        cb(null, Date.now()+ path.extname(file.originalname));
        // cb(null, file.fieldname+'_'+ Date.now()+ path.extname(file.originalname));
    }
});

var upload = multer({ 
    storage: storage ,
    /*fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png") {
          cb(null, true);
        } else {
          cb(null, false);
          return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
        }
      }*/
    });

function checkFileType(file, cb) {
    if (file.fieldname === "certificate") {
        if (
            file.mimetype === 'application/pdf' ||
            file.mimetype === 'application/msword' ||
            file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          ) { // check file type to be pdf, doc, or docx
              cb(null, true);
          } else {
              cb(null, false); // else fails
          }
    }
    else if (file.fieldname === "brands_image" || file.fieldname === "category_image" || file.fieldname === "products_image" || file.fieldname ==="users_image") {
        if (
            file.mimetype === 'image/png' ||
            file.mimetype === 'image/jpg' ||
            file.mimetype === 'image/jpeg'||
            file.mimetype==='image/gif'
          ) { // check file type to be png, jpeg, or jpg
            cb(null, true);
          } else {
            cb(null, false); // else fails
          }
        }
    }
//at the save function 

//const {check} = require('express-validator');
router.use(['/login', '/register','/forgot-pws'], controllers.middleware.sessionChecker);

//GET Request Auth
router.get('/', function(req,res){ res.redirect('/login'); });
router.get('/login',  controllers.auth.login);
router.get('/seller/register', controllers.auth.register);
router.get('/logout', controllers.auth.logout);
router.get('/forgot-pws', controllers.auth.forgot_password);
router.get('/auth/verify-email/:token', controllers.auth.verify_email);



//GET Request Dashboard
router.get('/profile',controllers.middleware.authenticate, controllers.admin.profile);
router.get('/admin/withdraw-request',controllers.middleware.authenticate, controllers.admin.sellerWithdrawsRequest);
router.get('/admin/withdraw-request-list',controllers.middleware.authenticate, controllers.admin.withdrawRequestList);

//POST Request Admin
router.post('/admin/processWithdrawRequest',upload.array(),controllers.admin.processWithdrawRequest);


//GET Request Dashboard
router.get('/dashboard',controllers.middleware.authenticate, controllers.dashboard.dashboard);
router.get('/dashboard/category',controllers.middleware.authenticate, controllers.dashboard.category);
router.get('/dashboard/sub-category',controllers.middleware.authenticate, controllers.dashboard.sub_category);
router.get('/dashboard/brands',controllers.middleware.authenticate, controllers.dashboard.brands);
router.get('/dashboard/attributes',controllers.middleware.authenticate, controllers.dashboard.product_attribute);
router.get('/dashboard/products',controllers.middleware.authenticate, controllers.dashboard.products);
router.get('/dashboard/add-product',controllers.middleware.authenticate, controllers.dashboard.add_product);
router.get('/dashboard/add-product/:id',controllers.middleware.authenticate, controllers.dashboard.add_product);
router.get('/dashboard/add-product-variant/:id',controllers.middleware.authenticate, controllers.dashboard.add_product_variants);
router.get('/dashboard/add-product-variant/:id/:vid',controllers.middleware.authenticate, controllers.dashboard.add_product_variants);  
// router.get('/dashboard/view-product-variant',controllers.middleware.authenticate, controllers.dashboard.view_product_variant);
router.get('/dashboard/product-in-wishlist',controllers.middleware.authenticate, controllers.dashboard.product_wishlist);
router.get('/dashboard/reviews',controllers.middleware.authenticate, controllers.dashboard.product_reviews);
router.get('/dashboard/banners',controllers.middleware.authenticate, controllers.dashboard.banner);
router.get('/dashboard/notifications',controllers.middleware.authenticate, controllers.dashboard.getNotification);
router.get('/dashboard/changeNotiStatus',controllers.middleware.authenticate, controllers.dashboard.changeNotiStatus);
router.get('/dashboard/getMonthlySale',controllers.middleware.authenticate, controllers.dashboard.getMonthlySale);


//GET Request PRODUCTS Controller
router.get('/category_list',controllers.middleware.authenticate, controllers.products.categorList);
router.get('/subcategory_list',controllers.middleware.authenticate, controllers.products.subCategorList);
router.get('/brands_list',controllers.middleware.authenticate, controllers.products.brandsList);
router.get('/products_list',controllers.middleware.authenticate, controllers.products.productsList);
router.get('/products_variants_list',controllers.middleware.authenticate, controllers.products.productsVariantsList);
router.get('/reviews_list',controllers.middleware.authenticate, controllers.products.reviewsList);
router.get('/products_wishlist',controllers.middleware.authenticate, controllers.products.wishList);
router.get('/banners_list',controllers.middleware.authenticate, controllers.products.bannersList);
router.get('/attribute_list',controllers.middleware.authenticate, controllers.products.attributesList);


//router.get('/products_list',controllers.middleware.authenticate, controllers.products.productsList);

//GET Request Customers
router.get('/dashboard/customers',controllers.middleware.authenticate, controllers.customer.customers);
router.get('/customers_list',controllers.middleware.authenticate, controllers.customer.customersList);


//GET Request Seller
router.get('/seller/seller-list',controllers.middleware.authenticate, controllers.seller.sellers);
router.get('/sellers_list',controllers.middleware.authenticate, controllers.seller.sellersList);
router.get('/seller/withdraw-request',controllers.middleware.authenticate, controllers.seller.withdraws);
router.get('/seller/withdraw-request-list',controllers.middleware.authenticate, controllers.seller.withdrawRequestList);

//POST Request Seller
router.post('/seller/createWithdrawRequest',upload.array(),controllers.seller.createWithdrawRequest);
router.post('/seller/getSellerOutstanding',upload.array(),controllers.seller.getSellerOutstandingAmt);
router.post('/seller/updateSellerStatus',upload.array(),controllers.seller.updateSellerStatus);





//POST Request ORDERS
router.post('/orders/updateOrderStatus',upload.array(),controllers.orders.updateOrderStatus);
router.post('/orders/generateLabel',upload.array(),controllers.orders.generateLabel);
router.post('/orders/returnRequestAccept',upload.array(),controllers.orders.returnRequestAccept);
router.post('/orders/generateRefund',upload.array(),controllers.orders.generateRefund);
router.post('/orders/view-invoice',upload.array(),controllers.orders.getInvoice);


//GET Request ORDERS
router.get('/dashboard/orders',controllers.middleware.authenticate, controllers.orders.orders);
router.get('/orders_list/:status',controllers.middleware.authenticate, controllers.orders.sellerOrdersList);
router.get('/dashboard/order_transactions',controllers.middleware.authenticate, controllers.orders.orderTransactions);
router.get('/seller/order_transactions/:seller_id',controllers.middleware.authenticate, controllers.orders.orderTransactions);
router.get('/orders/Transactions_list',controllers.middleware.authenticate, controllers.orders.transactionsList);



//GET Request SETTINGS Controller
router.get('/settings/terms-condition',controllers.middleware.authenticate, controllers.settings.termsConditions);
router.get('/settings/privacy-policy',controllers.middleware.authenticate, controllers.settings.privacyPolicy);
router.get('/settings/about-us',controllers.middleware.authenticate, controllers.settings.aboutUs);
router.get('/settings/help-page',controllers.middleware.authenticate, controllers.settings.faqPage);
router.get('/settings/payment-method',controllers.middleware.authenticate, controllers.settings.paymentMethods);
router.get('/settings/currency',controllers.middleware.authenticate, controllers.settings.currency);
router.get('/settings/currency_list',controllers.middleware.authenticate, controllers.settings.currencyList);
router.get('/settings/mail-config',controllers.middleware.authenticate, controllers.settings.mailSettings);
router.get('/settings/sms-config',controllers.middleware.authenticate, controllers.settings.smsSettings);
router.get('/settings/faq_list',controllers.middleware.authenticate, controllers.settings.faqList);
router.get('/settings/web-config',controllers.middleware.authenticate, controllers.settings.webConfig);
router.get('/settings/notification-config',controllers.middleware.authenticate, controllers.settings.firebase_notifications);



//Support ROUTES GET
router.get('/support/tickets',controllers.middleware.authenticate, controllers.support.supportTicket);
router.get('/support/customer-questions',controllers.middleware.authenticate, controllers.support.customerQuestionsAnswer);
router.get('/support/ticket_list',controllers.middleware.authenticate, controllers.support.ticketList);
router.get('/support/question_list',controllers.middleware.authenticate, controllers.support.questionList);
router.get('/support/category',controllers.middleware.authenticate, controllers.support.supportCategory);
router.get('/support/ticket-reply/:id',controllers.middleware.authenticate, controllers.support.ticketReply);
router.get('/support/sp_category_list',controllers.middleware.authenticate, controllers.support.supportCategorList);

//POST Request 
router.post('/login',upload.array(), validationRules.login, controllers.auth.api.login);
router.post('/register', upload.array(), validationRules.register, controllers.auth.api.register);
router.post('/forgot_password',upload.array(), controllers.auth.api.forgot_password);  
router.post('/create_category',upload.single('category_image'), controllers.products.create_category);
router.post('/create_subcategory',upload.single('subcategory_image'), controllers.products.create_subcategory);
router.post('/create_brand',upload.single('brands_image'), controllers.products.create_brand);
router.post('/create_product',upload.none(), controllers.products.create_product);
router.post('/getSubcateAjax',upload.array(), controllers.products.subCategoryListAjax);
router.post('/create_banner',upload.single('banners_image'), controllers.products.create_banner);
router.post('/create_attribute',upload.array(), controllers.products.create_attribute);
router.post('/edit_attribute',upload.array(), controllers.products.editAttributes);
router.post('/create_product_variant',upload.array('products_variant_image',5), controllers.products.create_product_variants);

// POST Request SETTING Controller
router.post('/save_settings',upload.array(), controllers.settings.saveWebSettings);
router.post('/create_currency',upload.array(), controllers.settings.create_currency);
router.post('/edit_currency',upload.array(), controllers.settings.editCurrency);
router.post('/create_faq',upload.array(), controllers.settings.create_faq);
router.post('/edit_faq',upload.array(), controllers.settings.editFaq);
router.post('/settings/updateProfile',upload.single('users_image'),controllers.settings.updateProfile);
router.post('/settings/uploadWebImages',upload.single('webimages'),controllers.settings.uploadWebImages);
router.post('/settings/updateCurrencyStatus',upload.single('webimages'),controllers.settings.updateCurrencyStatus);
router.post('/settings/getActiveUserList',upload.array(),controllers.settings.getActiveUserList);
router.post('/settings/sendBulkMail',upload.array(),controllers.settings.sendBulkMail);
router.post('/settings/sendNotification',upload.single('notification_image'),controllers.settings.sendNotification);

// Delete ROUTES
router.delete('/dashboard/delete_customer',upload.array(),controllers.customer.deleteCustomer);
router.delete('/products/delete_banner',upload.array(),controllers.products.deleteBanner);
router.delete('/settings/delete_faq',upload.array(),controllers.settings.deleteFaq);
router.delete('/settings/delete_currency',upload.array(),controllers.settings.deleteCurrency);
router.delete('/products/delete_product_variant_thumb',upload.array(),controllers.products.deleteProductVariantThumb);

//Status Update
router.post('/products/updateCateStatus',upload.array(),controllers.products.updateCateStatus);
router.post('/products/updateSubcateStatus',upload.array(),controllers.products.updateSubcateStatus);
router.post('/products/updateAttributeStatus',upload.array(),controllers.products.updateAttributeStatus);
router.post('/products/updateBrandStatus',upload.array(),controllers.products.updateBrandStatus);
router.post('/products/updateProductStatus',upload.array(),controllers.products.updateProductStatus);
router.post('/products/updateProductVariantStatus',upload.array(),controllers.products.updateProductVariantStatus);
router.post('/products/updateBannerStatus',upload.array(),controllers.products.updateBannerStatus);

//Support ROUTES POST
router.post('/support/edit_question',upload.array(),controllers.support.editQuestionAnswer);
router.post('/support/question_reply',upload.array(),controllers.support.questionReply);
router.post('/support/ticket_reply_send',upload.array(),controllers.support.ticketReplySend);
router.post('/support/create_support_category',upload.array(),controllers.support.createSupportCategory);
router.post('/support/updateSuppoCateStatus',upload.array(),controllers.support.updateSuppoCateStatus);





//API ROUTES
router.post('/api/login',upload.array(),controllers.api.login);
router.post('/api/register',upload.array(), validationRules.register, controllers.api.register);
router.post('/api/forgot-password',upload.array(), controllers.api.forgot_password);
router.post('/api/reset-password',upload.array(),validationRules.reset_pass,controllers.api.reset_password);
router.post('/api/verify-otp',upload.array(),controllers.api.verifyPhoneOtp);
router.post('/api/getCategories',upload.array(),controllers.middleware.checkJWT,controllers.api.categorList);
router.post('/api/getSubCategories',upload.array(),controllers.middleware.checkJWT,controllers.api.subCategorList);
router.post('/api/getBrands',upload.array(),controllers.middleware.checkJWT,controllers.api.brandsList);
router.post('/api/getProducts',upload.array(),controllers.middleware.checkJWT,controllers.api.productsList);
router.post('/api/doProductLike',upload.array(),controllers.middleware.checkJWT,controllers.api.doProducstLikes);
router.post('/api/doRatings',upload.array(),controllers.middleware.checkJWT,controllers.api.createReviewRating);
router.post('/api/getProductsReviews',upload.array(),controllers.middleware.checkJWT,controllers.api.getProductsReviews);
router.post('/api/getMywishlist',upload.array(),controllers.middleware.checkJWT,controllers.api.getMyWishlist);
router.post('/api/getSingleProduct',upload.array(),controllers.middleware.checkJWT,controllers.api.getSingleProductDetails);
router.post('/api/getPromotionalBanners',upload.array(),controllers.middleware.checkJWT,controllers.api.getPromotionalBanners);

router.post('/api/updateProfile',upload.single('users_image'), controllers.middleware.checkJWT,controllers.api.updateUserProfile);
router.post('/api/placeMyOrder',upload.array(), validationRules.order_place,controllers.middleware.checkJWT,controllers.api.orderPlace);
router.post('/api/getMyOrders',upload.array(),controllers.middleware.checkJWT,controllers.api.myOrdersList);
router.post('/api/getMyOrderProducts',upload.array(),controllers.middleware.checkJWT,controllers.api.getMyOrderProducts);
router.post('/api/getMostSoldProducts',upload.array(),controllers.middleware.checkJWT,controllers.api.getMostSoldProducts);
router.post('/api/getNotifications',upload.array(),controllers.middleware.checkJWT,controllers.api.getNotifications);
router.post('/api/searchProducts',upload.array(),controllers.middleware.checkJWT,controllers.api.searchProducts);
router.post('/api/getMySearchContent',upload.array(),controllers.middleware.checkJWT,controllers.api.GetMySearchContent);
router.post('/api/addViewCount',upload.array(),controllers.middleware.checkJWT,controllers.api.countView);
router.post('/api/getTrendingProducts',upload.array(),controllers.middleware.checkJWT,controllers.api.getTrendingProductsList);
router.post('/api/getRecommendedProducts',upload.array(),controllers.middleware.checkJWT,controllers.api.getRecommendedProductsList);
router.post('/api/getAverageRating',upload.array(),controllers.middleware.checkJWT,controllers.api.getProductAverageRating);
router.post('/api/sendCustomerQuestion',upload.array(),controllers.middleware.checkJWT,controllers.api.sendCustomerQuestion);
router.post('/api/getCustomerQuestions',upload.array(),controllers.middleware.checkJWT,controllers.api.getCustomerQuestions);
router.post('/api/createCourierService',upload.array(),controllers.middleware.checkJWT,controllers.api.createCourierService);
router.post('/api/reviewHelpfulCount',upload.array(),controllers.middleware.checkJWT,controllers.api.reviewHelpfulCount);
router.post('/api/createSupportTicket',upload.array(),controllers.middleware.checkJWT,controllers.api.createSupportTicket);
router.post('/api/getSupportTicket',upload.array(),controllers.middleware.checkJWT,controllers.api.getSupportTickets);
router.post('/api/getSupportTicketReply',upload.array(),controllers.middleware.checkJWT,controllers.api.getSupportTicketReply);
router.post('/api/sendTicketReply',upload.array(),controllers.middleware.checkJWT,controllers.api.sendTicketReply);
router.post('/api/getSupportCategorList',upload.array(),controllers.middleware.checkJWT,controllers.api.getSupportCategorList);
router.post('/api/cancelOrder',upload.array(),controllers.middleware.checkJWT,controllers.api.cancelOrder);


router.post('/api/notificationTesting',upload.array(),controllers.api.notificationTesting);




router.get('/api/getPaymentGatewaysDetails',controllers.middleware.checkJWT,controllers.api.getPaymentGateways);



module.exports = router;