class Admin::DashboardController < AdminAppController

  # Stub to fetch Latest Counts for various Sections
  def index

    # To Fetch New Mobile Platform Users Count (created in Last 24 Hours)
  	@user_count        = User.last_24_hours.count

    # To Fetch Total Users count
  	@total_users_count = User.count

  	# Many other sections yet to come here

  end

end
