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
    // serverAPI: "http://172.24.22.26:2619",
    serverAPI: "http://192.168.1.106:2619",
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
        $( '#messages' ).bind( 'pageshow', messagesScreen.messagesShow);
        $( '#searchGrades' ).bind( 'pageinit', searchGradesScreen.searchGradesInit);
        $( '#grades' ).bind( 'pageinit', gradesScreen.gradesInit);
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
    updateUser: function(userName, password, lastUserMessageId, lastPublicMessageId){
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
        console.log("Loading personal messages...");
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
                    menuScreen.newUserMessages = $.parseJSON(data);
                    $( '#personalCount' ).text(menuScreen.newUserMessages.length);
                    app.closeLoader();

                    console.log("Loading public messages...");
                    app.openLoader("Actualizando mensajes públicos");
                    $.ajax({ 
                        url: app.serverAPI + "/api/public_messages/" + menuScreen.lastPublicMessageId, 
                        type: "GET", 
                        contentType: "application/json;charset=utf-8", 
                        statusCode: { 
                            200: function (data) {
                                menuScreen.newPublicMessages = $.parseJSON(data);
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
        $( "#viewMenu" ).on( "change", function(){
            messagesScreen.loadMessages($(this).val());
            $( "#messageList" ).listview('refresh');
        });
        $( "#viewMenu option[value=new]" ).attr('selected', 'selected');
        $( "#viewMenu" ).selectmenu('refresh');
    },
    messagesShow: function(){
        messagesScreen.loadMessages($("#viewMenu").val());
    },
    changeTitle: function(){
        if (messagesScreen.consulting == "personal"){
            $( "#messages #messagesTitle" ).text("Personales");
        }else{
            $( "#messages #messagesTitle" ).text("Públicos");
        };
    },
    loadMessages: function(assign){
        console.log("Loading messages...");
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
        console.log("Loading new personal messages...");
        for (var i = menuScreen.newUserMessages.length - 1; i >= 0; i--) {
            $( "#messageList" ).append('<li>' + menuScreen.newUserMessages[i].Nota + '</li>');
            if (i === menuScreen.newUserMessages.length - 1) {
                menuScreen.lastPrivateMessageId = menuScreen.newUserMessages[i].idNota;
            };
        };
        $( "#messageList" ).listview();
    },
    loadOldPersonalMessages: function(){
        console.log("Loading old personal messages...");
        app.openLoader("Actualizando anteriores mensajes personales");
        $.ajax({ 
            url: app.serverAPI + "/api/user/" + app.user + "/old_messages/" + menuScreen.lastPrivateMessageId,
            type: "GET", 
            contentType: "application/json;charset=utf-8", 
            statusCode: { 
                200: function (data) {
                    oldPersonalMessages = $.parseJSON(data);
                    for (var i = oldPersonalMessages.length - 1; i >= 0; i--) {
                        $( "#messageList" ).append('<li>'+ oldPersonalMessages[i].Nota +'</li>');
                    };
                    app.closeLoader();
                } 
            },
            complete: function(){
                $( "#messageList" ).listview('refresh');
            }
        });
    },
    loadNewPublicMessages: function(){
        console.log("Loading new public messages...");
        for (var i = menuScreen.newPublicMessages.length - 1; i >= 0; i--) {
            $( "#messageList" ).append('<li>' + menuScreen.newPublicMessages[i].Nota + '</li>');
            if (i === menuScreen.newPublicMessages.length - 1) {
                menuScreen.lastPublicMessageId = menuScreen.newPublicMessages[i].idNotasPublicas;
            };
        };
        $( "#messageList" ).listview();
    },
    loadOldPublicMessages: function(){
        console.log("Loading old public messages.");
        app.openLoader("Actualizando anteriores mensajes públicos");
        $.ajax({ 
            url: app.serverAPI + "/api/old_public_messages/" + menuScreen.lastPublicMessageId,
            type: "GET", 
            contentType: "application/json;charset=utf-8", 
            statusCode: { 
                200: function (data) {
                    oldPublicMessages = $.parseJSON(data);
                    for (var i = oldPublicMessages.length - 1; i >= 0; i--) {
                        $( "#messageList" ).append('<li>'+ oldPublicMessages[i].Nota +'</li>');
                    };
                    app.closeLoader();
                } 
            },
            complete: function(){
                $( "#messageList" ).listview('refresh');
            }
        });
    }
};

var searchGradesScreen = {
    searchGradesInit: function(){
        searchGradesScreen.loadYears();
    },
    loadYears: function(){
        console.log("Loading years...");
        app.openLoader("Actualizando años del estudiante");
        $.ajax({ 
            url: app.serverAPI + "/api/user/" + app.user + "/years", 
            type: "GET", 
            contentType: "application/json;charset=utf-8", 
            statusCode: { 
                200: function (data) {
                    searchGradesScreen.createYears($.parseJSON(data));
                } 
            } 
        });
    },
    createYears: function(years){
        $yearsContainer = $("#yearsContainer");
        $yearsContainer.html('');
        for (var i = years.length - 1; i >= 0; i--) {
            collapsible = "<div data-year=" + years[i].A_Adem + " data-role='collapsible' ";
            if (i == years.length - 1) {
                collapsible += "data-collapsed='false'";
            } else{
                collapsible += "data-collapsed='true'";
            };
            collapsible += " data-inset='true'><h3>" + years[i].A_Adem + " - PP: " + years[i].PP + "</h3><ul data-role='listview' data-divider-theme='e' data-inset='false'></ul></div>";  
            $yearsContainer.append($(collapsible));
        };
        $('div[data-role=collapsible]').collapsible();
        $('#yearsContainer div h3').bind('click', function(){
            searchGradesScreen.loadPeriods($(this).parent().data('year'));
        });
        app.closeLoader();
        searchGradesScreen.loadPeriods(years[years.length - 1].A_Adem);
    },
    loadPeriods: function(year){
        console.log("Loading periods...");
        app.openLoader("Actualizando periodos del " + year);
        $.ajax({
            url: app.serverAPI + "/api/user/" + app.user + "/year/" + year + "/periods", 
            type: "GET", 
            contentType: "application/json;charset=utf-8", 
            statusCode: { 
                200: function (data) {
                    searchGradesScreen.createPeriods(year, $.parseJSON(data));
                } 
            },
            complete: function(){
                $('ul[data-role=listview]').listview('refresh');
            }
        });
    },
    createPeriods: function(year, periods){
        $periodsContainer = $('div[data-year='+ year +'] ul[data-role=listview]')
        $periodsContainer.html('');
        for (var i = periods.length - 1; i >= 0; i--) {
            li = "<li data-year='"+ year +"' data-period='"+ periods[i].Trimestre +"' data-theme='f'><a href='#grades' data-transition='slide'>Trimestre " + periods[i].Trimestre + " - PP: " + periods[i].PP + "</a></li>";
            $periodsContainer.append($(li));
        };
        $periodsContainer.listview();
        $('ul[data-role=listview] li').unbind("click");
        $('ul[data-role=listview] li').bind('click', function(event, ui){
            gradesScreen.loadGrades( $(this).data('year'), $(this).data('period') );
        });
        app.closeLoader();
    }
};

var gradesScreen = {
    gradesInit: function(){

    },
    loadGrades: function(year, period){
        console.log("Loading grades...");
        app.openLoader("Actualizando calificaciones");
        $.ajax({
            url: app.serverAPI + "/api/user/" + app.user + "/year/" + year + "/period/"+ period +"/grades", 
            type: "GET", 
            contentType: "application/json;charset=utf-8",
            statusCode: { 
                200: function (data) {
                    gradesScreen.createGrades($.parseJSON(data));
                } 
            },
            complete: function(){}
        });
    },
    createGrades: function(grades){
        $gradesContainer = $("#gradesContainer");
        $gradesContainer.html('');
        for (var i = grades.length - 1; i >= 0; i--) {
            collapsible = '<div data-role="collapsible" data-collapsed="false"><h3>'+ grades[i].id_curso +' (MM:'+ grades[i].NotaMedioP +' CF:'+ grades[i].NotaFinal +')</h3>';
            collapsible += '<div><p><strong>Curso:</strong>'+ grades[i].id_curso +' - Procesos Químicos Inorgánicos</p>';
            collapsible += '<p><strong>Sección:</strong>'+ grades[i].seccion +'</p>';
            collapsible += '<p><strong>Créditos:</strong>'+ grades[i].Creditos +'</p>';
            collapsible += '<p><strong>Medio periodo:</strong>'+ grades[i].NotaMedioP +'</p>';
            collapsible += '<p><strong>Final:</strong>'+ grades[i].NotaFinal +'</p>';
            if (grades[i].Aprobado == '0') {
                collapsible += '<p><strong>Estado:</strong>Reprobado</p>';
            } else{
                collapsible += '<p><strong>Estado:</strong>Aprobado</p>';
            };
            if (grades[i].Estado_Recuperacion == 'N') {
                collapsible += '<p><strong>Recuperación:</strong>No aplicaca</p></div></div>';
            } else{
                collapsible += '<p><strong>Recuperación:</strong>Si</p></div></div>';
            };
            $gradesContainer.append($(collapsible));
        };
        $('div[data-role=collapsible]').collapsible();
        app.closeLoader();
    }
};
