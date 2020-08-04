class Admin::DashboardController < AdminAppController

  # Stub to fetch Latest Counts for various Sections
  def index

    # To Fetch New Mobile Platform Users Count (created in Last 24 Hours)
  	@user_count        = User.last_24_hours.count

    # To Fetch Total Users count
  	@total_users_count = User.count

    # To Fetch Total Follow Requests in Last 24 hours 
	@total_follow_requests_count = UserFollowRequest.last_24_hours.count

    # To Fetch Total Follow Confirmed Requests
	@total_follow_confirmed_requests_count = UserFollowRequest.confirmed_in_last_24_hours.count


  	# Many other sections yet to come here

  end

end
