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
        $( document ).on( 'mobileinit', setLoader);
    },
    onOffline: function(){
        alert('Conección a Internet no encontrada. Intente más tarde.');
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        console.log('device ready');
    },
    setLoader: function(){
        $.mobile.loader.prototype.options.text = "Accediendo";
        $.mobile.loader.prototype.options.textVisible = false;
        $.mobile.loader.prototype.options.theme = "e";
        $.mobile.loader.prototype.options.html = "";
    },
    openLoader: function(message){
        $.mobile.loading( 'show', {
            text: message,
            textVisible: true,
            theme: 'e',
            html: ""
        });
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
            url: "http://192.168.1.106:2619/api/login", 
            data: JSON.stringify(logOnModel), 
            type: "POST", 
            contentType: "application/json;charset=utf-8", 
            statusCode: { 
                200: function (data) { 
                    $.mobile.changePage("#menu");
                } 
            } 
        });
    }
};
