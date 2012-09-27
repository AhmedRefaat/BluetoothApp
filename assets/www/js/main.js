var webservice_url = "http://url/to/listgen.php";

var btn_toggle;
var devices_list;

var enabled = false;
var notification_opened = false;

var bt_plugin = null;
var to = null;

var refs = new Array();
var near_stack = new Array();


/* 	
------------------------------------------------------------------------
INIT
------------------------------------------------------------------------
*/
function initApp()
{
	bt_plugin = cordova.require( 'cordova/plugin/bluetooth' );
	
	$("#img_loader").css( "visibility", "hidden" );
	
	$('#devices_list').html('');
	
	$( "#toggleswitch5" ).bind( "change", function(event, ui) 
	{
		switch( $( "#toggleswitch5" ).val() )
		{
			case "on":
				//alert("switched to ON");
				enableBT();
				break;
			
			case "off":
				//alert("switched to OFF");
				disableBT();
				break;
		}
	});
	
	$.getJSON(webservice_url, function(json)
	{
    	$.each(json.checkpoints, function(i,item)
		{
			refs[item.id] = item;
		});
    });
    
    if (typeof plugins !== "undefined")
	{
    	plugins.localNotification.cancelAll();
	}
}


/* 	
------------------------------------------------------------------------
CURRENT TIME
------------------------------------------------------------------------
*/
function launchScan()
{
	if( enabled == true && notification_opened == false )
	{
		$("#img_loader").css( "visibility", "visible" );
		
		// -- reset last scan near stack
		near_stack = new Array();
		
		// -- clear timeout
		clearTimeout( to );
		
		// -- scan devices
		bt_plugin.discoverDevices( 
		function(devices) 
	    {
			$('#devices_list').html('');
	    	
	    	for( var i = 0; i < devices.length; i++ ) 
	    	{
	    		if( refs.hasOwnProperty("" + devices[i].name) )
	    		{
	    			$('#devices_list').append( $( '<div class="device_item_ok">' + devices[i].name + '</div>' ) );
	    			
	    			near_stack.push( refs[ devices[i].name ] ); // object
	    			
	    			showNotification( devices[i].name );
	    		}
	    		else
	    		{
	    			$('#devices_list').append( $( '<div class="device_item">' + devices[i].name + '</div>' ) );
	    		}
	    	}
	    	
	    	$("#img_loader").css( "visibility", "hidden" );
	    	
	    	to = setTimeout(launchScan, 10000);
	    }, 
	    function(error) 
	    { 
	    	$("#img_loader").css( "visibility", "hidden" );
	    	
	    	alert( 'Error while searching devices: ' + error );
	    	
	    	$( "#toggleswitch5" ).val("off");
	    	enabled = false;
	    });
	}
}


/* 	
------------------------------------------------------------------------
NOTIFICATION
------------------------------------------------------------------------
*/
function showNotification( id )
{
	notification_opened = true;
	
	navigator.notification.confirm(
		'You are near an important POI ('+ id +'). Do you want to know more about it?',
		onConfirm,
		'Proximity alert',
		'Explore,No Thanks'
	);
	
	if (typeof plugins !== "undefined")
	{
		plugins.localNotification.add({
			date:new Date(),
			message:'BluetoothApp\r\nPOI found',
			ticker:'You are near an important POI ('+ id +'). Do you want to know more about it?',
			repeatDaily:false,
			id:99
		});
	}
	
	/*window.plugins.statusBarNotification.notify('BluetoothApp\r\nPOI found', 'You are near an important POI ('+ id +'). Do you want to know more about it?');*/
	
	navigator.notification.vibrate(500);
	navigator.notification.beep(1);
}


/* 	
------------------------------------------------------------------------
ACTION ON NOTIFICATION
------------------------------------------------------------------------
*/
function onConfirm( button_index ) 
{
	var dataObj = near_stack.shift();
	
	if( button_index == 1 ) window.location.href = dataObj.url;
	
	notification_opened = false;
	
	clearTimeout( to );
	to = setTimeout(launchScan, 10000);
}


/* 	
------------------------------------------------------------------------
Enabling Bluetooth
------------------------------------------------------------------------
*/
function enableBT()
{
	$("#img_loader").css( "visibility", "visible" );
	
	bt_plugin.enable(
	function() 
	{
		$("#img_loader").css( "visibility", "hidden" );
		
		alert( 'Bluetooth successfully enabled' );
		enabled = true;
		launchScan();
	}, 
	function() 
	{
		$("#img_loader").css( "visibility", "hidden" );
		
		alert( 'Error while enabling Bluetooth: ' + error );
	});
}


/* 	
------------------------------------------------------------------------
Disabling Bluetooth
------------------------------------------------------------------------
*/
function disableBT() 
{
	$("#img_loader").css( "visibility", "visible" );
	
	$('#devices_list').html('');
	
	bt_plugin.disable( 
	function() 
	{
		$("#img_loader").css( "visibility", "hidden" );
		
		alert( 'Bluetooth successfully disabled' );
		enabled = false;
	}, 
	function() 
	{
		$("#img_loader").css( "visibility", "hidden" );
		
		alert( 'Error while disabling Bluetooth: ' + error );
	} );
}
