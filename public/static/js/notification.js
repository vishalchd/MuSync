function showNotifications(messages){
  for(var i = 0; i < messages.length; i++){
    showNotification(messages[0][1], messages[0][0])
  }

  $('#notifications').remove();
}

function showNotification(message, type){
	var types = { 'alert': 'error', 'success': 'success', 'error': 'success', 'warning': 'warning', 'info': 'info' };

	type = types[type];

	if(!types[type]){
		type = 'info';
	}

	var n = new Noty({
		type: type,
		layout: 'topCenter',
		theme: 'bootstrap-v3',
		text: message,
		timeout: 5000,
		progressBar: true,
		closeWith: ['click', 'button'],
		animation: {
			open: 'noty_effects_open',
			close: 'noty_effects_close'
		},
		id: false,
		force: false,
		killer : false,
		queue: 'global',
		container: false,
		buttons: [],
		sounds: {
			sources: [],
			volume: 1,
			conditions: []
		},
		titleCount: {
			conditions: []
		},
		modal: false
	}).show()

}
