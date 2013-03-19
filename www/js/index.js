// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

//Cross-domain issue
function createCORSRequest(method, url) {
  var xhr = new XMLHttpRequest();
  if ("withCredentials" in xhr) {

    // Check if the XMLHttpRequest object has a "withCredentials" property.
    // "withCredentials" only exists on XMLHTTPRequest2 objects.
    xhr.open(method, url, true);

  } else if (typeof XDomainRequest != "undefined") {

    // Otherwise, check if XDomainRequest.
    // XDomainRequest only exists in IE, and is IE's way of making CORS requests.
    xhr = new XDomainRequest();
    xhr.open(method, url);

  } else {

    // Otherwise, CORS is not supported by the browser.
    xhr = null;

  }
  return xhr;
};


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
    serverAPI: "http://mobilesga.earth.ac.cr/Jaguar_Mobile",
    user: {},
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
        $( '#menu' ).bind( 'pageshow', menuScreen.menuShow);
        $( '#messages' ).bind( 'pageinit', messagesScreen.messagesInit);
        $( '#messages' ).bind( 'pageshow', messagesScreen.messagesShow);
        $( '#searchGrades' ).bind( 'pageinit', searchGradesScreen.searchGradesInit);
        $( '#grades' ).bind( 'pageinit', gradesScreen.gradesInit);
        $( '#config' ).bind( 'pageinit', configScreen.configInit);
        $( '#config' ).bind( 'pageshow', configScreen.configShow);
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
        console.log("Login initialized...");
        $( '#loginUser' ).click(loginScreen.loginClick);
        storedUsers = $.parseJSON(window.localStorage.getItem('users'));
        if (storedUsers != null && storedUsers.length > 0) {
            lastUser = storedUsers[storedUsers.length - 1];
            console.log("Existing user: " + lastUser.userName);
            app.openLoader("Iniciando sesión automáticamente");
            var logOnModel = { 
                UserName: lastUser.userName, 
                Password: lastUser.password
            };
            loginScreen.login(logOnModel);
        }else{
            storedUsers = [];
            window.localStorage.setItem('users', JSON.stringify(storedUsers));
        };
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
        $.support.cors = true;

        $.ajax({
            type: "GET",
            url: app.serverAPI + "/api/login",
            jsonpCallback: 'jsonCallback',
            contentType: "application/json",
            dataType: 'jsonp',
            data: JSON.stringify(logOnModel),
            success: function(json) {
                app.closeLoader();
                if (json == 'true' || json == true) {
                    loginScreen.saveUser(logOnModel.UserName, logOnModel.Password);
                    $.mobile.changePage("#menu");
                }else{
                    app.alert('Error', 'Usuario o contraseña incorrecta.', 'Ok');
                };
            },
            error: function(e) {
                app.closeLoader();
                console.log(e);
                app.alert('Error', 'Ocurrió un error de conección al servidor.', 'Ok');
            }
        });

        // $.ajax({ 
        //     url: app.serverAPI + "/api/login?jsoncallback=?",
        //     crossDomain: true,
        //     data: JSON.stringify(logOnModel), 
        //     type: "POST", 
        //     contentType: "application/json;charset=utf-8",
        //     xhrFields: {
        //         withCredentials: false
        //     },
        //     headers: {
        //         "Access-Control-Allow-Origin": "*",
        //         "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Origin"
        //     },
        //     statusCode: { 
        //         200: function (data) {
        //             app.closeLoader();
        //             if (data == 'true' || data == true) {
        //                 loginScreen.saveUser(logOnModel.UserName, logOnModel.Password);
        //                 $.mobile.changePage("#menu");
        //             }else{
        //                 app.alert('Error', 'Usuario o contraseña incorrecta.', 'Ok');
        //             };
        //         },
        //         400: function (data) {
        //             app.closeLoader();
        //             console.log(data);
        //             app.alert('Error', 'Ocurrió un error de conección al servidor.', 'Ok');
        //         }
        //     } 
        // });
    },
    saveUser: function(userName, password){
        var users = [];
        users = $.parseJSON(window.localStorage.getItem('users'));
        var exist = false;
        var index = 0;
        var user = {}
        for (var i = users.length - 1; i >= 0; i--) {
            if (users[i].userName === userName) {
                exist = true;
                index = i;
            };
        };
        if (exist) {
            user = users[index];
            users.remove(index);
        }else{
            user.lastPersonalMessageId = 0;
            user.lastPublicMessageId = 0;
        };
        user.userName = userName;
        user.password = password;
        users.push(user);
        window.localStorage.setItem('users', JSON.stringify(users));
        app.user = user;
    }
};

var menuScreen = {
    newUserMessages: [],
    newPublicMessages: [],
    menuInit: function(){
        $( "#menu #refresh" ).click( function(){
            menuScreen.loadMessages();
        });
        $( "#personalMessages" ).click(function(){
            messagesScreen.consulting = "personal";
            messagesScreen.changeTitle();
        });
        $( "#publicMessages" ).click(function(){
            messagesScreen.consulting = "public";
            messagesScreen.changeTitle();
        });
    },
    menuShow: function(){
        menuScreen.loadMessages();
    },
    loadMessages: function(){
        console.log("Loading personal messages...");
        app.openLoader("Actualizando mensajes personales");
        $.ajax({ 
            url: app.serverAPI + "/api/user/" + app.user.userName + "/messages/" + app.user.lastPersonalMessageId, 
            type: "GET", 
            contentType: "application/json;charset=utf-8", 
            statusCode: { 
                200: function (data) {
                    menuScreen.newUserMessages = data;
                    $( '#personalCount' ).text(menuScreen.newUserMessages.length);
                    app.closeLoader();

                    console.log("Loading public messages...");
                    app.openLoader("Actualizando mensajes públicos");
                    $.ajax({ 
                        url: app.serverAPI + "/api/public_messages/" + app.user.lastPublicMessageId, 
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
        $( "#messageList" ).listview('refresh');
    },
    loadNewPersonalMessages: function(){
        console.log("Loading new personal messages...");
        for (var i = menuScreen.newUserMessages.length - 1; i >= 0; i--) {
            $( "#messageList" ).append('<li>' + menuScreen.newUserMessages[i].Nota + '</li>');
            if (i === menuScreen.newUserMessages.length - 1) {
                app.user.lastPersonalMessageId = menuScreen.newUserMessages[i].idNota;
                var users = [];
                users = $.parseJSON(window.localStorage.getItem('users'));
                for (var a = users.length - 1; a >= 0; a--) {
                    if (users[a].userName == app.user.userName) {
                        users[a].lastPersonalMessageId = menuScreen.newUserMessages[i].idNota;
                    };
                };
                window.localStorage.setItem('users', JSON.stringify(users));
            };
        };
        $( "#messageList" ).listview();
        menuScreen.newUserMessages = [];
    },
    loadOldPersonalMessages: function(){
        console.log("Loading old personal messages...");
        app.openLoader("Actualizando anteriores mensajes personales");
        $.ajax({ 
            url: app.serverAPI + "/api/user/" + app.user.userName + "/old_messages/" + app.user.lastPersonalMessageId,
            type: "GET", 
            contentType: "application/json;charset=utf-8", 
            statusCode: { 
                200: function (data) {
                    oldPersonalMessages = data;
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
                app.user.lastPublicMessageId = menuScreen.newPublicMessages[i].idNotasPublicas;
                var users = [];
                users = $.parseJSON(window.localStorage.getItem('users'));
                for (var a = users.length - 1; a >= 0; a--) {
                    if (users[a].userName == app.user.userName) {
                        users[a].lastPublicMessageId = menuScreen.newPublicMessages[i].idNotasPublicas;
                    };
                };
                window.localStorage.setItem('users', JSON.stringify(users));
            };
        };
        $( "#messageList" ).listview();
        menuScreen.newPublicMessages = [];
    },
    loadOldPublicMessages: function(){
        console.log("Loading old public messages.");
        app.openLoader("Actualizando anteriores mensajes públicos");
        $.ajax({ 
            url: app.serverAPI + "/api/old_public_messages/" + app.user.lastPublicMessageId,
            type: "GET", 
            contentType: "application/json;charset=utf-8", 
            statusCode: { 
                200: function (data) {
                    oldPublicMessages = data;
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
            url: app.serverAPI + "/api/user/" + app.user.userName + "/years", 
            type: "GET", 
            contentType: "application/json;charset=utf-8", 
            statusCode: { 
                200: function (data) {
                    searchGradesScreen.createYears(data);
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
        if (years.length > 0) {
            searchGradesScreen.loadPeriods(years[years.length - 1].A_Adem);
        };
    },
    loadPeriods: function(year){
        console.log("Loading periods...");
        app.openLoader("Actualizando periodos del " + year);
        $.ajax({
            url: app.serverAPI + "/api/user/" + app.user.userName + "/year/" + year + "/periods", 
            type: "GET", 
            contentType: "application/json;charset=utf-8", 
            statusCode: { 
                200: function (data) {
                    searchGradesScreen.createPeriods(year, data);
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
        $('#yearsContainer ul[data-role=listview] li').unbind("click");
        $('#yearsContainer ul[data-role=listview] li').bind('click', function(event, ui){
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
            url: app.serverAPI + "/api/user/" + app.user.userName + "/year/" + year + "/period/"+ period +"/grades", 
            type: "GET", 
            contentType: "application/json;charset=utf-8",
            statusCode: { 
                200: function (data) {
                    gradesScreen.createGrades(data);
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


var configScreen = {
    configInit: function(){
        $('#closeSession').click(function(){
            configScreen.closeSession();
        });
        $('#closeAllSessions').click(function(){
            configScreen.closeAllSessions();
        });
    },
    configShow: function(){
        $('#config div h2').text('Usuario: ' + app.user.userName);
    },
    closeSession: function(){
        var users = [];
        users = $.parseJSON(window.localStorage.getItem('users'));
        for (var i = users.length - 1; i >= 0; i--) {
            if (users[i].userName == app.user.userName) {
                users.remove(i);
            };
        };
        app.user = {};
        window.localStorage.setItem('users', JSON.stringify(users));
    },
    closeAllSessions: function(){
        var users = [];
        window.localStorage.setItem('users', JSON.stringify(users));
    }
};