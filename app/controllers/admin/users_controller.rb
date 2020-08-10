class Admin::UsersController < AdminAppController
  before_action :set_user, only: [:destroy, :show, :show_followers, :show_followings, :show_pending_requests]

  # Stub to Fetch Users Listing as per various Search Filters
  def index

=begin
    :: Expected Params ::
  
  Constants::REQUEST_PARAM_RECENT => Recent [Optional]
  Constants::REQUEST_PARAM_PAGE => Page No

=end  

    @default_filter = param_query

    @q = User.ransack(param_query)

    # Check IF Navigation is from DashBoard
    if params[Constants::REQUEST_PARAM_RECENT].present? 
    
      @users = @q.result.order("created_at").last_24_hours.page(param_page)

    else

      @users =  @q.result.page(param_page)

    end

  end  

  # Stub to Present User in View Mode 
  def show

=begin
    :: Expected Params ::
  
  Constants::REQUEST_PARAM_ID => UserID

=end 

    # @user             = User.find param_id rescue nil

    followings        = UserFollowRequest.where("user_id = #{@user.id} and is_confirmed = 1")
    @followings_count = followings.count

    @followers_count  = UserFollowRequest.where("user_to_follow_id = #{@user.id} and is_confirmed = 1").count

    @pending_count    = UserFollowRequest.where("user_to_follow_id = #{@user.id} and is_confirmed = 0 and is_cancelled = 0").count
  
  end

  # Stub to show current user's followers list
  def show_followers

    @follow_requests  = UserFollowRequest.where("user_to_follow_id = #{@user.id} and is_confirmed = 1")

    @default_filter = param_query

    @q = UserFollowRequest.where("user_to_follow_id = #{@user.id} and is_confirmed = 1").ransack(param_query)

    @follow_requests =  @q.result.page(param_page)

  end

  # Stub to show current user's followings list
  def show_followings

    @followings = UserFollowRequest.where("user_id = #{@user.id} and is_confirmed = 1")

  end

  # Stub to show current user's pending list to confirm
  def show_pending_requests
    
    @pending_requests = UserFollowRequest.where("user_to_follow_id = #{@user.id} and is_confirmed = 0 and is_cancelled = 0")

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
      @user = User.find(param_id) rescue nil
    end  

  def param_id

    params[Constants::REQUEST_PARAM_ID]

  end 

  def param_query

    params[:q]

  end

  def param_page

    params[Constants::REQUEST_PARAM_PAGE]

  end

end
