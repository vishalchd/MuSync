class Admin::UsersController < AdminAppController
  before_action :set_user, only: [:destroy]

  # Stub to Fetch Users Listing as per various Search Filters
  def index

=begin
    :: Expected Params ::
  
  Constants::REQUEST_PARAM_RECENT => Recent [Optional]
  Constants::REQUEST_PARAM_PAGE => Page No

=end  

    @default_filter = params[:q]

    @q = User.ransack(params[:q])

    # Check IF Navigation is from DashBoard
    if params[Constants::REQUEST_PARAM_RECENT].present? 
    
      @users = @q.result.order("created_at").last_24_hours.page(params[Constants::REQUEST_PARAM_PAGE])

    else

      @users =  @q.result.page(params[Constants::REQUEST_PARAM_PAGE])

    end

  end  

  # Stub to Present User in View Mode 
  def show

=begin
    :: Expected Params ::
  
  Constants::REQUEST_PARAM_ID => UserID

=end 

    @user = User.find(params[Constants::REQUEST_PARAM_ID])
  
  end

    def destroy
    @user.destroy
    respond_to do |format|
      format.html { redirect_to admin_users_url, notice: 'User was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_user
      @user = User.find(params[Constants::REQUEST_PARAM_ID])
    end  

end
