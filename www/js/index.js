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
    //serverAPI: "http://172.24.22.22:2619",
    serverAPI: "http://192.168.1.109:2619",
    user: "",
    // Application Constructor
    initialize: function() {
        $.support.cors = true;

        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
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
        console.log('device ready');
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
        $( '#loginUser' ).click(loginScreen.login);
    },
    login: function(){
        app.openLoader("Iniciando sesión");
        var logOnModel = { 
            UserName: $( '#username' ).val(), 
            Password: $( '#password' ).val()
        };
        $.ajax({ 
            url: app.serverAPI + "/api/login", 
            data: JSON.stringify(logOnModel), 
            type: "POST", 
            contentType: "application/json;charset=utf-8", 
            statusCode: { 
                200: function (data) {
                    app.closeLoader();
                    if (data == 'true' || data == true) {
                        app.user = $( '#username' ).val();
                        $.mobile.changePage("#menu");
                    }else{
                        app.alert('Error', 'Usuario o contraseña incorrecta.', 'Ok');
                    };
                } 
            } 
        });
    }
};

var menuScreen = {
    newUserMessages: {},
    newPublicMessages: {},
    lastUserMessageId: 0,
    lastPublicMessageId: 0,
    menuInit: function(){
        menuScreen.loadMessages();
        $( "#menu #refresh" ).click(menuScreen.loadMessages);
        $( "#personalMessages" ).click(function(){
            messagesScreen.consulting = "personal";
            messagesScreen.changeTitle();
        });
        $( "#publicMessages" ).click(function(){
            messagesScreen.consulting = "public";
            messagesScreen.changeTitle();
        });
    },
    loadMessages: function(){
        console.log("Actualizando mensajes personales");
        app.openLoader("Actualizando mensajes personales");
        $.ajax({ 
            url: app.serverAPI + "/api/user/" + app.user + "/messages/" + menuScreen.lastUserMessageId, 
            type: "GET", 
            contentType: "application/json;charset=utf-8", 
            statusCode: { 
                200: function (data) {
                    menuScreen.newUserMessages = JSON.parse(data);
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
                                menuScreen.newPublicMessages = JSON.parse(data);
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
        //messagesScreen.loadMessages('new');
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
            }else{
                messagesScreen.loadOldPersonalMessages();
            };
        }else{
            if (selected == "new") {
                messagesScreen.loadNewPublicMessages();
            }else{
                messagesScreen.loadOldPublicMessages();
            };
        };
    },
    loadNewPersonalMessages: function(){
        console.log("Cargando nuevos mensajes personales.");
        for (var i = menuScreen.newUserMessages.length - 1; i >= 0; i--) {
            $( "#messageList" ).append('<li>' + menuScreen.newUserMessages[i].Nota + '</li>').listview('refresh');
        };
    },
    loadOldPersonalMessages: function(){
        console.log("Cargando anteriores mensajes personales.");
    },
    loadNewPublicMessages: function(){
        console.log("Cargando nuevos mensajes públicos.");
        for (var i = menuScreen.newPublicMessages.length - 1; i >= 0; i--) {
            $( "#messageList" ).append('<li>' + menuScreen.newPublicMessages[i].Nota + '</li>').listview('refresh');
        };
    },
    loadOldPublicMessages: function(){
        console.log("Cargando anteriores mensajes públicos.");  
    }
};
