class Admin::DashboardController < AdminAppController

  # Stub to fetch Latest Counts for various Sections
  def index

    # To Fetch New Mobile Platform Users Count (created in Last 24 Hours)
  	@user_count = User.last_24_hours.count

  end

end
