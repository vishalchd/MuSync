class Api::V1::FollowRequestsController < ApiController

    # Stub to Create new Follow Request
	def create_follow_request

=begin
    :: Expected Params ::
  
  Constants::REQUEST_PARAM_USER_TO_FOLLOW_ID => UserToFollowID

=end 
	
	  begin

		user = current_user rescue nil

		user_to_follow = User.find param_user_to_follow_id rescue nil

        # Check if User to Follow found or not?
		if user_to_follow.nil?

          render json: {status: status_code(:not_found), message: "User not found." }
          return

		end

        follow_request = UserFollowRequest.where("user_id = #{user.id} and user_to_follow_id = #{user_to_follow.id} ").first

        # Check if Follow Request already exist? 
        if !follow_request.nil?

          render json: {status: status_code(:unprocessable_entity), message: "Follow Request already exist." }
          return

        end

        # Create Follow request
        follow_request                   = user.user_follow_requests.new
        follow_request.user_to_follow_id = user_to_follow.id

      if follow_request.save
      	## TODO Notification to other user

        render json: {status: status_code(:created), message: '', data: follow_request}
      else
        render json: {status: status_code(:unprocessable_entity), data: follow_request.errors}
      end

      rescue =>e
  
        ## Record Error
        # area, name, body, reason, related_info
        render json: {status: status_code(:unprocessable_entity), message: Constants::SOMETHING_WENT_WRONG, data: {errors: e.message}}

      end 	

	end	

  # Stub to unFollow Some User
  def unfollow_request_action

=begin
    :: Expected Params ::
  
  Constants::REQUEST_PARAM_ID   => RequestID

=end 

    begin

      user = current_user rescue nil

      follow_request = UserFollowRequest.find param_id rescue nil

      # Check if Follow Request is valid
      if follow_request.nil?

        render json: {status: status_code(:not_found), message: "Follow Request not found." }
        return

      end    

      if follow_request.destroy

        render json: {status: status_code(:ok), message: ""}

      else

        render json: {status: status_code(:unprocessable_entity), message: Constants::SOMETHING_WENT_WRONG}

      end


    rescue =>e
  
      ## Record Error
      # area, name, body, reason, related_info
      render json: {status: status_code(:unprocessable_entity), message: Constants::SOMETHING_WENT_WRONG, data: {errors: e.message}}

    end   


  end

    # Stub to make Follow Request Action
	def follow_request_action

=begin
    :: Expected Params ::
  
  Constants::REQUEST_PARAM_ID   => RequestID
  Constants::REQUEST_PARAM_MODE => Action Mode [1 for confirm, 2 for cancel]

=end 
	
	  begin

		user = current_user rescue nil

		follow_request = UserFollowRequest.find param_id rescue nil

        # Check if Follow Request is valid
        if follow_request.nil?

          render json: {status: status_code(:not_found), message: "Follow Request not found." }
          return

        end

        # Confirmation Action mode
        if param_mode == Constants::FOLLOW_REQUEST_ACTION_MODE_CONFIRM

          if follow_request.is_cancelled   

            render json: {status: status_code(:unprocessable_entity), message: "Follow request is already cancelled"}

          elsif follow_request.is_confirmed

            render json: {status: status_code(:unprocessable_entity), message: "Follow request is already confirmed."}

          else

        	follow_request.is_cancelled = 0
        	follow_request.cancelled_on = nil
        	follow_request.is_confirmed = 1
        	follow_request.confirmed_on = Constants.get_current_date()

            if follow_request.save
              ## TODO Notification or some alert
               	
              render json: {status: status_code(:ok), message: ''}
            else
              render json: {status: status_code(:unprocessable_entity), message: Constants::SOMETHING_WENT_WRONG}
            end

          end  

        end

        # Cancel Action mode
        if param_mode == Constants::FOLLOW_REQUEST_ACTION_MODE_CANCEL

          if follow_request.is_cancelled   

            render json: {status: status_code(:unprocessable_entity), message: "Follow request is already cancelled"}

          elsif follow_request.is_confirmed

            render json: {status: status_code(:unprocessable_entity), message: "Follow request is confirmed so can't be cancelled now."}

          else

        	follow_request.is_cancelled = 1
        	follow_request.cancelled_on = Constants.get_current_date()
        	follow_request.is_confirmed = 0
        	follow_request.confirmed_on = nil

            if follow_request.save
              ## TODO Notification or some alert
               	
              render json: {status: status_code(:ok), message: ''}
            else
              render json: {status: status_code(:unprocessable_entity), message: Constants::SOMETHING_WENT_WRONG}
            end

          end  

        end

      rescue =>e
  
        ## Record Error
        # area, name, body, reason, related_info
        render json: {status: status_code(:unprocessable_entity), message: Constants::SOMETHING_WENT_WRONG, data: {errors: e.message}}

      end 	

	end	


  def param_user_to_follow_id

    params[Constants::REQUEST_PARAM_USER_TO_FOLLOW_ID]

  end  

  def param_id

    params[Constants::REQUEST_PARAM_ID]

  end 

  def param_mode

    params[Constants::REQUEST_PARAM_MODE]

  end 

end
