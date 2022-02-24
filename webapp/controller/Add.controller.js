sap.ui.define([
    'nvidia/sd/sales/controller/BaseController',
    'sap/ui/model/json/JSONModel',
    'sap/m/MessageBox',
    'sap/m/MessageToast'
], function(BaseController, JSONModel, MessageBox, MessageToast) {
    'use strict';
    return BaseController.extend("nvidia.sd.sales.controller.Add",{
        onInit: function () {
            var oJSONModel = new JSONModel();
            oJSONModel.setData({
                "productData": {
                    "PRODUCT_ID": "",
                    "TYPE_CODE": "PR",
                    "CATEGORY": "Notebooks",
                    "NAME": "",
                    "DESCRIPTION": "",
                    "SUPPLIER_ID": "0100000051",
                    "SUPPLIER_NAME": "TECUM",
                    "TAX_TARIF_CODE": "1 ",
                    "MEASURE_UNIT": "EA",
                    "PRICE": "0.00",
                    "CURRENCY_CODE": "USD",
                    "DIM_UNIT": "CM"
                }
            });
            this.getView().setModel(oJSONModel,"local");
            this.oLocalModel = oJSONModel;
        },
        onLoadExp: function(){
            //Step 2: Read the product data by its ID
            var oDataModel = this.getView().getModel();
            //Step 3: Put the data to local model which is already bound to UI
            //In callback functions we cannot access global variables, so we create a copy of global variable this
            var that = this;
            oDataModel.callFunction("/GetMostExpensiveProduct",{
                urlParameters: {
                    "I_CATEGORY": "Mice"
                },
                success: function(data){
                    that.productId = data.PRODUCT_ID;
                    that.oLocalModel.setProperty("/productData", data);
                    that.getView().byId("btnSave").setText("Update");
                    that.getView().byId("btnDelete").setEnabled(true);
                    that.mode = "update";
                }
            });
        },
        mode: "create",
        onDelete: function(){
            MessageBox.confirm("Do you wish to delete",{
                onClose: this.confirmDelete.bind(this)
            });
        },
        confirmDelete: function(status){
            if(status === "OK"){
                var oDataModel = this.getView().getModel();
                //Step 3: Put the data to local model which is already bound to UI
                //In callback functions we cannot access global variables, so we create a copy of global variable this
                var that = this;
                oDataModel.remove("/ProductSet('" + this.productId + "')",{
                    success: function(data){
                        MessageToast.show("Deleted Successfully");
                        that.onClear();
                    }
                });
            }
        },
        onEnter: function(oEvent){
            //Step 1: what data did user enter on screen
            this.productId = oEvent.getParameter("value");
            //Step 2: Read the product data by its ID
            var oDataModel = this.getView().getModel();
            //Step 3: Put the data to local model which is already bound to UI
            //In callback functions we cannot access global variables, so we create a copy of global variable this
            var that = this;
            oDataModel.read("/ProductSet('" + this.productId + "')",{
                success: function(data){
                    that.oLocalModel.setProperty("/productData", data);
                    that.getView().byId("btnSave").setText("Update");
                    that.getView().byId("btnDelete").setEnabled(true);
                    that.mode = "update";
                }
            });
        },
        onClear: function(){
            this.productId = "";
            this.mode = "create",
            this.getView().byId("btnSave").setText("Create");
            this.getView().byId("btnDelete").setEnabled(false);
            this.oLocalModel.setProperty(
                "/productData", {
                    "PRODUCT_ID": "",
                    "TYPE_CODE": "PR",
                    "CATEGORY": "Notebooks",
                    "NAME": "",
                    "DESCRIPTION": "",
                    "SUPPLIER_ID": "0100000051",
                    "SUPPLIER_NAME": "TECUM",
                    "TAX_TARIF_CODE": "1 ",
                    "MEASURE_UNIT": "EA",
                    "PRICE": "0.00",
                    "CURRENCY_CODE": "USD",
                    "DIM_UNIT": "CM"
                });
        },
        onSave: function(){
            //Step 1: Read data from the model to prepare payload
            var payload = this.oLocalModel.getProperty("/productData");
            //Step 2: Pre-checks before calling Backend
            if(payload.PRODUCT_ID === ""){
                MessageBox.error("Empty product id not allowed");
                return;
            }
            //Step 3: Get the Default model - OData Model
            var oDataModel = this.getView().getModel();
            if(this.mode === "create"){
                //Step 4: Use the OData Model object to send data to backend
                oDataModel.create("/ProductSet", payload, {
                    //Step 5: Handle the call back
                    success: function(){
                        MessageToast.show("You have made it NVIDIans!");
                    },
                    error: function (oError) {
                        var JSONError = JSON.parse(oError.responseText);
                        var sText = JSONError.error.innererror.errordetails[0].message
                        MessageBox.error(sText);
                    }
                });
            }else{
                //Step 4: Use the OData Model object to send data to backend
                oDataModel.update("/ProductSet('" + this.productId  + "')", payload, {
                    //Step 5: Handle the call back
                    success: function(){
                        MessageToast.show("You have updated it NVIDIans!");
                    },
                    error: function (oError) {
                        var JSONError = JSON.parse(oError.responseText);
                        var sText = JSONError.error.innererror.errordetails[0].message
                        MessageBox.error(sText);
                    }
                });
            }
            
            
        }
    });
});