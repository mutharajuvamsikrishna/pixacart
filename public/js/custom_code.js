$(document).ready(function(){
	
    $(document).on('click', '.editCate', function () {
        let _this = $(this);
        $('#addNewCateBtn').trigger('click');
        $('#exampleModalLabel02').text('Edit Category');
        $('#cate_id').val(_this.attr('data-cate-id'));
        $('#cate_name').val(_this.attr('data-cate-name'));
        $('#cate_tax').val(_this.attr('data-cate-tax'));
        $('#cate_commission').val(_this.attr('data-commi-tax'));
        $('#category_image').removeClass('require');
        
    })
    
    $(document).on('click', '.editSubCate', function () {
        let _this = $(this);
      //  $('#addNewSubCateBtn').trigger('click');
        $('#createSubCategoryModal').modal();
        $('#exampleModalLabel02').text('Edit Sub Category');
        $('#subcate_id').val(_this.attr('data-cate-id'));
        $('#cate_name').val(_this.attr('data-cate-name'));
        $("#main_cateid").val(_this.attr('data-maincate-id')).trigger('change');
        //$('#main_cateid').removeClass('require');
        $('#subcategory_image').removeClass('require');
        
        //$('#mainCatselect').hide();
    })

    $(document).on('click', '#addNewSubCateBtn', function () {
        $('#mainCatselect').show();
    })

    $(document).on('click', '.editBrand', function () {
        let _this = $(this);
        $('#addNewBrandBtn').trigger('click');
        $('#exampleModalLabel02').text('Edit Brand');
        $('#brand_id').val(_this.attr('data-brand-id'));
        $('#brand_name').val(_this.attr('data-brand-name'));
        $('#brand_image').removeClass('require');
    })

    $(document).on('click', '.editAttribute', function () {
        let _this = $(this);

        let f 		= 	new FormData();
        let url 	=	_this.attr('data-url');
        let id 		=	_this.attr('data-attribute-id');
        f.append('id', id);
        xhr(f, url).done(function (resp) {
            //data = JSON.parse(data);
            if (resp.status == 1) {
                let attriData = resp.data;
                $('#addNewAttributeBtn').trigger('click');
                $('#exampleModalLabel02').text('Edit Attribute');
                $('#attribute_id').val(attriData._id);
                $('#attribute_name').val(attriData.attribute_name);
                $(".tagging").tagging( "removeAll" );
                $(".tagging").tagging('add',JSON.parse(attriData.attribute_value));
                $("#attributes_cate").val(attriData.attribute_cate).trigger('change');
            }
        })
    });

    $(document).on('click', '.editCurrency', function () {
        let _this = $(this);

        let f 		= 	new FormData();
        let url 	=	_this.attr('data-url');
        let id 		=	_this.attr('data-currency-id');
        f.append('id', id);
        xhr(f, url).done(function (resp) {
            //data = JSON.parse(data);
            if (resp.status == 1) {
                let currencyData = resp.data;
                $('#addNewCurrencyBtn').trigger('click');
                $('#exampleModalLabel02').text('Edit Currency');
                $('#currency_id').val(currencyData._id);
                $('#currency_code').val(currencyData.currency_code);
                $('#currency_symbol').val(currencyData.currency_symbol);
            }
        })
    });

    $(document).on('click', '.editFaq', function () {
        let _this = $(this);

        let f 		= 	new FormData();
        let url 	=	_this.attr('data-url');
        let id 		=	_this.attr('data-faq-id');
        f.append('id', id);
        xhr(f, url).done(function (resp) {
            //data = JSON.parse(data);
            if (resp.status == 1) {
                let resData = resp.data;
                $('#addNewFaqBtn').trigger('click');
                $('#exampleModalLabel02').text('Edit FAQ');
                $('#faq_id').val(resData._id);
                $('#faq_question').val(resData.faq_question);
                $('#faq_answer').val(resData.faq_answer);
            }
        })
    });

    $(document).on('click', '.replyQuestions', function () {
        let _this = $(this);

        let f 		= 	new FormData();
        let url 	=	_this.attr('data-url');
        let id 		=	_this.attr('data-question-id');
        f.append('id', id);
        xhr(f, url).done(function (resp) {
            //data = JSON.parse(data);
            if (resp.status == 1) {
                let resData = resp.data;
                $('#questionReplyModal').modal();
                $('#exampleModalLabel02').text('Question Reply');
                $('#que_id').val(resData._id);
                $('#cust_question').val(resData.question);
                $('#cust_answer').val(resData.answer);
            }
        })
    });

    $(document).on('click', '.resetModalForm', function () {
        //let _this = $(this);
        //let modalId =_this.attr('data-target');
        //console.log(modalId)
     //   let form = $(modalId).find('form');
     //   form.find("input[type=hidden]").val('');
     //   form[0].reset();
    })


   
    $('#createSubCategoryModal').on('shown.bs.modal', function () {
        ///alert()
    })

    $('.modal').on('hidden.bs.modal', function () {
        let _this = $(this);
        $('#exampleModalLabel02').text($('#exampleModalLabel02').attr('data-title'));
        let form =_this.find('form');
        form.find("input[type=hidden]").val('');
        if(form.length) form[0].reset();
        $('#category_image').addClass('require');
        $('#subcategory_image').addClass('require');
        $('#brand_image').addClass('require');
        $(".tagging").tagging( "removeAll" );
        $('input[type="file"]').next('label').text('Browse Image');
        
    })

    $(document).on('click', '.deleteRecords', function () {
        let _this = $(this);
        confirmBoxAlert(_this);
    })

    $(document).on('change', '#pro_cate', function () {
        $('#pro_subcate').html('');
        let f 		= 	new FormData();
        f.append('cate_id', $(this).val());
        xhr(f, 'getSubcateAjax', 'post').done(function (resp) {
            //data = JSON.parse(data);
            
            if (resp.status == 1) {
                var object = {};
                HTML =`<option value="" selected="" disabled="">---Select---</option>`;
                resp.data.forEach(function(value, key){
             	   HTML +=` <option value="${value._id}">${value.cate_name}</option>`;
                });
                $('#pro_subcate').append(HTML);

            }else{
                HTML =`<option value="" selected="" disabled="">---Sub Category Not Found---</option>`;
                $('#pro_subcate').append(HTML);
            }
        })
     });

     $(document).on('click', '.checkedOrder' , function() {
		 
       /* if ($(this).prop("checked")){
            $(this).closest('.table_content tbody tr').addClass('active');
        }else{
            $(this).closest('.table_content tbody tr').removeClass('active');
        }*/
        
        if ($('.checkedOrder:checked').length){
            $(".updateAllStatus").attr('disabled', false);
        }else{
            $(".updateAllStatus").attr('disabled', true);
        }
        
        /*if ($('.checkedOrder:checked').length == $('.checkedOrder').length){
            $('#checkall').prop('checked',true);
            $('#checkall').closest('.table_content tr').addClass('active');
        }else {
            $('#checkall').prop('checked',false);
            $('#checkall').closest('.table_content tr').removeClass('active');
        }*/
    });

    $(document).on('click', '.orderTab' , function() {
        $(".updateAllStatus").attr('disabled', true);
        $('.checkedOrder').prop('checked',false);

    });

    $(document).on('click', '.AddTrackingDetail123' ,async function() {

        let courier =  JSON.parse($('#courierServices').val());
        //console.log(courier)
        let HTML =`<select id="swal-input1" class="swal2-input">`;
        HTML +=`<option value="" selected="" disabled="">---Select---</option>`;
                courier.forEach(function(value, key){
                HTML +=` <option value="${value._id}">${value.courier_name}</option>`;
            });
        HTML +=`</select>
            <input id="swal-input2" class="swal2-input" placeholder="Enter Tracking Id">`;

        const { value: fruit } = await Swal.fire({
            title: 'Select Courier Service',
            showCancelButton: true,
            html: HTML,
            focusConfirm: false,
            preConfirm: () => {
                return [
                document.getElementById('swal-input1').value,
                document.getElementById('swal-input2').value
                ]
            }
          })
          
          if (fruit) {
            Swal.fire(`You selected: ${fruit}`)
          }

    });
    $('.AddTrackingDetail').trigger('click')

});

$(document).on('click', '.generateLable' ,async function(e) {
    e.preventDefault();		
    let _this 	= 	$(this);
	let action = _this.attr('action');
	let url = _this.attr('url');
    let ids = _this.attr('data-order-id');

    if(ids){
        let allChekedOrderID = [];
        allChekedOrderID.push(ids);
        let f = new FormData();
        f.set('order_ids',allChekedOrderID);
        xhr(f, url ).done((data) => {
            if (data.status == 1) {
                $('#exampleModalLabel02').text('Order Label');
                $('#appendLabelHtml').html(data.data);
                $('#generateLabelModal').modal();
                showNotifications("success", data.message);
            }
        });

    }else{
        showNotifications("error", 'Order id is missing');
    }
});

$(document).on('click', '.viewInvoice' ,async function(e) {
    e.preventDefault();		
    let _this 	= 	$(this);
	let action = _this.attr('action');
	let url = _this.attr('url');
    let ids = _this.attr('data-invoice-id');

    if(ids){
        let allChekedOrderID = [];
        allChekedOrderID.push(ids);
        let f = new FormData();
        f.set('invoice_id',allChekedOrderID);
        xhr(f, url ).done((data) => {
            if (data.status == 1) {
                $('#exampleModalLabel02').text('Invoice');
                $('#appendLabelHtml').html(data.data);
                $('#generateLabelModal').modal();
                //showNotifications("success", data.message);
            }
        });

    }else{
        showNotifications("error", 'Order id is missing');
    }
});


$(document).on('click', '.AddTrackingDetail' ,async function(e) {
    e.preventDefault();		
    let _this 	= 	$(this);
	let action = _this.attr('action');
	let url = _this.attr('url');
    let ids = _this.attr('data-order-id');

    if(ids){
        let allChekedOrderID = [];
        allChekedOrderID.push(ids);

        let courier =  JSON.parse($('#courierServices').val());
        
        let HTML =`<select id="swal-input1" class="swal2-input">`;
        HTML +=`<option value="" selected="" disabled="">---Select---</option>`;
                courier.forEach(function(value, key){
                HTML +=` <option value="${value._id}">${value.courier_name}</option>`;
            });
        HTML +=`</select>
            <input id="swal-input2" class="swal2-input" placeholder="Enter Tracking Id">`;

        Swal.fire({
            title: 'Select Courier Service',
            showCancelButton: true,
            html: HTML,
            focusConfirm: false,
            preConfirm: () => {
            const courier = document.getElementById('swal-input1').value
            const trackingid = document.getElementById('swal-input2').value
        
            if (!courier) {
                Swal.showValidationMessage(`Please select courier sevice`)
            }else 
            if (!trackingid) {
                Swal.showValidationMessage(`Please enter tracking id`)
            }

            return { courier: courier, trackingid: trackingid }
            }
        }).then((result) => {
            if(result.isConfirmed){
                let f = new FormData();
                f.set('order_ids',allChekedOrderID);
                f.set('status', action);
                f.set('courier_service', result.value.courier);
                f.set('tracking_id', result.value.trackingid);
                xhr(f, url ).done((data) => {
                    if (data.status == 1) {
                        showNotifications("success", data.message);
                        dataTableObj.forEach(function(k,v){
                            k.ajax.reload();
                        });
                    }
                })



            /* Swal.fire(`
                Login: ${result.value.courier}
                Password: ${result.value.trackingid}
                `.trim())*/
            }
        });
    }else{
        showNotifications("error", 'Order id is missing');
    }
});

$(document).on('click', '.editSpCate', function () {
    let _this = $(this);
    $('#addNewCateBtn').trigger('click');
    $('#exampleModalLabel02').text('Edit Category');
    $('#cate_id').val(_this.attr('data-cate-id'));
    $('#cate_name').val(_this.attr('data-cate-name'));
});

$(document).on("keypress","#reply_msg",function(event) {
    var keyCode = event.which || event.keyCode;
    if (keyCode == 13) {
        $("#sendReplyBtn").click();
        return false;
    }
});


if($('.msg-history').length){
    let showChatHistory = $('.msg-history');
    showChatHistory.stop().animate({scrollTop:showChatHistory[0].scrollHeight},1000);
}

$(document).on("click",'#sendReplyBtn', (e) => {
    e.preventDefault();
	let _this = $(e.target);
	let btntxt = _this.html();
	_this.html('<span class="sc_wait_pro">Wait...</span>').prop('disabled', true);
	let form = _this.closest("form");
	checkValidation(form).then(()=>{
		let f = new FormData(form[0]);
			f.set('offset', tzoffset());
			xhr(f, form.attr('action') ).done((data) => {
				if(data.status == 1){
					showNotifications("success",data.message);
					if(typeof data.chatHtml != 'undefined'){
						$('.msg-history').append(data.chatHtml);
                        let showChatHistory = $('.msg-history');
                        showChatHistory.stop().animate({scrollTop:showChatHistory[0].scrollHeight},1000);
                        $('#reply_msg').val('').focus();
					}	
				}else 
				if(data.status == 0){
					showNotifications("error",data.message);
				}
				_this.html(btntxt).prop('disabled', false);
				
			}).fail(()=>{
				_this.html(btntxt).prop('disabled', false);
			});
	}).catch((mess)=>{
		_this.html(btntxt).prop('disabled', false);
		showNotifications('error',mess);
	});	    

});


$(document).on('click', '.AcceptReturn' ,async function(e) {
    e.preventDefault();		
    let _this 	= 	$(this);
	let action = _this.attr('action');
	let url = _this.attr('url');
    let ids = _this.attr('data-order-id');

    if(ids){
        let allChekedOrderID = [];
        allChekedOrderID.push(ids);

        let courier =  JSON.parse($('#courierServices').val());
        
        let HTML =`<select id="swal-input1" class="swal2-input">`;
        HTML +=`<option value="" selected="" disabled="">---Select---</option>`;
                courier.forEach(function(value, key){
                HTML +=` <option value="${value._id}">${value.courier_name}</option>`;
            });
        HTML +=`</select>
            <input id="swal-input2" class="swal2-input" placeholder="Enter Tracking Id">`;

        Swal.fire({
            title: 'Enter Return Tracking id',
            showCancelButton: true,
            html: HTML,
            focusConfirm: false,
            preConfirm: () => {
         
            const courier = document.getElementById('swal-input1').value;
            const trackingid = document.getElementById('swal-input2').value;
        
            if (!courier) {
                Swal.showValidationMessage(`Please select courier sevice`)
            }else 
            if (!trackingid) {
                Swal.showValidationMessage(`Please enter tracking id`)
            }

            return { courier: courier, trackingid: trackingid }
            }
        }).then((result) => {
            if(result.isConfirmed){
                let f = new FormData();
                f.set('order_ids',allChekedOrderID);
                f.set('status', action);
                f.set('courier_service', result.value.courier);
                f.set('tracking_id', result.value.trackingid);
                xhr(f, url ).done((data) => {
                    if (data.status == 1) {
                        showNotifications("success", data.message);
                        dataTableObj.forEach(function(k,v){
                            k.ajax.reload();
                        });
                    }
                })



            /* Swal.fire(`
                Login: ${result.value.courier}
                Password: ${result.value.trackingid}
                `.trim())*/
            }
        });
    }else{
        showNotifications("error", 'Order id is missing');
    }
});


$(document).on('click', '.generateRefund' ,async function(e) {
    e.preventDefault();		
    let _this 	= 	$(this);
	let action = _this.attr('action');
	let url = _this.attr('url');
    let ids = _this.attr('data-order-id');

    if(ids){
        let allChekedOrderID = [];
        allChekedOrderID.push(ids);

        let courier =  JSON.parse($('#courierServices').val());
        
        let HTML =``;
        
        HTML +=`<input id="swal-input2" class="swal2-input" placeholder="Enter Transaction Id">`;

        Swal.fire({
            title: 'Enter Refund Transaction id',
            showCancelButton: true,
            html: HTML,
            focusConfirm: false,
            preConfirm: () => {
         
            const trackingid = document.getElementById('swal-input2').value
         
            if (!trackingid) {
                Swal.showValidationMessage(`Please enter ttransaction id`);
            }

            return { trackingid: trackingid }
            }
        }).then((result) => {
            if(result.isConfirmed){
                let f = new FormData();
                f.set('order_ids',allChekedOrderID);
                f.set('status', action);
                f.set('tracking_id', result.value.trackingid);
                xhr(f, url ).done((data) => {
                    if (data.status == 1) {
                        showNotifications("success", data.message);
                        dataTableObj.forEach(function(k,v){
                            k.ajax.reload();
                        });
                    }
                })



            /* Swal.fire(`
                Login: ${result.value.courier}
                Password: ${result.value.trackingid}
                `.trim())*/
            }
        });
    }else{
        showNotifications("error", 'Order id is missing');
    }
});


$(document).on('click', '.withdrawProcced', function () {
    let _this = $(this);

    let f 		= 	new FormData();
    let url 	=	_this.attr('data-url');
    let sellerid =	_this.attr('data-seller-id');

    let req_id  =	_this.attr('data-req-id');
    if(req_id !== undefined){
        f.append('req_id', req_id);
    }

    f.append('seller_id', sellerid);
    xhr(f, url).done(function (resp) {
        //data = JSON.parse(data);
        if (resp.status == 1) {
            let resData = resp.data;
            $('#withdrawRequestModal').modal();
            $('#outstandig_amt').val(resData.outstanding);
            if(resData.withdrawReq){
                $('#withdraw_amt').val(resData.withdrawReq.amount);
                $('#withdraw_id').val(resData.withdrawReq._id);
            }
        }
    })
});


$(document).on('click', '.currencyStatus', function () {
    let _this = $(this);

    let f 		= 	new FormData();
    let url 	=	_this.attr('data-url');
    let currency_id =	_this.attr('data-currency-id');

    f.append('currency_id', currency_id);
    xhr(f, url).done(function (resp) {
        //data = JSON.parse(data);
        if (resp.status == 1) {
            showNotifications("success", resp.message);
            dataTableObj[0].ajax.url(base_url+$('table').data('action-url')).clear().draw();
        }
    })
});


function printDiv() { 
    
   var divElements = $('#appendLabelHtml').html();
   
   //Get the HTML of whole page
   var oldPage = document.body.innerHTML; 
   //Reset the page's HTML with div's HTML only
   document.body.innerHTML = 
     '<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"><title></title></head><body>' + 
     divElements + '</body>';
   //Print Page
   window.print();
   
   //Restore orignal HTML
   document.body.innerHTML = oldPage;
   setTimeout(function() {
       location.reload();
   }, 500); 
}


function preview(event) {
    if(event.target.files[0]){
        previewImg.src=URL.createObjectURL(event.target.files[0]);
        $('.imgArea').show();
    }else{
        previewImg.src='';
        $('.imgArea').hide();
    }
}


$(document).on("mouseover", '.changeNotiStatus', function () {
    let notiCount = $(this).attr('data-noticount');
    if(notiCount > 0){
        let url = 'dashboard/changeNotiStatus';
        let f = {};
        xhr(f, url, 'GET').done(function (resp) {
            if (resp.status == 1) {
                let resData = resp.data;
                $('.changeNotiStatus').attr('data-noticount', resData.notiCount);
                $('#notiCount').text('You have ' + resData.notiCount + ' new notifications');
                $('#notiBell').removeClass("notification-info");
                
            }
        });
    }
});


function getNotifications(){
    let url = 'dashboard/notifications';
    let f = {};
    xhr(f, url, 'GET').done(function (resp) {
        if (resp.status == 1) {
            let resData = resp.data;
            $('.changeNotiStatus').attr('data-noticount', resData.notiCount);
            $('#notiCount').text('You have ' + resData.notiCount + ' new notifications');
            $('#notiMsg').html(resData.notiList);
            if(resData.notiCount > 0){
               $('#notiBell').addClass("notification-info");
            }
        }
    })

}
if($('#notiCount').length){
    getNotifications();
} 


$(document).on('click', '.auto_fill_emailpwd', function () {
    $('#uemail').val($(this).attr('data-email'));
    $('#upwd').val($(this).attr('data-pwd'));
});

$(document).on('change', 'input[type="file"]', function () {
    if($(this)[0].files.length){
        var file = $(this)[0].files[0].name;
        if(file !==''){
            var fileExtension = ['jpeg', 'jpg', 'png'];
            if ($.inArray($(this).val().split('.').pop().toLowerCase(), fileExtension) == -1) {
                showNotifications("error", "Only '.jpeg','.jpg','.png' formats are allowed.");
                this.value = ''; // Clean field
                return false; 
            }

            if($(this)[0].files.length>5){
                showNotifications("error", "You can upload up to five files at a time.");
                this.value = ''; // Clean field
                return false;
            }

            if($(this).next('label').find('.numberOfFiles').length){
                $(this).next('label').find('.numberOfFiles').text($(this)[0].files.length +' Files Selected');
            }else{
                $(this).next('label').text(file);
            }
        }
    }else{
        if($(this).next('label').find('.numberOfFiles').length){
            $(this).next('label').find('.numberOfFiles').text('');
        }else{
            $(this).next('label').text('Browse Image');
        }
    }
});


$(document).on("focusout change", '.calunitprice', function () {
    calculateUnitPrice();
});


function calculateUnitPrice(){
    let strikePrice = $('#pro_strikeout_price').val();
    let unitPrice = $('#pro_unitprice');
    let discoount = $('#pro_discount').val();
    let type = $('#pro_discount_type').val();
    var uprice = '';
    
    if(type == 'flat'){
        uprice = strikePrice - discoount;
    }else
    if(type == 'percent'){
        uprice = strikePrice *  discoount / 100;
        uprice = strikePrice - uprice;
    }
    
    unitPrice.val(uprice);
}

/************Order Table reinitilize on tab button click*************/
$(document).on("click", 'li.orderTab', function () {
   let index = $(this).index();
   dataTableObj[index].ajax.reload();
});
/************Order Table reinitilize on tab button click*************/

setTimeout(()=>{
   $('.verify_alert').hide();
},3000)