function admin_businesses(){
  $('#business_joining_date').flatpickr({
    dateFormat: 'd-m-Y'
  })

  $('#contact_nos').on('cocoon:before-insert', function(e, nu_to_be_added) {
    // nu_to_be_added.find('select').dropdown();
  })

  $('#addresses').on('cocoon:before-insert', function(e, addr_to_be_added) {
    // addr_to_be_added.find('select').dropdown();
  })

  $('#addresses').on('change', 'select', function(e){
    var ele = $(this), container, f_select;

    if(!ele.val()){
      return;
    }

    container = ele.parents('.state-city');
    f_select = ele.parents();


    if(f_select.hasClass('business_addresses_state_id')){
      updateSelectBox('/admin/states/'+ ele.val() +'/cities', 'city_id', container, 'Select City');

      var l_select = container.find('.business_addresses_locality_id select');
      l_select.html( "<option>Select Locality</option>");
      //l_select.val('');
      //l_select.dropdown('refresh');
      //l_select.dropdown('set placeholderText', 'Select Locality');

    } else if(f_select.hasClass('business_addresses_city_id')){
      updateSelectBox('/admin/cities/'+ ele.val() +'/localities', 'locality_id', container, 'Select Locality');
    }
  })

  function updateSelectBox(url, type, container, placeholderText){
    $.getJSON(url, function(data){
      var select = container.find('.business_addresses_'+ type + ' select');
      var menu = container.find('.business_addresses_'+ type +' .menu');

      menu.html('');
      var options = "<option>"+ placeholderText + "</option>";

      $.each(data, function(d){
        options = options + '<option value="'+ this.id+'">'+ this.name +'</option>';
      })

      select.html(options);
      // select.dropdown('refresh');
      // select.dropdown('set placeholderText', placeholderText);
    })
  }
}

