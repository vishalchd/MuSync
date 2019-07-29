module ApplicationHelper

  def show_notifications
    if notice
      return "demo.showNotification('top', 'center', 1, '#{notice}');";
    end

    "demo.showNotification('top', 'center', 4, #{flash.as_json});"
  end

  def active(ctrl, action = nil)
    if action
      return ctrl == params[:controller] && action == params[:action] ? 'active' : ''
    end

    return ctrl == params[:controller] ? 'active' : ''
  end

  def time_format(t, show_mins = false)
    f = show_mins ? '%a %d, %Y %I:%M %p' : '%b %e, %Y'

    return t.strftime(f) if t
  end

  def index_no
    return @_c if @_c     

    @_c = ((params[:page].to_i - 1) * 30) + 1
    @_c = 1 if @_c < 0
    @_c
  end

  def label_tag(value, label_yes, label_no)
    if value
      content_tag(:span, label_yes, class: 'label label-info label_popular', id: 'label')
    else
      content_tag(:span, label_no, class: 'label label-danger', id: 'label')
    end
  end

  def label_tag_with_id(id_text, value, label_yes, label_no)
    if value
      content_tag(:span, label_yes, class: 'label label-info label_popular', id: id_text)
    else
      content_tag(:span, label_no, class: 'label label-danger', id: id_text)
    end
  end

end
