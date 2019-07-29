class AdminAppController < ActionController::Base
  protect_from_forgery with: :exception

  layout 'admin_app'
  before_action :authenticate_admin_user!

end
