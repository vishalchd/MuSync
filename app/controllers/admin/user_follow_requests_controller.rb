class Admin::UserFollowRequestsController < AdminAppController

  # Stub to Fetch User Follow Requests as per various filters
  def index

    @q = UserFollowRequest.default_order.ransack(params[:q])
    @follow_requests = @q.result.page(param_page)

  end


  def param_id

    params[Constants::REQUEST_PARAM_ID]

  end

  def param_page

    params[Constants::REQUEST_PARAM_PAGE]

  end

end
