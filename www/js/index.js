/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
<<<<<<< HEAD
    // serverAPI: "http://172.24.22.22:2619",
    serverAPI: "http://192.168.1.105:2619",
=======
    serverAPI: "http://172.24.22.23:2619",
    //serverAPI: "http://192.168.1.109:2619",
>>>>>>> .
    user: "",
    // Application Constructor
    initialize: function() {
        console.log("Application initialized");
        $.support.cors = true;
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        console.log("Binding events");
        document.addEventListener('offline', this.onOffline, false);
        document.addEventListener('deviceready', this.onDeviceReady  , false);

        $( '#login' ).bind( 'pageinit', loginScreen.loginInit);
        $( '#menu' ).bind( 'pageinit', menuScreen.menuInit);
        $( '#messages' ).bind( 'pageinit', messagesScreen.messagesInit);
    },
    onOffline: function(){
        app.alert('Error', 'Conección a Internet no encontrada. Intente más tarde.', 'Ok');
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        console.log('Device ready');
    },
    openDatabase: function(){
        console.log('Opening database');
        if (typeof(window.openDatabase)!='undefined') {
            var db = window.openDatabase("jaguar", "1.0", "EARTH Jaguar", 200000);
            db.transaction(app.populateDB, app.errorCB, app.successCB);
            console.log('Database created');
        }
    },
    populateDB: function(tx) {
        tx.executeSql('CREATE TABLE IF NOT EXISTS UserState (userName unique, password, lastUserMessageId, lastPublicMessageId)');
    },
    successCB: function() {
        console.log("Success processing SQL.");
        //var db = window.openDatabase("jaguar", "1.0", "EARTH Jaguar", 200000);
        //db.transaction(app.queryDB, app.errorCB);
    },
    errorCB: function(err) {
        console.log("Error processing SQL: "+err.code+", "+err.message);
    },
    // queryDB: function(tx) {
    //     tx.executeSql('SELECT * FROM DEMO', [], querySuccess, errorCB);
    // },
    openLoader: function(message){
        $.mobile.loading( 'show', {
            text: message,
            textVisible: true,
            theme: 'e',
            html: ""
        });
    },
    closeLoader: function(){
        $.mobile.loading( 'hide' );
    },
    alert: function(title, content, button){
        $( "#alert #title" ).text(title);
        $( "#alert #content" ).text(content);
        $( "#alert #button" ).text(button);
        $( "#alert" ).popup( "open" );
    }
};

var loginScreen = {
    loginInit: function(){
        console.log("Login initialized");
        $( '#loginUser' ).click(loginScreen.loginClick);
        app.openDatabase();
        loginScreen.getUser(function(tx, result){
            if (result !== null && result.rows.length > 0) {
                console.log("Existing user: " + result.rows.item(0).userName);
                app.openLoader("Iniciando sesión automáticamente");
                var logOnModel = { 
                    UserName: result.rows.item(0).userName, 
                    Password: result.rows.item(0).passowrd
                };
                loginScreen.login(logOnModel);
            };
        });
    },
    loginClick: function(){
        app.openLoader("Iniciando sesión");
        var logOnModel = { 
            UserName: $( '#username' ).val(), 
            Password: $( '#password' ).val()
        };
        loginScreen.login(logOnModel);
    },
    login: function(logOnModel){
        $.ajax({ 
            url: app.serverAPI + "/api/login", 
            data: JSON.stringify(logOnModel), 
            type: "POST", 
            contentType: "application/json;charset=utf-8", 
            statusCode: { 
                200: function (data) {
                    app.closeLoader();
                    if (data == 'true' || data == true) {
                        app.user = logOnModel.UserName;
                        loginScreen.saveNewUser(app.user, logOnModel.Password);
                        $.mobile.changePage("#menu");
                    }else{
                        app.alert('Error', 'Usuario o contraseña incorrecta.', 'Ok');
                    };
                },
                400: function (data) {
                    app.alert('Error', 'Usuario o contraseña incorrecta.', 'Ok');
                }
            } 
        });
    },
    getUser: function(successCallBack){
        if (typeof(window.openDatabase)!='undefined') {
            var db = window.openDatabase("jaguar", "1.0", "EARTH Jaguar", 200000);
            db.transaction(function(tx){
                tx.executeSql('SELECT * FROM UserState', [], successCallBack, app.errorCB);
            }, app.errorCB);
        }else{
            successCallBack(null, null);
        }
    },
    saveNewUser: function(userName, password){
        loginScreen.deleteUser();
        console.log("Saving new user " + userName);
        if (typeof(window.openDatabase)!='undefined') {
            var db = window.openDatabase("jaguar", "1.0", "EARTH Jaguar", 200000);
            db.transaction(function(tx){
                tx.executeSql('INSERT INTO UserState (userName, password, lastUserMessageId, lastPublicMessageId) VALUES ("'+userName+'", "'+password+'", 0, 0)');
            }, app.errorCB);
        }
    },
    deleteUser: function(){
        console.log("Deleting user");
        if (typeof(window.openDatabase)!='undefined') {
            var db = window.openDatabase("jaguar", "1.0", "EARTH Jaguar", 200000);
            db.transaction(function(tx){
                tx.executeSql('DELETE FROM UserState');
            }, app.errorCB);
        }
    }
};

var menuScreen = {
    newUserMessages: [],
    newPublicMessages: [],
    lastPrivateMessageId: 0,
    lastPublicMessageId: 0,
    menuInit: function(){
        loginScreen.getUser(menuScreen.loadMessages);
        //$( "#menu #refresh" ).click(menuScreen.getLastUserMessageId(menuScreen.loadMessages));
        $( "#personalMessages" ).click(function(){
            messagesScreen.consulting = "personal";
            messagesScreen.changeTitle();
        });
        $( "#publicMessages" ).click(function(){
            messagesScreen.consulting = "public";
            messagesScreen.changeTitle();
        });
    },
    loadMessages: function(tx, result){
        console.log("Actualizando mensajes personales");
        app.openLoader("Actualizando mensajes personales");
        if (result !== null && result.rows.length > 0) {
            menuScreen.lastPrivateMessageId = result.rows.item(0).lastUserMessageId;
            menuScreen.lastPublicMessageId = result.rows.item(0).lastPublicMessageId;
            app.user = result.rows.item(0).userName;
        };
        $.ajax({ 
            url: app.serverAPI + "/api/user/" + app.user + "/messages/" + menuScreen.lastPrivateMessageId, 
            type: "GET", 
            contentType: "application/json;charset=utf-8", 
            statusCode: { 
                200: function (data) {
                    menuScreen.newUserMessages = data;
                    $( '#personalCount' ).text(menuScreen.newUserMessages.length);
                    app.closeLoader();

                    console.log("Actualizando mensajes públicos");
                    app.openLoader("Actualizando mensajes públicos");
                    $.ajax({ 
                        url: app.serverAPI + "/api/public_messages/" + menuScreen.lastPublicMessageId, 
                        type: "GET", 
                        contentType: "application/json;charset=utf-8", 
                        statusCode: { 
                            200: function (data) {
                                menuScreen.newPublicMessages = data;
                                $( '#publicCount' ).text(menuScreen.newPublicMessages.length);
                                app.closeLoader();
                            } 
                        } 
                    });
                } 
            } 
        });
    }
};

var messagesScreen = {
    cunsulting: "",
    messagesInit: function(){
        $( "#viewMenu" ).on( "change", messagesScreen.loadMessages($(this).val()));
        $( "#viewMenu option[value=new]" ).attr('selected', 'selected');
        $( "#viewMenu" ).selectmenu('refresh');
        messagesScreen.loadMessages('new');
    },
    changeTitle: function(){
        if (messagesScreen.consulting == "personal"){
            $( "#messages #messagesTitle" ).text("Personales");
        }else{
            $( "#messages #messagesTitle" ).text("Públicos");
        };
    },
    loadMessages: function(assign){
        console.log("Cargando mensajes.");
        $("#messageList > li").remove();
        var selected = assign;
        if (messagesScreen.consulting == "personal"){
            if (selected == "new") {
                messagesScreen.loadNewPersonalMessages();
            }else if (selected == "old"){
                messagesScreen.loadOldPersonalMessages();
            };
        }else{
            if (selected == "new") {
                messagesScreen.loadNewPublicMessages();
            }else if (selected == "old"){
                messagesScreen.loadOldPublicMessages();
            };
        };
    },
    loadNewPersonalMessages: function(){
        console.log("Cargando nuevos mensajes personales.");
        for (var i = menuScreen.newUserMessages.length - 1; i >= 0; i--) {
            $( "#messageList" ).append('<li>' + menuScreen.newUserMessages[i].Nota + '</li>');
        };
        $( "#messageList" ).listview();
    },
    loadOldPersonalMessages: function(){
        console.log("Cargando anteriores mensajes personales.");
    },
    loadNewPublicMessages: function(){
        console.log("Cargando nuevos mensajes públicos.");
        for (var i = menuScreen.newPublicMessages.length - 1; i >= 0; i--) {
            $( "#messageList" ).append('<li>' + menuScreen.newPublicMessages[i].Nota + '</li>');
        };
        $( "#messageList" ).listview();
    },
    loadOldPublicMessages: function(){
        console.log("Cargando anteriores mensajes públicos.");  
    }
};
